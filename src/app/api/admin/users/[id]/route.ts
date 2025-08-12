import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const id = params.id
    if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 })

    const body = await request.json()
    // Allow editing basic fields only
  const { username, firstName, lastName, email, phone, address, role, isActive } = body

    // Validate role (optional)
    const allowedRoles = ['ADMIN', 'LIBRARIAN', 'USER']
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
  username: username ?? undefined,
  firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        role: role ?? undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      }
    })

    const { password: _, ...userWithoutPassword } = updated as any
    return NextResponse.json({ user: userWithoutPassword }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Admin user PUT error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const id = params.id
    if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
