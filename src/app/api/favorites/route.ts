import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// Ensure this route is always treated as dynamic and not statically cached
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization')
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
		}
		const token = authHeader.substring(7)
		const user = await getUserFromToken(token)
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })

			const favorites = await (prisma as any).favorite.findMany({
			where: { userId: user.id },
			include: {
				book: {
					include: { category: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return NextResponse.json({
				favorites: favorites.map((f: any) => ({
				id: f.id,
				createdAt: f.createdAt,
				book: f.book
			}))
		}, { headers: { 'Cache-Control': 'no-store' } })
	} catch (error) {
		console.error('Favorites GET error:', error)
		return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
	}
}

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization')
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
		}
		const token = authHeader.substring(7)
		const user = await getUserFromToken(token)
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })

		const { bookId } = await request.json()
		if (!bookId) return NextResponse.json({ error: 'bookId is required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })

		// ensure book exists
		const book = await prisma.book.findUnique({ where: { id: bookId } })
		if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })

		// upsert-like: prevent duplicates
		const existing = await (prisma as any).favorite.findFirst({ where: { userId: user.id, bookId } })
		if (existing) return NextResponse.json({ message: 'Already in favorites' }, { status: 200, headers: { 'Cache-Control': 'no-store' } })

		const favorite = await (prisma as any).favorite.create({
			data: { userId: user.id, bookId }
		})

		return NextResponse.json({ message: 'Added to favorites', favorite }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
	} catch (error) {
		console.error('Favorites POST error:', error)
		return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization')
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
		}
		const token = authHeader.substring(7)
		const user = await getUserFromToken(token)
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })

		const { searchParams } = new URL(request.url)
		const bookId = searchParams.get('bookId')
		if (!bookId) return NextResponse.json({ error: 'bookId is required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })

		const existing = await (prisma as any).favorite.findFirst({ where: { userId: user.id, bookId } })
		if (!existing) return NextResponse.json({ message: 'Not in favorites' }, { status: 200, headers: { 'Cache-Control': 'no-store' } })

		await (prisma as any).favorite.delete({ where: { id: existing.id } })
		return NextResponse.json({ message: 'Removed from favorites' }, { headers: { 'Cache-Control': 'no-store' } })
	} catch (error) {
		console.error('Favorites DELETE error:', error)
		return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
	}
}
