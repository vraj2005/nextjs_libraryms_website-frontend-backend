import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

function startOfToday() {
  const d = new Date()
  d.setHours(0,0,0,0)
  return d
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)
    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = startOfToday()

    const [
      totalBooks,
      totalMembers,
      borrowedBooks,
      overdueBooks,
      newMembers,
      reservations,
      booksWithImages,
      recentBorrowRequests,
      recentBookCreations
    ] = await Promise.all([
      prisma.book.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true, role: 'USER' } }),
      prisma.borrowRequest.count({ where: { status: { in: ['APPROVED','OVERDUE'] } } }),
      prisma.borrowRequest.count({ where: { status: 'OVERDUE' } }),
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: today } } }),
      prisma.borrowRequest.count({ where: { status: 'PENDING' } }),
      prisma.book.count({ where: { image: { not: null } } }),
      prisma.borrowRequest.findMany({
        include: {
          user: { select: { firstName: true, lastName: true } },
          book: { select: { title: true } }
        },
        orderBy: { requestDate: 'desc' },
        take: 8
      }),
      prisma.bookHistory.findMany({
        where: { action: 'CREATED' },
        orderBy: { timestamp: 'desc' },
        take: 5,
        include: { book: { select: { title: true, author: true } } }
      })
    ])

    // Build activities (mix borrow requests + book creations)
    const activities: any[] = []

    recentBorrowRequests.forEach(br => {
      activities.push({
        id: `br-${br.id}`,
        type: br.status === 'PENDING' ? 'request' : (br.status === 'OVERDUE' ? 'overdue' : 'borrow'),
        action: br.status === 'PENDING' ? 'Borrow Request' : (br.status === 'OVERDUE' ? 'Overdue Book' : 'Borrow Activity'),
        details: br.book?.title,
        member: `${br.user?.firstName || ''} ${br.user?.lastName || ''}`.trim(),
        time: br.requestDate,
        status: br.status
      })
    })

    recentBookCreations.forEach(bh => {
      activities.push({
        id: `bh-${bh.id}`,
        type: 'book',
        action: 'New Book Added',
        details: bh.book ? `${bh.book.title} by ${bh.book.author}` : 'Book Added',
        member: 'System',
        time: bh.timestamp,
        status: 'CREATED'
      })
    })

    // Sort combined by time desc and limit
    activities.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const recentActivities = activities.slice(0, 10)

    return NextResponse.json({
      stats: {
        totalBooks,
        totalMembers,
        borrowedBooks,
        overdueBooks,
        newMembers,
        reservations,
        digitalResources: booksWithImages, // proxy metric
        studyRooms: 0 // no model yet
      },
      recentActivities
    })
  } catch (error) {
    console.error('Admin dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
