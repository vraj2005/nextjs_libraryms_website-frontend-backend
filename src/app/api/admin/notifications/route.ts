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

    // Check if user is admin or librarian
    if (!['ADMIN', 'LIBRARIAN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log(`📢 Fetching admin notifications for: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Get all pending borrow requests as notifications for admin
    const pendingRequests = await prisma.borrowRequest.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        requestDate: 'desc'
      },
      skip: unreadOnly ? 0 : (page - 1) * limit,
      take: unreadOnly ? undefined : limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true
          }
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true
          }
        }
      }
    }) as Array<
      {
        id: string;
        status: string;
        userId: string;
        bookId: string;
        requestDate: Date;
        approvedDate: Date | null;
        dueDate: Date | null;
        returnDate: Date | null;
        approvedBy: string | null;
        notes: string | null;
        createdAt: Date;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          username: string;
        };
        book: {
          id: string;
          title: string;
          author: string;
          isbn: string;
        };
      }
    >

    // Transform borrow requests into notification format
    const notifications = pendingRequests.map(request => ({
      id: `borrow_${request.id}`,
      type: 'borrow_request',
      title: 'New Book Borrow Request',
      message: `${request.user.firstName} ${request.user.lastName} requested to borrow "${request.book.title}" by ${request.book.author}`,
      createdAt: request.createdAt.toISOString(),
      isRead: false, // All pending requests are considered unread
      priority: 'medium',
      requestId: request.id,
      userId: request.userId,
      bookId: request.bookId,
      userInfo: {
        name: `${request.user.firstName} ${request.user.lastName}`,
        email: request.user.email,
        username: request.user.username
      },
      bookInfo: {
        title: request.book.title,
        author: request.book.author,
        isbn: request.book.isbn
      }
    }))

    const totalNotifications = pendingRequests.length
    const unreadCount = totalNotifications // All pending requests are unread
    const totalPages = Math.ceil(totalNotifications / limit)

    console.log(`📊 Returning ${notifications.length} admin notifications (${unreadCount} unread) for admin: ${user.firstName} ${user.lastName}`);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications,
        limit
      },
      adminInfo: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Admin notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin notifications' },
      { status: 500 }
    )
  }
}

// Mark notification as read (for future use)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Token required.' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)
    
    if (!user || !['ADMIN', 'LIBRARIAN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { notificationId } = await request.json()

    // For now, we just return success since we're using borrow requests as notifications
    // In the future, this could update a separate admin_notifications table
    
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
