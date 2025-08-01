
import { prisma } from '@/lib/prisma'

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ALERT' | 'CUSTOM'
  createdBy?: string | null
}

export class NotificationService {
  // Create a notification for a user
  static async createNotification(data: NotificationData) {
    try {
      // Check for duplicate notifications to avoid spam
      const recentDuplicate = await prisma.notification.findFirst({
        where: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
          }
        }
      })

      if (recentDuplicate) {
        console.log(`⏭️ Skipped duplicate notification for user ${data.userId}: ${data.title}`)
        return null
      }

      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          createdBy: data.createdBy,
          isRead: false
        }
      })

      console.log(`📢 Created notification for user ${data.userId}: ${data.title}`)
      return notification

    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  // Create notification when borrow request is approved
  static async notifyBorrowRequestApproved(
    userId: string,
    bookTitle: string,
    dueDate: Date,
    approvedBy?: string
  ) {
    return this.createNotification({
      userId,
      title: 'Borrow Request Approved! 📚',
      message: `Great news! Your borrow request for "${bookTitle}" has been approved. Due date: ${dueDate.toDateString()}. Happy reading!`,
      type: 'INFO',
      createdBy: approvedBy
    })
  }

  // Create notification when borrow request is rejected
  static async notifyBorrowRequestRejected(
    userId: string,
    bookTitle: string,
    reason?: string,
    rejectedBy?: string
  ) {
    return this.createNotification({
      userId,
      title: 'Borrow Request Update ❌',
      message: `Your borrow request for "${bookTitle}" has been rejected${reason ? `. Reason: ${reason}` : ''}. You can try requesting other available books.`,
      type: 'WARNING',
      createdBy: rejectedBy
    })
  }

  // Create notification when book is returned
  static async notifyBookReturned(
    userId: string,
    bookTitle: string,
    isOverdue: boolean = false
  ) {
    return this.createNotification({
      userId,
      title: `Book Returned ${isOverdue ? '⚠️' : '✅'}`,
      message: `"${bookTitle}" has been returned successfully${isOverdue ? '. A fine has been issued for the overdue return' : ''}. Thank you!`,
      type: isOverdue ? 'WARNING' : 'INFO'
    })
  }

  // Create notification for overdue book
  static async notifyBookOverdue(
    userId: string,
    bookTitle: string,
    daysOverdue: number
  ) {
    return this.createNotification({
      userId,
      title: 'Book Overdue! ⏰',
      message: `"${bookTitle}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please return it as soon as possible to avoid additional fines.`,
      type: 'ALERT'
    })
  }

  // Create notification for fine issued
  static async notifyFineIssued(
    userId: string,
    bookTitle: string,
    fineAmount: number,
    daysOverdue: number
  ) {
    return this.createNotification({
      userId,
      title: 'Fine Issued 💰',
      message: `A fine of ₹${fineAmount.toFixed(2)} has been issued for the ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue return of "${bookTitle}". Please pay at your earliest convenience.`,
      type: 'ALERT'
    })
  }

  // Create notification when new book is added (for admins to notify users)
  static async notifyNewBookAdded(
    userId: string,
    bookTitle: string,
    author: string,
    category: string
  ) {
    return this.createNotification({
      userId,
      title: 'New Book Available! 📖',
      message: `New book added: "${bookTitle}" by ${author} in ${category} category. Check it out now!`,
      type: 'INFO'
    })
  }

  // Create notification for due date reminder
  static async notifyDueDateReminder(
    userId: string,
    bookTitle: string,
    daysUntilDue: number
  ) {
    const urgency = daysUntilDue <= 1 ? 'ALERT' : daysUntilDue <= 3 ? 'WARNING' : 'INFO'
    const emoji = daysUntilDue <= 1 ? '🚨' : daysUntilDue <= 3 ? '⚠️' : '📅'
    
    return this.createNotification({
      userId,
      title: `Due Date Reminder ${emoji}`,
      message: `"${bookTitle}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. ${daysUntilDue <= 1 ? 'Please return it today to avoid fines!' : 'Please plan to return it soon.'}`,
      type: urgency
    })
  }

  // Bulk create notifications for multiple users
  static async createBulkNotifications(notifications: NotificationData[]) {
    try {
      const results = await Promise.allSettled(
        notifications.map(notification => this.createNotification(notification))
      )
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      console.log(`📢 Bulk notifications: ${successful} successful, ${failed} failed`)
      
      return { successful, failed }
    } catch (error) {
      console.error('Bulk notification creation failed:', error)
      throw error
    }
  }
}
