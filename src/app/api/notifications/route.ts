import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause - STRICTLY filter by current user's ID only
    const where: any = {
      userId: user.id  // This ensures only the logged-in user's notifications are returned
    }

    if (unreadOnly) {
      where.isRead = false
    }

    console.log(`📢 Fetching notifications for user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Get total count for pagination - scoped to current user only
    const totalNotifications = await prisma.notification.count({ where })
    const totalPages = Math.ceil(totalNotifications / limit)

    // Get notifications with pagination - scoped to current user only
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        userId: true, // Include userId for client-side verification
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
        // Exclude sensitive fields, keep only what's needed
      }
    })

    // Get unread count - scoped to current user only
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    })

    console.log(`📊 Returning ${notifications.length} notifications (${unreadCount} unread) for user: ${user.firstName} ${user.lastName}`);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications,
        limit
      },
      // Additional metadata for verification
      userInfo: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName
      }
    })

  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { action, notificationIds } = await request.json()

    if (action === 'markAllAsRead') {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,  // Only update notifications for the current user
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        message: 'All notifications marked as read'
      })
    }

    if (action === 'markAsRead' && notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id  // Double security: only update if notification belongs to current user
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        message: 'Notifications marked as read'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing notificationIds' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Notifications update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
