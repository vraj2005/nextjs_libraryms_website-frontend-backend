import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { NotificationService } from '@/lib/notification-service'

const FINE_PER_DAY = parseInt(process.env.FINE_PER_DAY || '100', 10) // Added fine constant

// This API endpoint can be called by a cron job to send automated notifications
export async function POST(request: NextRequest) {
  try {
    // Verify this is being called by an authorized source (cron job or admin user)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

    let authorized = false

    if (authHeader === `Bearer ${cronSecret}`) {
      authorized = true
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const callingUser = await getUserFromToken(token)
        if (callingUser && callingUser.role === 'ADMIN') {
          authorized = true
        }
      } catch (err) {
        // ignore token errors
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()
    let results: { sent: number; failed: number; found?: number; totalFine?: number } = { sent: 0, failed: 0 } // extended shape

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
          failed: dueDateResults.failed + overdueResults.failed,
          found: (dueDateResults.found || 0) + (overdueResults.found || 0),
          totalFine: overdueResults.totalFine || 0
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

// Send due date reminders (3, 2, and 1 days before due)
async function sendDueDateReminders() {
  try {
    const now = new Date()
    const oneDay = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const twoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Get books due in 1, 2, or 3 days
    const upcomingDue = await prisma.borrowRequest.findMany({
      where: {
        status: 'APPROVED',
        dueDate: {
          gte: now,
          lte: threeDays
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

    // Debug: log found requests
    if (upcomingDue.length === 0) {
      console.warn('No upcoming due borrow requests found for reminders.')
    } else {
      console.log('Upcoming due borrow requests:', upcomingDue.map(r => ({
        id: r.id,
        userId: r.userId,
        bookTitle: r.book.title,
        dueDate: r.dueDate
      })))
    }

    let sent = 0
    let failed = 0

    for (const request of upcomingDue) {
      if (!request.dueDate) continue

      const daysUntilDue = Math.ceil((request.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      // Send reminders for 1, 2, and 3 days
      if ([1, 2, 3].includes(daysUntilDue)) {
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

    console.log(`📅 Due date reminders: ${sent} sent, ${failed} failed (found ${upcomingDue.length})`)
    return { sent, failed, found: upcomingDue.length }

  } catch (error) {
    console.error('Due date reminder error:', error)
    throw error
  }
}

// Send overdue notifications and update status
async function sendOverdueNotifications() {
  try {
    const now = new Date()
    // Get overdue books: either already marked OVERDUE or dueDate <= now, and not returned
    const overdueBooks = await prisma.borrowRequest.findMany({
      where: {
        AND: [
          { returnDate: null },
          {
            OR: [
              { status: 'OVERDUE' },
              { dueDate: { lte: now } }
            ]
          }
        ]
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

    // Debug: log found requests
    if (overdueBooks.length === 0) {
      console.warn('No overdue borrow requests found for overdue notifications.')
    } else {
      console.log('Overdue borrow requests:', overdueBooks.map(r => ({
        id: r.id,
        userId: r.userId,
        bookTitle: r.book.title,
        dueDate: r.dueDate,
        status: r.status
      })))
    }

    let sent = 0
    let failed = 0
    let totalFine = 0 // track total fine

    console.log(`Found ${overdueBooks.length} overdue borrow requests to process`)

    for (const request of overdueBooks) {
      if (!request.dueDate) continue

      const rawDaysOverdue = Math.ceil((now.getTime() - request.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysOverdue = Math.max(1, rawDaysOverdue)
      const fine = daysOverdue * FINE_PER_DAY
      totalFine += fine
      try {
        // Update status to OVERDUE if not already
        if (request.status !== 'OVERDUE') {
          await prisma.borrowRequest.update({
            where: { id: request.id },
            data: { status: 'OVERDUE' }
          })
        }

        // Send overdue notification (extend call with fine if method supports it)
        try {
          const fn: any = (NotificationService as any).notifyBookOverdueWithFine || (NotificationService as any).notifyBookOverdue
          await fn(request.userId, request.book.title, daysOverdue, fine)
        } catch {
          await NotificationService.notifyBookOverdue(
            request.userId,
            request.book.title,
            daysOverdue
          )
        }
        sent++
      } catch (error) {
        console.error('Failed to send overdue notification:', error)
        failed++
      }
    }

    console.log(`⏰ Overdue notifications: ${sent} sent, ${failed} failed (found ${overdueBooks.length}) | Total fine = ₹${totalFine}`)
    return { sent, failed, found: overdueBooks.length, totalFine }

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
