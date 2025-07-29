import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all borrow requests with approved status for debugging
    const approvedRequests = await prisma.borrowRequest.findMany({
      where: {
        status: {
          in: ['APPROVED', 'RETURNED']
        }
      },
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
      }
    })

    return NextResponse.json({
      message: 'Debug data for approved/returned borrow requests',
      count: approvedRequests.length,
      requests: approvedRequests.map(req => ({
        id: req.id,
        status: req.status,
        requestDate: req.requestDate,
        approvedDate: req.approvedDate,
        dueDate: req.dueDate,
        returnDate: req.returnDate,
        notes: req.notes,
        bookTitle: req.book.title,
        userEmail: req.user.email
      }))
    })

  } catch (error) {
    console.error('Error fetching debug data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
