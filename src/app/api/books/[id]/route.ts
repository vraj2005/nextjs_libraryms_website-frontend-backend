import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      include: {
        category: true,
        _count: {
          select: {
            borrowRequests: {
              where: {
                status: 'PENDING'
              }
            }
          }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })

  } catch (error) {
    console.error('Book fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current book for history
    const currentBook = await prisma.book.findUnique({
      where: { id: params.id }
    })

    if (!currentBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
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
      publisher 
    } = await request.json()

    // Check if category exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
    }

    // Calculate available copies if total copies changed
    let availableCopies = currentBook.availableCopies
    if (totalCopies !== undefined && totalCopies !== currentBook.totalCopies) {
      const borrowedCount = currentBook.totalCopies - currentBook.availableCopies
      availableCopies = totalCopies - borrowedCount
      
      if (availableCopies < 0) {
        return NextResponse.json(
          { error: 'Cannot reduce total copies below currently borrowed amount' },
          { status: 400 }
        )
      }
    }

    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(image !== undefined && { image }),
        ...(totalCopies !== undefined && { totalCopies, availableCopies }),
        ...(publishedYear !== undefined && { publishedYear }),
        ...(publisher !== undefined && { publisher })
      },
      include: {
        category: true
      }
    })

    // Create book history
    await prisma.bookHistory.create({
      data: {
        bookId: updatedBook.id,
        action: 'UPDATED',
        userId: user.userId,
        oldData: JSON.stringify(currentBook),
        newData: JSON.stringify(updatedBook)
      }
    })

    return NextResponse.json({
      message: 'Book updated successfully',
      book: updatedBook
    })

  } catch (error) {
    console.error('Book update error:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        borrowRequests: {
          where: {
            status: {
              in: ['PENDING', 'APPROVED']
            }
          }
        }
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Check if book has active borrow requests
    if (book.borrowRequests.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book with active borrow requests' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    const deletedBook = await prisma.book.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Create book history
    await prisma.bookHistory.create({
      data: {
        bookId: deletedBook.id,
        action: 'DELETED',
        userId: user.userId,
        oldData: JSON.stringify(book)
      }
    })

    return NextResponse.json({
      message: 'Book deleted successfully'
    })

  } catch (error) {
    console.error('Book deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}
