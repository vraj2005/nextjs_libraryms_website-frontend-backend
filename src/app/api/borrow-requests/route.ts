import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { bookId, reason } = await request.json()

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { category: true }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    if (!book.isActive) {
      return NextResponse.json({ error: 'Book is not available for borrowing' }, { status: 400 })
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json({ error: 'No copies available for borrowing' }, { status: 400 })
    }

    // Check if user already has a pending or approved request for this book
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        userId: decoded.userId,
        bookId: bookId,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending or active request for this book' 
      }, { status: 400 })
    }

    // Create borrow request
    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        userId: decoded.userId,
        bookId: bookId,
        status: 'PENDING',
        notes: reason || null,
        requestDate: new Date()
      },
      include: {
        user: true,
        book: {
          include: {
            category: true
          }
        }
      }
    })

    // Create notification for user (confirmation)
    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: 'Borrow Request Submitted',
        message: `Your request to borrow "${book.title}" has been submitted successfully. You will be notified when an admin reviews your request.`,
        type: 'INFO'
      }
    })

    // Create notification for all admins
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'LIBRARIAN']
        },
        isActive: true
      }
    })

    // Create notifications for all admins
    const adminNotifications = admins.map((admin: any) => ({
      userId: admin.id,
      title: 'New Borrow Request',
      message: `${borrowRequest.user.firstName} ${borrowRequest.user.lastName} has requested to borrow "${book.title}". Please review the request.`,
      type: 'INFO' as const,
      createdBy: decoded.userId
    }))

    await prisma.notification.createMany({
      data: adminNotifications
    })

    // Log user history
    await prisma.userHistory.create({
      data: {
        userId: decoded.userId,
        action: 'BORROW_REQUEST_CREATED',
        description: `Requested to borrow book: ${book.title}`,
        metadata: JSON.stringify({
          bookId: book.id,
          bookTitle: book.title,
          requestId: borrowRequest.id,
          reason: reason || null
        })
      }
    })

    return NextResponse.json({
      message: 'Borrow request submitted successfully',
      requestId: borrowRequest.id,
      status: borrowRequest.status
    })

  } catch (error) {
    console.error('Error creating borrow request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause: any = {}

    // If user is not admin, only show their own requests
    if (decoded.role === 'USER') {
      whereClause.userId = decoded.userId
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      // Support multiple statuses separated by comma
      const statuses = status.split(',').map(s => s.trim().toUpperCase())
      if (statuses.length === 1) {
        whereClause.status = statuses[0]
      } else {
        whereClause.status = {
          in: statuses
        }
      }
    }

    const borrowRequests = await prisma.borrowRequest.findMany({
      where: whereClause,
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
          include: {
            category: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalRequests = await prisma.borrowRequest.count({
      where: whereClause
    })

    return NextResponse.json({
      requests: borrowRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching borrow requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}