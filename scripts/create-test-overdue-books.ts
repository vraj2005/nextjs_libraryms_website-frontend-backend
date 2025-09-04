import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOverdueBooks() {
  try {
    console.log('🔧 Creating test overdue books for demonstration...');

    // Find some approved borrow requests
    const approvedRequests = await prisma.borrowRequest.findMany({
      where: {
        status: 'APPROVED',
        returnDate: null
      },
      take: 3, // Get up to 3 requests
      include: {
        user: true,
        book: true
      }
    });

    if (approvedRequests.length === 0) {
      console.log('❌ No approved borrow requests found to make overdue');
      return;
    }

    console.log(`📚 Found ${approvedRequests.length} approved borrow requests to make overdue`);

    let overdueCount = 0;

    for (const request of approvedRequests) {
      // Set due date to 5-15 days ago to make them overdue
      const daysAgo = Math.floor(Math.random() * 10) + 5; // 5-15 days ago
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - daysAgo);

      await prisma.borrowRequest.update({
        where: { id: request.id },
        data: {
          dueDate: overdueDate
        }
      });

      console.log(`📖 Made overdue: "${request.book.title}" by ${request.user.firstName} ${request.user.lastName}`);
      console.log(`   Due date set to: ${overdueDate.toLocaleDateString()} (${daysAgo} days ago)`);
      console.log(`   Expected fine: ₹${daysAgo * 100}`);
      console.log('');

      overdueCount++;
    }

    console.log(`✅ Successfully created ${overdueCount} overdue books for testing`);
    console.log('🔔 You can now run the generate-overdue-fines script to create fines!');

  } catch (error) {
    console.error('❌ Error creating test overdue books:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestOverdueBooks()
  .then(() => {
    console.log('🎉 Test overdue books created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create test overdue books:', error);
    process.exit(1);
  });
