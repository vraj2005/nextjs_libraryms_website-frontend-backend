import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Fetch all fines for the user
    const fines = await prisma.fine.findMany({
      where: {
        userId: user.id
      },
      include: {
        borrowRequest: {
          include: {
            book: {
              select: {
                title: true,
                author: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      fines: fines.map(fine => ({
        id: fine.id,
        amount: fine.amount,
        daysOverdue: fine.daysOverdue,
        isPaid: fine.isPaid,
        paidDate: fine.paidDate,
        createdAt: fine.createdAt,
        borrowRequest: {
          id: fine.borrowRequest.id,
          dueDate: fine.borrowRequest.dueDate,
          returnDate: fine.borrowRequest.returnDate,
          book: fine.borrowRequest.book
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching fines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
