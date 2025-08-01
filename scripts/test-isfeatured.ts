// Script to update existing books with isFeatured field and test the new schema
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateExistingBooks() {
  try {
    console.log('Checking existing books...')
    
    // Get all books to see current structure
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        isFeatured: true
      }
    })
    
    console.log(`Found ${books.length} books`)
    console.log('Sample books:', books.slice(0, 3))
    
    // Test creating a new book with isFeatured field
    console.log('\nTesting book creation with isFeatured field...')
    
    // First, get a category ID to use
    const category = await prisma.category.findFirst()
    if (!category) {
      console.log('No categories found. Creating a test category...')
      const testCategory = await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'Test category for isFeatured testing'
        }
      })
      console.log('Created test category:', testCategory.id)
    }
    
    const categoryId = category?.id || (await prisma.category.findFirst())?.id
    
    if (categoryId) {
      const testBook = await prisma.book.create({
        data: {
          isbn: '9780000000000',
          title: 'Test Featured Book',
          author: 'Test Author',
          description: 'A test book to verify isFeatured field',
          categoryId: categoryId,
          isFeatured: true
        }
      })
      
      console.log('Successfully created book with isFeatured field:', {
        id: testBook.id,
        title: testBook.title,
        isFeatured: testBook.isFeatured
      })
      
      // Clean up test book
      await prisma.book.delete({ where: { id: testBook.id } })
      console.log('Test book cleaned up')
    }
    
    console.log('\n✅ Schema update successful! The isFeatured field is working correctly.')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingBooks()
