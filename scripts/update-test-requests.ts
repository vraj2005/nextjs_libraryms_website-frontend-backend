import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateTestRequests() {
  try {
    console.log('Updating test borrow requests with proper dates...')

    // Update approved requests to have approved date and due date
    const approvedRequests = await prisma.borrowRequest.findMany({
      where: { status: 'APPROVED' }
    })

    for (const request of approvedRequests) {
      const approvedDate = new Date(request.requestDate)
      approvedDate.setDate(approvedDate.getDate() + 1) // Approved 1 day after request

      const dueDate = new Date(approvedDate)
      dueDate.setDate(dueDate.getDate() + 14) // Due 14 days after approval

      await prisma.borrowRequest.update({
        where: { id: request.id },
        data: {
          approvedDate: approvedDate,
          dueDate: dueDate
        }
      })

      console.log(`Updated request ${request.id} with approved date: ${approvedDate.toDateString()} and due date: ${dueDate.toDateString()}`)
    }

    // Update returned requests to have all dates including return date
    const returnedRequests = await prisma.borrowRequest.findMany({
      where: { status: 'RETURNED' }
    })

    for (const request of returnedRequests) {
      const approvedDate = new Date(request.requestDate)
      approvedDate.setDate(approvedDate.getDate() + 1) // Approved 1 day after request

      const dueDate = new Date(approvedDate)
      dueDate.setDate(dueDate.getDate() + 14) // Due 14 days after approval

      const returnDate = new Date(dueDate)
      returnDate.setDate(returnDate.getDate() - 2) // Returned 2 days before due date

      await prisma.borrowRequest.update({
        where: { id: request.id },
        data: {
          approvedDate: approvedDate,
          dueDate: dueDate,
          returnDate: returnDate
        }
      })

      console.log(`Updated returned request ${request.id} with all dates`)
    }

    console.log('Test requests updated successfully!')

  } catch (error) {
    console.error('Error updating test requests:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTestRequests()
