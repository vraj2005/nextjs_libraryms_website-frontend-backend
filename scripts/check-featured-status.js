// Quick verification script to check current state of featured books
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFeaturedBooks() {
  try {
    console.log('🔍 Checking current featured books status...');
    
    // Get book counts
    const totalBooks = await prisma.book.count();
    const featuredBooks = await prisma.book.count({
      where: { isFeatured: true }
    });
    const regularBooks = totalBooks - featuredBooks;
    
    console.log(`📚 Total books: ${totalBooks}`);
    console.log(`⭐ Featured books: ${featuredBooks} (${((featuredBooks/totalBooks)*100).toFixed(1)}%)`);
    console.log(`📖 Regular books: ${regularBooks} (${((regularBooks/totalBooks)*100).toFixed(1)}%)`);
    
    // Show featured books
    if (featuredBooks > 0) {
      console.log('\n⭐ Currently Featured Books:');
      const featured = await prisma.book.findMany({
        where: { isFeatured: true },
        select: { title: true, author: true }
      });
      
      featured.forEach((book, index) => {
        console.log(`${index + 1}. "${book.title}" by ${book.author}`);
      });
    }
    
    console.log('\n✅ Status check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedBooks();
