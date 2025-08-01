import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This webhook will be triggered by MongoDB Atlas when borrow request status changes
export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    // Verify webhook authenticity (you should add proper webhook signature verification)
    const webhookSecret = process.env.MONGODB_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.warn('MongoDB webhook secret not configured')
    }

    // Handle different types of changes
    const { operationType, fullDocument, updateDescription } = webhookData

    if (operationType === 'update' && fullDocument) {
      const borrowRequest = fullDocument
      
      // Check if status was updated
      if (updateDescription?.updatedFields?.status) {
        const newStatus = borrowRequest.status
        const borrowRequestId = borrowRequest._id

        // Get the full borrow request with user and book details
        const fullBorrowRequest = await prisma.borrowRequest.findUnique({
          where: { id: borrowRequestId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            book: {
              select: {
                title: true,
                author: true
              }
            }
          }
        })

        if (!fullBorrowRequest) {
          console.log('Borrow request not found for webhook:', borrowRequestId)
          return NextResponse.json({ message: 'Borrow request not found' }, { status: 404 })
        }

        // Create appropriate notification based on status change
        let notificationData = null

        switch (newStatus) {
          case 'APPROVED':
            notificationData = {
              userId: fullBorrowRequest.userId,
              title: 'Borrow Request Approved',
              message: `Your borrow request for "${fullBorrowRequest.book.title}" has been approved${borrowRequest.dueDate ? `. Due date: ${new Date(borrowRequest.dueDate).toDateString()}` : ''}.`,
              type: 'INFO' as const,
              createdBy: borrowRequest.approvedBy || null
            }
            break

          case 'REJECTED':
            notificationData = {
              userId: fullBorrowRequest.userId,
              title: 'Borrow Request Rejected',
              message: `Your borrow request for "${fullBorrowRequest.book.title}" has been rejected${borrowRequest.notes ? `. Reason: ${borrowRequest.notes}` : ''}.`,
              type: 'WARNING' as const,
              createdBy: borrowRequest.approvedBy || null
            }
            break

          case 'RETURNED':
            notificationData = {
              userId: fullBorrowRequest.userId,
              title: 'Book Returned',
              message: `"${fullBorrowRequest.book.title}" has been returned successfully.`,
              type: 'INFO' as const
            }
            break

          case 'OVERDUE':
            notificationData = {
              userId: fullBorrowRequest.userId,
              title: 'Book Overdue',
              message: `"${fullBorrowRequest.book.title}" is overdue. Please return it as soon as possible to avoid additional fines.`,
              type: 'ALERT' as const
            }
            break
        }

        // Create notification if we have data
        if (notificationData) {
          // Check if notification already exists to avoid duplicates
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: notificationData.userId,
              title: notificationData.title,
              message: notificationData.message,
              createdAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
              }
            }
          })

          if (!existingNotification) {
            await prisma.notification.create({
              data: notificationData
            })

            console.log(`📢 Webhook: Created notification for ${newStatus} status change for user ${fullBorrowRequest.userId}`)
          } else {
            console.log(`⏭️ Webhook: Skipped duplicate notification for ${newStatus} status change`)
          }
        }

        // Create user history entry
        await prisma.userHistory.create({
          data: {
            userId: fullBorrowRequest.userId,
            action: `BORROW_${newStatus}`,
            description: `Borrow request ${newStatus.toLowerCase()} for "${fullBorrowRequest.book.title}" (via direct database update)`,
            metadata: JSON.stringify({
              bookId: fullBorrowRequest.bookId,
              requestId: borrowRequestId,
              statusChange: newStatus,
              source: 'webhook'
            })
          }
        })

        return NextResponse.json({ 
          message: 'Webhook processed successfully',
          notificationCreated: !!notificationData
        })
      }
    }

    return NextResponse.json({ message: 'No action taken' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'MongoDB Atlas Borrow Request Webhook Endpoint',
    status: 'active'
  })
}
