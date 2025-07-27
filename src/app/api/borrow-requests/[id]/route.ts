import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user || !['ADMIN', 'LIBRARIAN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { action, adminResponse } = await request.json()
    const requestId = (await params).id

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      )
    }

    // Find the borrow request
    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id: requestId },
      include: {
        book: true,
        user: true
      }
    })

    if (!borrowRequest) {
      return NextResponse.json(
        { error: 'Borrow request not found' },
        { status: 404 }
      )
    }

    if (borrowRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      )
    }

    if (action === 'APPROVE') {
      // Check if book is still available
      if (borrowRequest.book.availableCopies <= 0) {
        return NextResponse.json(
          { error: 'Book is no longer available' },
          { status: 400 }
        )
      }

      // Start transaction
      await prisma.$transaction(async (tx: any) => {
        // Update borrow request status
        await tx.borrowRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            adminResponse,
            adminId: user.id,
            responseDate: new Date()
          }
        })

        // Create borrowed book record
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + borrowRequest.requestedDays)

        await tx.borrowedBook.create({
          data: {
            userId: borrowRequest.userId,
            bookId: borrowRequest.bookId,
            dueDate,
            requestId: requestId
          }
        })

        // Update book availability
        await tx.book.update({
          where: { id: borrowRequest.bookId },
          data: {
            availableCopies: { decrement: 1 },
            borrowedCopies: { increment: 1 }
          }
        })

        // Create notification for user
        await tx.notification.create({
          data: {
            userId: borrowRequest.userId,
            title: 'Borrow Request Approved',
            message: `Your request to borrow "${borrowRequest.book.title}" has been approved! Please collect the book from the library. Due date: ${dueDate.toLocaleDateString()}.`,
            type: 'BORROW_APPROVED'
          }
        })
      })

    } else if (action === 'REJECT') {
      // Update borrow request status
      await prisma.borrowRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminResponse,
          adminId: user.id,
          responseDate: new Date()
        }
      })

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: borrowRequest.userId,
          title: 'Borrow Request Rejected',
          message: `Your request to borrow "${borrowRequest.book.title}" has been rejected. ${adminResponse ? `Reason: ${adminResponse}` : ''}`,
          type: 'BORROW_REJECTED'
        }
      })
    }

    return NextResponse.json({
      message: `Borrow request ${action.toLowerCase()}d successfully`
    })

  } catch (error) {
    console.error('Error processing borrow request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
