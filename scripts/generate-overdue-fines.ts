import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateOverdueFines() {
  try {
    console.log('🔍 Checking for overdue books...');
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for consistent comparison
    console.log(`📅 Current date: ${currentDate.toISOString().split('T')[0]}`);
    
    // Find all approved borrow requests that are not yet returned
    // First get all requests and filter manually to avoid query issues
    const allRequests = await prisma.borrowRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true
          }
        },
        fines: true // Include existing fines for this request
      }
    });

    // Filter for approved unreturned requests
    const allApprovedRequests = allRequests.filter(r => 
      r.status === 'APPROVED' && r.returnDate === null
    );

    console.log(`� Total approved unreturned requests: ${allApprovedRequests.length}`);
    
    // Remove debug section since we found the issue
    if (allApprovedRequests.length === 0) {
      console.log('✅ No approved unreturned requests found. All books are returned on time!');
      return;
    }

    // Filter for overdue requests on the client side
    const overdueBorrowRequests = allApprovedRequests.filter(request => 
      request.dueDate && request.dueDate < currentDate
    );

    console.log(`📚 Found ${overdueBorrowRequests.length} overdue borrow requests`);

    if (overdueBorrowRequests.length === 0) {
      console.log('✅ No overdue books found. All books are returned on time!');
      return;
    }

    let finesCreated = 0;
    let finesUpdated = 0;
    let totalFineAmount = 0;

    for (const borrowRequest of overdueBorrowRequests) {
      // Skip if dueDate is null (should not happen due to our query filter, but TypeScript safety)
      if (!borrowRequest.dueDate) {
        console.log(`⚠️  Skipping request for "${borrowRequest.book.title}" - no due date`);
        continue;
      }

      const daysOverdue = Math.ceil((currentDate.getTime() - borrowRequest.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * 100.0; // ₹100 per day

      console.log(`\n📖 Processing: "${borrowRequest.book.title}" by ${borrowRequest.user.firstName} ${borrowRequest.user.lastName}`);
      console.log(`   Due Date: ${borrowRequest.dueDate.toLocaleDateString()}`);
      console.log(`   Days Overdue: ${daysOverdue} days`);
      console.log(`   Fine Amount: ₹${fineAmount}`);

      // Check if a fine already exists for this borrow request
      const existingFine = borrowRequest.fines.find(fine => !fine.isPaid);

      if (existingFine) {
        // Update existing unpaid fine if the amount has changed
        if (existingFine.amount !== fineAmount || existingFine.daysOverdue !== daysOverdue) {
          await prisma.fine.update({
            where: { id: existingFine.id },
            data: {
              amount: fineAmount,
              daysOverdue: daysOverdue,
              updatedAt: new Date()
            }
          });

          console.log(`   ✏️  Updated existing fine from ₹${existingFine.amount} to ₹${fineAmount}`);
          finesUpdated++;
        } else {
          console.log(`   ℹ️  Fine already exists and is up to date (₹${fineAmount})`);
        }
      } else {
        // Create new fine
        const newFine = await prisma.fine.create({
          data: {
            userId: borrowRequest.user.id,
            borrowRequestId: borrowRequest.id,
            amount: fineAmount,
            daysOverdue: daysOverdue,
            isPaid: false
          }
        });

        console.log(`   ✅ Created new fine: ₹${fineAmount}`);
        finesCreated++;

        // Create notification for the user
        try {
          await prisma.notification.create({
            data: {
              userId: borrowRequest.user.id,
              title: 'Overdue Fine Issued',
              message: `A fine of ₹${fineAmount} has been issued for the overdue book "${borrowRequest.book.title}". The book was due on ${borrowRequest.dueDate.toLocaleDateString()} and is ${daysOverdue} days overdue. Please return the book and pay the fine.`,
              type: 'WARNING'
            }
          });

          console.log(`   📢 Notification sent to user`);
        } catch (notificationError) {
          console.error(`   ❌ Failed to create notification:`, notificationError);
        }

        // Create user history entry
        try {
          await prisma.userHistory.create({
            data: {
              userId: borrowRequest.user.id,
              action: 'FINE_ISSUED',
              description: `Fine of ₹${fineAmount} issued for overdue book "${borrowRequest.book.title}" (${daysOverdue} days overdue)`,
              metadata: JSON.stringify({
                bookId: borrowRequest.book.id,
                borrowRequestId: borrowRequest.id,
                fineAmount: fineAmount,
                daysOverdue: daysOverdue,
                dueDate: borrowRequest.dueDate,
                fineId: newFine.id
              })
            }
          });

          console.log(`   📝 User history updated`);
        } catch (historyError) {
          console.error(`   ❌ Failed to create user history:`, historyError);
        }
      }

      totalFineAmount += fineAmount;
    }

    // Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 OVERDUE FINES PROCESSING COMPLETE');
    console.log('='.repeat(60));
    console.log(`📚 Total overdue books processed: ${overdueBorrowRequests.length}`);
    console.log(`✅ New fines created: ${finesCreated}`);
    console.log(`✏️  Existing fines updated: ${finesUpdated}`);
    console.log(`💰 Total fine amount processed: ₹${totalFineAmount}`);
    console.log(`📈 Average fine per overdue book: ₹${(totalFineAmount / overdueBorrowRequests.length).toFixed(2)}`);

    // Get summary by user
    const userSummary = new Map();
    for (const request of overdueBorrowRequests) {
      // Skip if dueDate is null
      if (!request.dueDate) continue;

      const userId = request.user.id;
      const userName = `${request.user.firstName} ${request.user.lastName}`;
      const daysOverdue = Math.ceil((currentDate.getTime() - request.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * 100.0;

      if (userSummary.has(userId)) {
        const existing = userSummary.get(userId);
        existing.books++;
        existing.totalFine += fineAmount;
        existing.totalDaysOverdue += daysOverdue;
      } else {
        userSummary.set(userId, {
          name: userName,
          email: request.user.email,
          books: 1,
          totalFine: fineAmount,
          totalDaysOverdue: daysOverdue
        });
      }
    }

    console.log('\n📋 SUMMARY BY USER:');
    console.log('-'.repeat(60));
    userSummary.forEach((summary, userId) => {
      console.log(`👤 ${summary.name} (${summary.email})`);
      console.log(`   📚 Overdue books: ${summary.books}`);
      console.log(`   💰 Total fines: ₹${summary.totalFine}`);
      console.log(`   📅 Total days overdue: ${summary.totalDaysOverdue}`);
      console.log('');
    });

    console.log('✅ All overdue fines have been processed successfully!');

  } catch (error) {
    console.error('❌ Error generating overdue fines:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateOverdueFines()
  .then(() => {
    console.log('🎉 Overdue fines processing completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to process overdue fines:', error);
    process.exit(1);
  });
