import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);

    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const currentDate = new Date();
    
    // Find all approved borrow requests that are overdue and not yet returned
    const overdueBorrowRequests = await prisma.borrowRequest.findMany({
      where: {
        status: 'APPROVED',
        dueDate: {
          lt: currentDate
        },
        returnDate: null,
        NOT: {
          dueDate: null
        }
      },
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
        fines: true
      }
    });

    if (overdueBorrowRequests.length === 0) {
      return NextResponse.json({
        message: 'No overdue books found',
        summary: {
          overdueBooks: 0,
          finesCreated: 0,
          finesUpdated: 0,
          totalFineAmount: 0
        }
      });
    }

    let finesCreated = 0;
    let finesUpdated = 0;
    let totalFineAmount = 0;
    const processedUsers = new Map();

    for (const borrowRequest of overdueBorrowRequests) {
      if (!borrowRequest.dueDate) continue;

      const daysOverdue = Math.ceil((currentDate.getTime() - borrowRequest.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * 100.0;

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
          finesUpdated++;
        }
      } else {
        // Create new fine
        const newFine = await prisma.fine.create({
          data: {
            userId: borrowRequest.userId,
            borrowRequestId: borrowRequest.id,
            amount: fineAmount,
            daysOverdue: daysOverdue,
            isPaid: false
          }
        });

        finesCreated++;

        // Create notification for the user
        await prisma.notification.create({
          data: {
            userId: borrowRequest.userId,
            title: 'Overdue Fine Issued',
            message: `A fine of ₹${fineAmount} has been issued for the overdue book "${borrowRequest.book.title}". The book was due on ${borrowRequest.dueDate.toLocaleDateString()} and is ${daysOverdue} days overdue. Please return the book and pay the fine.`,
            type: 'WARNING'
          }
        });

        // Create user history entry
        await prisma.userHistory.create({
          data: {
            userId: borrowRequest.userId,
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
      }

      totalFineAmount += fineAmount;

      // Track user summary
      const userId = borrowRequest.userId;
      const userName = `${borrowRequest.user.firstName} ${borrowRequest.user.lastName}`;
      
      if (processedUsers.has(userId)) {
        const existing = processedUsers.get(userId);
        existing.books++;
        existing.totalFine += fineAmount;
        existing.totalDaysOverdue += daysOverdue;
      } else {
        processedUsers.set(userId, {
          name: userName,
          email: borrowRequest.user.email,
          books: 1,
          totalFine: fineAmount,
          totalDaysOverdue: daysOverdue
        });
      }
    }

    // Convert Map to array for response
    const userSummaries = Array.from(processedUsers.values());

    return NextResponse.json({
      message: 'Overdue fines processed successfully',
      summary: {
        overdueBooks: overdueBorrowRequests.length,
        finesCreated,
        finesUpdated,
        totalFineAmount,
        usersAffected: processedUsers.size,
        averageFinePerBook: overdueBorrowRequests.length > 0 ? (totalFineAmount / overdueBorrowRequests.length) : 0
      },
      userSummaries
    });

  } catch (error) {
    console.error('Error generating overdue fines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
