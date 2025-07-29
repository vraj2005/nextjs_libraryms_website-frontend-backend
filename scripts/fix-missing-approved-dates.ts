import { prisma } from '@/lib/prisma'

async function fixMissingApprovedDates() {
  try {
    console.log('Starting to fix missing approved dates...')
    
    // Find all approved requests with null approvedDate
    const approvedRequestsWithoutDates = await prisma.borrowRequest.findMany({
      where: {
        status: {
          in: ['APPROVED', 'RETURNED']
        },
        OR: [
          { approvedDate: null },
          { dueDate: null }
        ]
      }
    })

    console.log(`Found ${approvedRequestsWithoutDates.length} requests with missing dates`)

    for (const request of approvedRequestsWithoutDates) {
      let approvedDate = request.approvedDate
      let dueDate = request.dueDate

      // If approvedDate is null, set it to the request date (as fallback)
      if (!approvedDate) {
        approvedDate = request.requestDate
      }

      // If dueDate is null, set it to 14 days after the approved date
      if (!dueDate) {
        const dueDateCalc = new Date(approvedDate)
        dueDateCalc.setDate(dueDateCalc.getDate() + 14)
        dueDate = dueDateCalc
      }

      // Update the request
      await prisma.borrowRequest.update({
        where: { id: request.id },
        data: {
          approvedDate,
          dueDate
        }
      })

      console.log(`Updated request ${request.id} with approvedDate: ${approvedDate}, dueDate: ${dueDate}`)
    }

    console.log('Successfully fixed all missing approved dates!')
    
  } catch (error) {
    console.error('Error fixing missing approved dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixMissingApprovedDates()
