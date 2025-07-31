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

    // Get full user profile with additional stats
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            borrowRequests: true,
            notifications: {
              where: {
                isRead: false
              }
            },
            fines: {
              where: {
                isPaid: false
              }
            }
          }
        }
      }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get recent borrow requests
    const recentBorrowRequests = await prisma.borrowRequest.findMany({
      where: { userId: user.id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            image: true
          }
        }
      },
      orderBy: { requestDate: 'desc' },
      take: 5
    })

    return NextResponse.json({
      user: userProfile,
      stats: {
        totalBorrowRequests: userProfile._count.borrowRequests,
        unreadNotifications: userProfile._count.notifications,
        unpaidFines: userProfile._count.fines
      },
      recentBorrowRequests
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const updateData = await request.json()
    
    // Validate and sanitize update data
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'profileImage']
    const sanitizedData: any = {}
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field]
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: sanitizedData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
