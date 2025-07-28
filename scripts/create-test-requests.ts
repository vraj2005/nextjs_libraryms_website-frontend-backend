import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestRequests() {
  try {
    console.log('Creating test borrow requests...')

    // Get test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@user.com' }
    })

    if (!testUser) {
      console.log('Test user not found')
      return
    }

    // Get some books
    const books = await prisma.book.findMany({
      take: 3,
      include: { category: true }
    })

    if (books.length === 0) {
      console.log('No books found')
      return
    }

    // Create different types of requests
    const requests = [
      {
        userId: testUser.id,
        bookId: books[0].id,
        status: 'PENDING' as const,
        requestDate: new Date(),
        reason: 'Need this book for my research project'
      },
      {
        userId: testUser.id,
        bookId: books[1].id,
        status: 'APPROVED' as const,
        requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        approvedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        reason: 'Required reading for my course'
      },
      {
        userId: testUser.id,
        bookId: books[2].id,
        status: 'RETURNED' as const,
        requestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        approvedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        reason: 'Academic reference material'
      }
    ]

    for (const request of requests) {
      await prisma.borrowRequest.create({
        data: request
      })
      const book = books.find((book: any) => book.id === request.bookId)
      console.log(`Created ${request.status} request for book: ${book?.title}`)
    }

    console.log('Test requests created successfully!')

  } catch (error) {
    console.error('Error creating test requests:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestRequests()
