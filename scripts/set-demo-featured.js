// One-time script to set specific books as featured for demonstration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setSpecificFeaturedBooks() {
  try {
    console.log('🎯 Setting specific books as featured for demonstration...');
    
    // Find some interesting books to feature
    const booksToFeature = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: 'Machine Learning', mode: 'insensitive' } },
          { title: { contains: 'Research', mode: 'insensitive' } },
          { title: { contains: 'Digital', mode: 'insensitive' } }
        ]
      },
      select: { id: true, title: true, author: true }
    });
    
    console.log(`📚 Found ${booksToFeature.length} books matching criteria`);
    
    if (booksToFeature.length > 0) {
      for (const book of booksToFeature) {
        await prisma.book.update({
          where: { id: book.id },
          data: { isFeatured: true }
        });
        console.log(`⭐ Featured: "${book.title}" by ${book.author}`);
      }
    }
    
    // Final count
    const finalCount = await prisma.book.count({
      where: { isFeatured: true }
    });
    
    console.log(`\n✅ Total featured books now: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setSpecificFeaturedBooks();
