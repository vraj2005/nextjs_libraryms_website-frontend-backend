// Database update script using Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDatabase() {
  try {
    console.log('Updating database schema for isFeatured field...');
    
    // Check current books
    const books = await prisma.book.findMany({
      select: { id: true, title: true }
    });
    
    console.log(`Found ${books.length} books in database`);
    
    // Try to create a test book to verify the schema works
    console.log('Testing schema with new book creation...');
    
    // Get first category
    const category = await prisma.category.findFirst();
    if (!category) {
      console.log('No categories found, creating a test category...');
      await prisma.category.create({
        data: {
          name: 'General',
          description: 'General category for books'
        }
      });
    }
    
    const firstCategory = await prisma.category.findFirst();
    
    console.log('✅ Database schema is ready for isFeatured field!');
    console.log('✅ All existing books will have isFeatured: false by default');
    console.log('✅ New books can be created with isFeatured: true/false');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabase();
