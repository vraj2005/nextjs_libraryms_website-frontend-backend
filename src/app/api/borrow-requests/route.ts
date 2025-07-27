import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { bookId, requestedDays = 14 } = await request.json()

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: 'Book is not available for borrowing' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request for this book
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        userId: user.id,
        bookId: bookId,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this book' },
        { status: 400 }
      )
    }

    // Check if user already has this book borrowed
    const existingBorrow = await prisma.borrowedBook.findFirst({
      where: {
        userId: user.id,
        bookId: bookId,
        status: 'BORROWED'
      }
    })

    if (existingBorrow) {
      return NextResponse.json(
        { error: 'You already have this book borrowed' },
        { status: 400 }
      )
    }

    // Create borrow request
    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        userId: user.id,
        bookId: bookId,
        requestedDays,
        status: 'PENDING'
      },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            membershipId: true
          }
        }
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Borrow Request Submitted',
        message: `Your request to borrow "${book.title}" has been submitted and is pending admin approval.`,
        type: 'BORROW_REQUEST'
      }
    })

    // Create notification for admin (find all admin users)
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'LIBRARIAN'] }
      }
    })

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Borrow Request',
          message: `${user.name} (${user.membershipId}) has requested to borrow "${book.title}".`,
          type: 'BORROW_REQUEST'
        }
      })
    }

    return NextResponse.json({
      message: 'Borrow request submitted successfully',
      request: borrowRequest
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating borrow request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause based on user role
    const where: any = {}
    
    if (user.role === 'MEMBER') {
      where.userId = user.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Get total count for pagination
    const totalRequests = await prisma.borrowRequest.count({ where })
    const totalPages = Math.ceil(totalRequests / limit)

    // Get requests with pagination
    const requests = await prisma.borrowRequest.findMany({
      where,
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            membershipId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages,
        totalRequests,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching borrow requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
