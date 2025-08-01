// Simple database update script for adding isFeatured field
const { MongoClient } = require('mongodb');

async function updateDatabase() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const booksCollection = db.collection('Book');
    
    // Add isFeatured field to all existing books (default: false)
    const result = await booksCollection.updateMany(
      { isFeatured: { $exists: false } }, // Only books without isFeatured field
      { $set: { isFeatured: false } }
    );
    
    console.log(`Updated ${result.modifiedCount} books with isFeatured field`);
    
    // Verify the update
    const sampleBooks = await booksCollection.find({}).limit(3).toArray();
    console.log('Sample books after update:');
    sampleBooks.forEach(book => {
      console.log(`- ${book.title}: isFeatured = ${book.isFeatured}`);
    });
    
    console.log('✅ Database update completed successfully!');
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await client.close();
  }
}

updateDatabase();
