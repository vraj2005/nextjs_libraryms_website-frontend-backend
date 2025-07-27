import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'title'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subjects: { hasSome: [search] } }
      ]
    }

    if (status && status !== 'all') {
      if (status === 'Available') {
        where.availableCopies = { gt: 0 }
      } else if (status === 'Checked Out') {
        where.availableCopies = 0
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get total count for pagination
    const totalBooks = await prisma.book.count({ where })
    const totalPages = Math.ceil(totalBooks / limit)

    // Get books with pagination
    const books = await prisma.book.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })

    // Transform books to match frontend format
    const transformedBooks = books.map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      image: book.image,
      rating: book.rating,
      status: book.availableCopies > 0 ? 'Available' : 
              book.reservedCopies > 0 ? 'Reserved' : 'Checked Out',
      description: book.description,
      publishYear: book.publishYear,
      isbn: book.isbn,
      pages: book.pages,
      language: book.language,
      publisher: book.publisher,
      edition: book.edition,
      subjects: book.subjects,
      availability: {
        total: book.totalCopies,
        available: book.availableCopies,
        borrowed: book.borrowedCopies,
        reserved: book.reservedCopies
      },
      location: book.location,
      callNumber: book.callNumber,
      format: book.format,
      price: book.price
    }))

    return NextResponse.json({
      books: transformedBooks,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? await getUserFromToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    const book = await prisma.book.create({ data });
    return NextResponse.json({ book });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? await getUserFromToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    const book = await prisma.book.update({ where: { id: data.id }, data });
    return NextResponse.json({ book });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? await getUserFromToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
