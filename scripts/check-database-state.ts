import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...\n');
    
    // Get all borrow requests
    const allRequests = await prisma.borrowRequest.findMany({
      include: {
        user: true,
        book: true
      }
    });
    
    console.log(`📊 Total borrow requests: ${allRequests.length}`);
    
    // Get approved unreturned requests
    const approvedUnreturned = allRequests.filter(r => 
      r.status === 'APPROVED' && r.returnDate === null
    );
    
    console.log(`📚 Approved unreturned requests: ${approvedUnreturned.length}`);
    
    // Check due dates
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    console.log(`📅 Current date: ${currentDate.toISOString().split('T')[0]}\n`);
    
    if (approvedUnreturned.length > 0) {
      console.log('📋 Approved unreturned requests details:');
      for (const request of approvedUnreturned) {
        if (request.dueDate) {
          const daysOverdue = Math.ceil((currentDate.getTime() - request.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const overdueStatus = daysOverdue > 0 ? '🔴 OVERDUE' : '🟢 NOT OVERDUE';
          console.log(`  Request ${request.id}: Due ${request.dueDate.toISOString().split('T')[0]}, Days overdue: ${daysOverdue} ${overdueStatus}`);
          console.log(`    User: ${request.user.firstName} ${request.user.lastName}`);
          console.log(`    Book: ${request.book.title}`);
        } else {
          console.log(`  Request ${request.id}: No due date set`);
        }
        console.log('');
      }
    }
    
    // Get all fines
    const allFines = await prisma.fine.findMany({
      include: {
        user: true,
        borrowRequest: {
          include: {
            book: true
          }
        }
      }
    });
    
    console.log(`💰 Total fines in database: ${allFines.length}`);
    
    if (allFines.length > 0) {
      console.log('\n💰 Existing fines:');
      for (const fine of allFines) {
        console.log(`  Fine ${fine.id}: ₹${fine.amount} - ${fine.user.firstName} ${fine.user.lastName}`);
        console.log(`    Book: ${fine.borrowRequest?.book?.title || 'Unknown'}`);
        console.log('');
      }
    }
    
    // Check recent activity
    console.log(`📈 Checking recent borrow request activity...`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
