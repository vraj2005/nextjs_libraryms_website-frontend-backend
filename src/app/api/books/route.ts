import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// Generate unique ISBN-13
function generateISBN13(): string {
  const prefix = '978'
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
  let isbn = prefix + random
  
  // Calculate check digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const checkDigit = (10 - (sum % 10)) % 10
  
  return isbn + checkDigit
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'title'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get total count for pagination
    const totalBooks = await prisma.book.count({ where })
    const totalPages = Math.ceil(totalBooks / limit)

    // Get books with pagination and include category
    const books = await prisma.book.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true
      }
    })

    return NextResponse.json({
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        limit
      }
    })

  } catch (error) {
    console.error('Books fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { 
      title, 
      author, 
      description, 
      categoryId, 
      image, 
      totalCopies, 
      publishedYear, 
      publisher,
      isFeatured 
    } = await request.json()

    if (!title || !author || !categoryId) {
      return NextResponse.json(
        { error: 'Title, author, and category are required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Generate unique ISBN
    let isbn = generateISBN13()
    let existingBook = await prisma.book.findUnique({ where: { isbn } })
    
    while (existingBook) {
      isbn = generateISBN13()
      existingBook = await prisma.book.findUnique({ where: { isbn } })
    }

    const book = await prisma.book.create({
      data: {
        isbn,
        title,
        author,
        description,
        categoryId,
        image,
        totalCopies: totalCopies || 1,
        availableCopies: totalCopies || 1,
        publishedYear,
        publisher,
        ...(isFeatured !== undefined && { isFeatured })
      },
      include: {
        category: true
      }
    })

    // Create book history
    await prisma.bookHistory.create({
      data: {
        bookId: book.id,
        action: 'CREATED',
        userId: user.id,
        newData: JSON.stringify(book)
      }
    })

    return NextResponse.json({
      message: 'Book created successfully',
      book
    }, { status: 201 })

  } catch (error) {
    console.error('Book creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create book', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
