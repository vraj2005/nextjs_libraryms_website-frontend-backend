import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NotificationService } from '@/lib/notification-service'

// This API endpoint can be called by a cron job to send automated notifications
export async function POST(request: NextRequest) {
  try {
    // Verify this is being called by an authorized source (cron job, admin, etc.)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()
    let results = { sent: 0, failed: 0 }

    switch (action) {
      case 'due-date-reminders':
        results = await sendDueDateReminders()
        break
        
      case 'overdue-notifications':
        results = await sendOverdueNotifications()
        break
        
      case 'daily-notifications':
        // Send both due date reminders and overdue notifications
        const dueDateResults = await sendDueDateReminders()
        const overdueResults = await sendOverdueNotifications()
        results = {
          sent: dueDateResults.sent + overdueResults.sent,
          failed: dueDateResults.failed + overdueResults.failed
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: due-date-reminders, overdue-notifications, or daily-notifications' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Automated notifications completed`,
      action,
      results
    })

  } catch (error) {
    console.error('Automated notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send automated notifications' },
      { status: 500 }
    )
  }
}

// Send due date reminders (1, 3, and 7 days before due)
async function sendDueDateReminders() {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get books due in 1, 3, or 7 days
    const upcomingDue = await prisma.borrowRequest.findMany({
      where: {
        status: 'APPROVED',
        dueDate: {
          gte: now,
          lte: sevenDays
        },
        returnDate: null // Not returned yet
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    let sent = 0
    let failed = 0

    for (const request of upcomingDue) {
      if (!request.dueDate) continue

      const daysUntilDue = Math.ceil((request.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // Send reminders for 1, 3, and 7 days
      if ([1, 3, 7].includes(daysUntilDue)) {
        try {
          await NotificationService.notifyDueDateReminder(
            request.userId,
            request.book.title,
            daysUntilDue
          )
          sent++
        } catch (error) {
          console.error('Failed to send due date reminder:', error)
          failed++
        }
      }
    }

    console.log(`📅 Due date reminders: ${sent} sent, ${failed} failed`)
    return { sent, failed }

  } catch (error) {
    console.error('Due date reminder error:', error)
    throw error
  }
}

// Send overdue notifications and update status
async function sendOverdueNotifications() {
  try {
    const now = new Date()

    // Get overdue books
    const overdueBooks = await prisma.borrowRequest.findMany({
      where: {
        status: 'APPROVED',
        dueDate: {
          lt: now
        },
        returnDate: null // Not returned yet
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    let sent = 0
    let failed = 0

    for (const request of overdueBooks) {
      if (!request.dueDate) continue

      const daysOverdue = Math.ceil((now.getTime() - request.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      
      try {
        // Update status to OVERDUE if not already
        if (request.status !== 'OVERDUE') {
          await prisma.borrowRequest.update({
            where: { id: request.id },
            data: { status: 'OVERDUE' }
          })
        }

        // Send overdue notification
        await NotificationService.notifyBookOverdue(
          request.userId,
          request.book.title,
          daysOverdue
        )
        
        sent++
      } catch (error) {
        console.error('Failed to send overdue notification:', error)
        failed++
      }
    }

    console.log(`⏰ Overdue notifications: ${sent} sent, ${failed} failed`)
    return { sent, failed }

  } catch (error) {
    console.error('Overdue notification error:', error)
    throw error
  }
}

// GET endpoint for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Automated Notification Service',
    endpoints: {
      'POST /api/notifications/automated': 'Send automated notifications',
      'actions': ['due-date-reminders', 'overdue-notifications', 'daily-notifications']
    },
    usage: 'Call with POST request and action in body. Requires Authorization header with CRON_SECRET.'
  })
}
