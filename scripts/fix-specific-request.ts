import { prisma } from '@/lib/prisma'

async function fixSpecificRequest() {
  try {
    console.log('Fixing specific request with ID: 6888ad26327c13b1ccf52298')
    
    // Get the specific request
    const request = await prisma.borrowRequest.findUnique({
      where: { id: '6888ad26327c13b1ccf52298' }
    })

    if (!request) {
      console.log('Request not found')
      return
    }

    console.log('Current request data:', {
      id: request.id,
      status: request.status,
      requestDate: request.requestDate,
      approvedDate: request.approvedDate,
      dueDate: request.dueDate
    })

    // Set approved date to request date and due date to 14 days later
    const approvedDate = request.requestDate
    const dueDate = new Date(request.requestDate)
    dueDate.setDate(dueDate.getDate() + 14)

    // Update the request
    const updatedRequest = await prisma.borrowRequest.update({
      where: { id: '6888ad26327c13b1ccf52298' },
      data: {
        approvedDate,
        dueDate
      }
    })

    console.log('Updated request data:', {
      id: updatedRequest.id,
      status: updatedRequest.status,
      requestDate: updatedRequest.requestDate,
      approvedDate: updatedRequest.approvedDate,
      dueDate: updatedRequest.dueDate
    })

    console.log('Successfully fixed the request!')
    
  } catch (error) {
    console.error('Error fixing request:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificRequest()
