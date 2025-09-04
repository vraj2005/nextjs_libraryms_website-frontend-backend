import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if the fine exists and belongs to the user
    const fine = await prisma.fine.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        borrowRequest: {
          include: {
            book: true
          }
        }
      }
    });

    if (!fine) {
      return NextResponse.json({ error: 'Fine not found' }, { status: 404 });
    }

    if (fine.isPaid) {
      return NextResponse.json({ error: 'Fine already paid' }, { status: 400 });
    }

    // Update the fine to mark as paid
    const updatedFine = await prisma.fine.update({
      where: {
        id: params.id
      },
      data: {
        isPaid: true,
        paidDate: new Date()
      }
    });

    // Create a notification for the payment
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Fine Payment Successful',
        message: `Your fine of ₹${fine.amount} for "${fine.borrowRequest.book.title}" has been paid successfully.`,
        type: 'INFO'
      }
    });

    // Log user history
    await prisma.userHistory.create({
      data: {
        userId: user.id,
        action: 'FINE_PAID',
        description: `Paid fine of ₹${fine.amount} for "${fine.borrowRequest.book.title}"`,
        metadata: JSON.stringify({
          fineId: fine.id,
          amount: fine.amount,
          bookId: fine.borrowRequest.book.id,
          bookTitle: fine.borrowRequest.book.title
        })
      }
    });

    return NextResponse.json({
      message: 'Fine paid successfully',
      fine: updatedFine
    });

  } catch (error) {
    console.error('Error paying fine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
