import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Token required.' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { action, notes } = await request.json()
    
    if (!action || !['APPROVE', 'REJECT', 'RETURN'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE, REJECT, or RETURN' },
        { status: 400 }
      )
    }

    // Find the borrow request
    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id: params.id },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!borrowRequest) {
      return NextResponse.json(
        { error: 'Borrow request not found' },
        { status: 404 }
      )
    }

    if (action === 'APPROVE') {
      if (borrowRequest.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Request is not pending' },
          { status: 400 }
        )
      }

      if (borrowRequest.book.availableCopies <= 0) {
        return NextResponse.json(
          { error: 'Book is no longer available' },
          { status: 400 }
        )
      }

      // Calculate due date (14 days from now)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)

      // Update borrow request and book availability
      const [updatedRequest] = await prisma.$transaction([
        prisma.borrowRequest.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            approvedDate: new Date(),
            dueDate,
            approvedBy: user.userId,
            notes
          }
        }),
        prisma.book.update({
          where: { id: borrowRequest.bookId },
          data: {
            availableCopies: {
              decrement: 1
            }
          }
        })
      ])

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: borrowRequest.userId,
          title: 'Borrow Request Approved',
          message: `Your borrow request for "${borrowRequest.book.title}" has been approved. Due date: ${dueDate.toDateString()}`,
          type: 'INFO'
        }
      })

      // Create user history
      await prisma.userHistory.create({
        data: {
          userId: borrowRequest.userId,
          action: 'BORROW_APPROVED',
          description: `Borrow request approved for "${borrowRequest.book.title}"`,
          metadata: JSON.stringify({ 
            bookId: borrowRequest.bookId, 
            requestId: borrowRequest.id,
            dueDate 
          })
        }
      })

      return NextResponse.json({
        message: 'Borrow request approved successfully',
        borrowRequest: updatedRequest
      })

    } else if (action === 'REJECT') {
      if (borrowRequest.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Request is not pending' },
          { status: 400 }
        )
      }

      const updatedRequest = await prisma.borrowRequest.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          approvedBy: user.userId,
          notes
        }
      })

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: borrowRequest.userId,
          title: 'Borrow Request Rejected',
          message: `Your borrow request for "${borrowRequest.book.title}" has been rejected. ${notes ? `Reason: ${notes}` : ''}`,
          type: 'WARNING'
        }
      })

      // Create user history
      await prisma.userHistory.create({
        data: {
          userId: borrowRequest.userId,
          action: 'BORROW_REJECTED',
          description: `Borrow request rejected for "${borrowRequest.book.title}"`,
          metadata: JSON.stringify({ 
            bookId: borrowRequest.bookId, 
            requestId: borrowRequest.id,
            reason: notes 
          })
        }
      })

      return NextResponse.json({
        message: 'Borrow request rejected',
        borrowRequest: updatedRequest
      })

    } else if (action === 'RETURN') {
      if (borrowRequest.status !== 'APPROVED') {
        return NextResponse.json(
          { error: 'Request is not approved' },
          { status: 400 }
        )
      }

      const returnDate = new Date()
      const isOverdue = borrowRequest.dueDate && returnDate > borrowRequest.dueDate

      // Update borrow request and book availability
      const [updatedRequest] = await prisma.$transaction([
        prisma.borrowRequest.update({
          where: { id: params.id },
          data: {
            status: isOverdue ? 'OVERDUE' : 'RETURNED',
            returnDate,
            notes: notes || borrowRequest.notes
          }
        }),
        prisma.book.update({
          where: { id: borrowRequest.bookId },
          data: {
            availableCopies: {
              increment: 1
            }
          }
        })
      ])

      // Create fine if overdue
      if (isOverdue && borrowRequest.dueDate) {
        const daysOverdue = Math.ceil((returnDate.getTime() - borrowRequest.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        const fineAmount = daysOverdue * 1.0 // $1 per day

        await prisma.fine.create({
          data: {
            userId: borrowRequest.userId,
            borrowRequestId: borrowRequest.id,
            amount: fineAmount,
            daysOverdue
          }
        })

        // Create notification for fine
        await prisma.notification.create({
          data: {
            userId: borrowRequest.userId,
            title: 'Overdue Fine Issued',
            message: `A fine of $${fineAmount.toFixed(2)} has been issued for the overdue return of "${borrowRequest.book.title}"`,
            type: 'ALERT'
          }
        })
      }

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: borrowRequest.userId,
          title: 'Book Returned',
          message: `"${borrowRequest.book.title}" has been returned successfully.${isOverdue ? ' A fine has been issued for the overdue return.' : ''}`,
          type: isOverdue ? 'WARNING' : 'INFO'
        }
      })

      // Create user history
      await prisma.userHistory.create({
        data: {
          userId: borrowRequest.userId,
          action: 'BOOK_RETURNED',
          description: `Returned "${borrowRequest.book.title}"${isOverdue ? ' (overdue)' : ''}`,
          metadata: JSON.stringify({ 
            bookId: borrowRequest.bookId, 
            requestId: borrowRequest.id,
            returnDate,
            isOverdue
          })
        }
      })

      return NextResponse.json({
        message: `Book returned successfully${isOverdue ? ' with overdue fine' : ''}`,
        borrowRequest: updatedRequest
      })
    }

  } catch (error) {
    console.error('Borrow request update error:', error)
    return NextResponse.json(
      { error: 'Failed to update borrow request' },
      { status: 500 }
    )
  }
}
