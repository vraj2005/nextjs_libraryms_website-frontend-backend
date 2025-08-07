import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { requestId, condition, notes } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Find the borrow request
    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id: requestId },
      include: {
        book: true,
        user: true
      }
    });

    if (!borrowRequest) {
      return NextResponse.json({ error: "Borrow request not found" }, { status: 404 });
    }

    // Check if user owns this request
    if (borrowRequest.userId !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized to return this book" }, { status: 403 });
    }

    // Check if book is already returned
    if (borrowRequest.status === 'RETURNED') {
      return NextResponse.json({ error: "Book is already returned" }, { status: 400 });
    }

    // Check if book is approved for borrowing
    if (borrowRequest.status !== 'APPROVED') {
      return NextResponse.json({ error: "Book is not currently borrowed" }, { status: 400 });
    }

    const now = new Date();
    let isOverdue = false;
    
    // Calculate if overdue based on due date if available
    if (borrowRequest.dueDate) {
      isOverdue = now > new Date(borrowRequest.dueDate);
    } else if (borrowRequest.approvedDate) {
      // If no due date, calculate from approved date + 14 days
      const dueDate = new Date(borrowRequest.approvedDate);
      dueDate.setDate(dueDate.getDate() + 14);
      isOverdue = now > dueDate;
    }

    // Update the borrow request
    const updatedRequest = await prisma.borrowRequest.update({
      where: { id: requestId },
      data: {
        status: 'RETURNED',
        returnDate: now,
        notes: notes ? `${borrowRequest.notes ? borrowRequest.notes + ' | ' : ''}Return condition: ${condition}. ${notes}` : `${borrowRequest.notes ? borrowRequest.notes + ' | ' : ''}Return condition: ${condition}`
      }
    });

    // Update book availability
    await prisma.book.update({
      where: { id: borrowRequest.bookId },
      data: {
        availableCopies: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      message: "Book returned successfully",
      request: updatedRequest,
      isOverdue: isOverdue
    });

  } catch (error) {
    console.error("Return book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
