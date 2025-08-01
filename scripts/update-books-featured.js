// Script to update all existing books with random isFeatured values
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBooksWithRandomFeatured() {
  try {
    console.log('🔄 Starting to update all books with random isFeatured values...');
    
    // Get all books that don't have the isFeatured field or need updating
    const books = await prisma.book.findMany({
      select: { id: true, title: true, author: true, isFeatured: true }
    });
    
    console.log(`📚 Found ${books.length} books in the database`);
    
    if (books.length === 0) {
      console.log('❌ No books found in database');
      return;
    }
    
    let updatedCount = 0;
    let featuredCount = 0;
    
    // Update each book with a random isFeatured value
    for (const book of books) {
      // Generate random boolean (30% chance of being featured for better distribution)
      const randomFeatured = Math.random() < 0.3; // 30% chance of being featured
      
      try {
        await prisma.book.update({
          where: { id: book.id },
          data: { isFeatured: randomFeatured }
        });
        
        updatedCount++;
        if (randomFeatured) {
          featuredCount++;
        }
        
        console.log(`✅ Updated "${book.title}" by ${book.author} - Featured: ${randomFeatured}`);
        
      } catch (error) {
        console.error(`❌ Failed to update book "${book.title}":`, error.message);
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Total books processed: ${books.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⭐ Books marked as featured: ${featuredCount}`);
    console.log(`📖 Books marked as regular: ${updatedCount - featuredCount}`);
    console.log(`📈 Featured percentage: ${((featuredCount / updatedCount) * 100).toFixed(1)}%`);
    
    // Verify the updates by checking random sample
    console.log('\n🔍 Verification - Sample of updated books:');
    const sampleBooks = await prisma.book.findMany({
      select: { title: true, author: true, isFeatured: true },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });
    
    sampleBooks.forEach((book, index) => {
      const status = book.isFeatured ? '⭐ FEATURED' : '📖 REGULAR';
      console.log(`${index + 1}. "${book.title}" by ${book.author} - ${status}`);
    });
    
    console.log('\n🎉 Database update completed successfully!');
    
  } catch (error) {
    console.error('💥 Error updating books:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateBooksWithRandomFeatured();
