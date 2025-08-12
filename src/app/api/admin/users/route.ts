import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
    }
    const token = authHeader.substring(7)
    const currentUser = await getUserFromToken(token)
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'LIBRARIAN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
    }

    const users = await prisma.user.findMany({
      include: {
        borrowRequests: {
          select: { status: true, requestDate: true, approvedDate: true, returnDate: true, dueDate: true }
        },
        fines: { select: { amount: true, isPaid: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

  const mapped = users.map((u, idx) => {
      const booksIssued = u.borrowRequests.filter(br => br.status !== 'RETURNED' && br.status !== 'REJECTED').length
      const fineAmount = u.fines.filter(f => !f.isPaid).reduce((sum, f) => sum + (f.amount || 0), 0)
      const lastDates: Date[] = []
      u.borrowRequests.forEach(br => {
        if (br.requestDate) lastDates.push(new Date(br.requestDate))
        if (br.approvedDate) lastDates.push(new Date(br.approvedDate))
        if (br.returnDate) lastDates.push(new Date(br.returnDate))
        if (br.dueDate) lastDates.push(new Date(br.dueDate))
      })
      lastDates.push(new Date(u.updatedAt))
      const lastActivityDate = new Date(Math.max(...lastDates.map(d => d.getTime())))
      const joinDate = new Date(u.createdAt)
      const expiryDate = new Date(joinDate)
      expiryDate.setFullYear(joinDate.getFullYear() + 1)

      const name = `${u.firstName} ${u.lastName}`.trim()
      const membershipId = `LIB${u.id.slice(-5).toUpperCase()}`
      const membershipType = u.role === 'ADMIN' ? 'Premium' : u.role === 'LIBRARIAN' ? 'Standard' : 'Student'
      const status = u.isActive ? 'Active' : 'Suspended'

      const format = (d: Date) => d.toISOString().slice(0, 10)

      return {
        userId: u.id,
        id: idx + 1, // sequential ID for UI table
        membershipId,
        username: u.username,
        name: name || u.username || u.email,
        email: u.email,
        phone: u.phone || '',
        address: u.address || '',
        membershipType,
        status,
        joinDate: format(joinDate),
        expiryDate: format(expiryDate),
        booksIssued,
        fineAmount,
        lastActivity: format(lastActivityDate),
      }
    })

    return NextResponse.json({ users: mapped }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
