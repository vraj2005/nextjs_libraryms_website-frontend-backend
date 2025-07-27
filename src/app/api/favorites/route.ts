import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth'

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

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id
      },
      include: {
        book: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const favoriteBooks = favorites.map((favorite: any) => ({
      id: favorite.book.id,
      title: favorite.book.title,
      author: favorite.book.author,
      category: favorite.book.category,
      image: favorite.book.image,
      rating: favorite.book.rating,
      status: favorite.book.availableCopies > 0 ? 'Available' : 
              favorite.book.reservedCopies > 0 ? 'Reserved' : 'Checked Out',
      description: favorite.book.description,
      publishYear: favorite.book.publishYear,
      isbn: favorite.book.isbn,
      pages: favorite.book.pages,
      language: favorite.book.language,
      publisher: favorite.book.publisher,
      edition: favorite.book.edition,
      subjects: favorite.book.subjects,
      availability: {
        total: favorite.book.totalCopies,
        available: favorite.book.availableCopies,
        borrowed: favorite.book.borrowedCopies,
        reserved: favorite.book.reservedCopies
      },
      location: favorite.book.location,
      callNumber: favorite.book.callNumber,
      format: favorite.book.format,
      price: favorite.book.price,
      favoriteId: favorite.id,
      addedToFavoritesAt: favorite.createdAt
    }))

    return NextResponse.json({
      favorites: favoriteBooks
    })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { bookId } = await request.json()

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: bookId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Book is already in favorites' },
        { status: 400 }
      )
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        bookId: bookId
      },
      include: {
        book: true
      }
    })

    return NextResponse.json({
      message: 'Book added to favorites',
      favorite
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Find and delete favorite
    const deletedFavorite = await prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: bookId
        }
      }
    })

    return NextResponse.json({
      message: 'Book removed from favorites'
    })

  } catch (error: any) {
    console.error('Error removing from favorites:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Book not found in favorites' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
