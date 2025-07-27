import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:')
      console.log('Email:', existingAdmin.email)
      console.log('Name:', existingAdmin.name)
      console.log('Role:', existingAdmin.role)
      console.log('Active:', existingAdmin.isActive)
      return
    }

    // Hash the admin password
    const hashedPassword = await hashPassword('admin123')

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@libraryms.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        membershipId: 'ADMIN-001',
        phoneNumber: '+1-555-0000',
        address: 'Library Management System HQ',
        isActive: true
      }
    })

    console.log('Admin user created successfully:')
    console.log('Email:', adminUser.email)
    console.log('Password: admin123')
    console.log('Role:', adminUser.role)
    console.log('Please save these credentials securely!')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()
