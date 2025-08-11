import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalBooks, activeMembers] = await Promise.all([
      prisma.book.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true, role: 'USER' } })
    ])

    return NextResponse.json({ totalBooks, activeMembers })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
