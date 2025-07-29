import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Simple fix for the specific request we know has issues
    const requestId = '6888ad26327c13b1ccf52298'
    
    const currentRequest = await prisma.borrowRequest.findUnique({
      where: { id: requestId }
    })

    if (!currentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Set proper dates
    const approvedDate = new Date(currentRequest.requestDate)
    const dueDate = new Date(currentRequest.requestDate)
    dueDate.setDate(dueDate.getDate() + 14)

    const updatedRequest = await prisma.borrowRequest.update({
      where: { id: requestId },
      data: {
        approvedDate,
        dueDate
      }
    })

    return NextResponse.json({
      message: 'Successfully fixed the request dates',
      before: {
        approvedDate: currentRequest.approvedDate,
        dueDate: currentRequest.dueDate
      },
      after: {
        approvedDate: updatedRequest.approvedDate,
        dueDate: updatedRequest.dueDate
      }
    })

  } catch (error) {
    console.error('Error fixing request:', error)
    return NextResponse.json({ error: 'Failed to fix request' }, { status: 500 })
  }
}
