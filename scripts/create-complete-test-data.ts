import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCompleteTestData() {
  try {
    console.log('🔧 Creating complete test data: users, books, and overdue borrow requests...');

    // First, check if we have users and books
    const usersCount = await prisma.user.count({
      where: { role: 'USER' }
    });
    const booksCount = await prisma.book.count();

    console.log(`👥 Found ${usersCount} users and 📚 ${booksCount} books`);

    if (usersCount === 0 || booksCount === 0) {
      console.log('❌ Need users and books to create test borrow requests');
      return;
    }

    // Get some users and books
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 3
    });

    const books = await prisma.book.findMany({
      where: { availableCopies: { gt: 0 } },
      take: 5
    });

    if (users.length === 0 || books.length === 0) {
      console.log('❌ No suitable users or available books found');
      return;
    }

    console.log(`Creating borrow requests for ${users.length} users with ${books.length} books...`);

    let createdRequests = 0;

    // Create approved borrow requests that are overdue
    for (let i = 0; i < Math.min(users.length * 2, books.length); i++) {
      const user = users[i % users.length];
      const book = books[i];

      // Create dates
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - 20); // Requested 20 days ago

      const approvedDate = new Date();
      approvedDate.setDate(approvedDate.getDate() - 18); // Approved 18 days ago

      const dueDate = new Date();
      const daysOverdue = Math.floor(Math.random() * 10) + 5; // 5-15 days overdue
      dueDate.setDate(dueDate.getDate() - daysOverdue); // Due date in the past

      // Create the borrow request
      const borrowRequest = await prisma.borrowRequest.create({
        data: {
          userId: user.id,
          bookId: book.id,
          requestDate: requestDate,
          status: 'APPROVED',
          approvedDate: approvedDate,
          dueDate: dueDate,
          notes: 'Test overdue request for fine generation demo'
        }
      });

      // Update book availability
      await prisma.book.update({
        where: { id: book.id },
        data: {
          availableCopies: {
            decrement: 1
          }
        }
      });

      console.log(`📖 Created overdue request: "${book.title}" for ${user.firstName} ${user.lastName}`);
      console.log(`   Due: ${dueDate.toLocaleDateString()} (${daysOverdue} days overdue)`);
      console.log(`   Expected fine: ₹${daysOverdue * 100}`);
      console.log('');

      createdRequests++;
    }

    console.log(`✅ Successfully created ${createdRequests} overdue borrow requests`);
    console.log('🔔 You can now run the generate-overdue-fines script to create fines!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createCompleteTestData()
  .then(() => {
    console.log('🎉 Complete test data created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create test data:', error);
    process.exit(1);
  });
