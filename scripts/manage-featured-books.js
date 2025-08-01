// Advanced script to manage featured books with different distribution strategies
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration options
const CONFIG = {
  // Percentage of books to mark as featured (0.0 to 1.0)
  FEATURED_PERCENTAGE: 0.25, // 25% of books will be featured
  
  // Strategy for selecting featured books
  STRATEGY: 'RANDOM', // 'RANDOM', 'NEWEST', 'POPULAR', 'MIXED'
  
  // Whether to reset all books first
  RESET_ALL: false
};

async function manageFeaturedBooks() {
  try {
    console.log('🚀 Advanced Featured Books Management Starting...');
    console.log(`📊 Strategy: ${CONFIG.STRATEGY}`);
    console.log(`⭐ Target featured percentage: ${(CONFIG.FEATURED_PERCENTAGE * 100).toFixed(1)}%`);
    
    // Get all books
    const allBooks = await prisma.book.findMany({
      select: { 
        id: true, 
        title: true, 
        author: true, 
        isFeatured: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    if (allBooks.length === 0) {
      console.log('❌ No books found in database');
      return;
    }
    
    // Calculate how many books should be featured
    const targetFeaturedCount = Math.ceil(allBooks.length * CONFIG.FEATURED_PERCENTAGE);
    console.log(`🎯 Target featured books: ${targetFeaturedCount}`);
    
    // Reset all books if requested
    if (CONFIG.RESET_ALL) {
      console.log('🔄 Resetting all books to non-featured...');
      await prisma.book.updateMany({
        data: { isFeatured: false }
      });
    }
    
    let booksToFeature = [];
    
    // Select books based on strategy
    switch (CONFIG.STRATEGY) {
      case 'NEWEST':
        booksToFeature = allBooks
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, targetFeaturedCount);
        console.log('📅 Using NEWEST strategy - featuring most recently added books');
        break;
        
      case 'RANDOM':
      default:
        // Shuffle array and take first targetFeaturedCount items
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5);
        booksToFeature = shuffled.slice(0, targetFeaturedCount);
        console.log('🎲 Using RANDOM strategy - randomly selecting books');
        break;
    }
    
    // Update selected books to be featured
    let updateCount = 0;
    console.log('\n📝 Updating books...');
    
    // First, set all books to non-featured
    await prisma.book.updateMany({
      data: { isFeatured: false }
    });
    
    // Then set selected books to featured
    for (const book of booksToFeature) {
      try {
        await prisma.book.update({
          where: { id: book.id },
          data: { isFeatured: true }
        });
        
        updateCount++;
        console.log(`⭐ Featured: "${book.title}" by ${book.author}`);
        
      } catch (error) {
        console.error(`❌ Failed to feature "${book.title}":`, error.message);
      }
    }
    
    // Final verification
    const finalStats = await prisma.book.groupBy({
      by: ['isFeatured'],
      _count: {
        isFeatured: true
      }
    });
    
    console.log('\n📊 Final Statistics:');
    finalStats.forEach(stat => {
      const label = stat.isFeatured ? 'Featured Books' : 'Regular Books';
      const percentage = ((stat._count.isFeatured / allBooks.length) * 100).toFixed(1);
      console.log(`${stat.isFeatured ? '⭐' : '📖'} ${label}: ${stat._count.isFeatured} (${percentage}%)`);
    });
    
    console.log('\n🎉 Featured books management completed successfully!');
    
    // Show current featured books
    console.log('\n⭐ Currently Featured Books:');
    const featuredBooks = await prisma.book.findMany({
      where: { isFeatured: true },
      select: { title: true, author: true, createdAt: true }
    });
    
    featuredBooks.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}" by ${book.author}`);
    });
    
  } catch (error) {
    console.error('💥 Error managing featured books:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the management script
manageFeaturedBooks();
