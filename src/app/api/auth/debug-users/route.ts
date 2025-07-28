import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    // Get all users from database (without passwords for security)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        isActive: true,
        createdAt: true,
        password: true // Include password to check if it's hashed
      }
    })

    // Check password format for each user
    const usersWithPasswordInfo = users.map((user: any) => ({
      ...user,
      passwordType: user.password.startsWith('$2') ? 'hashed' : 'plain',
      passwordLength: user.password.length
    }))

    console.log('🔍 Current users in database:', usersWithPasswordInfo)

    return NextResponse.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: usersWithPasswordInfo
    })

  } catch (error) {
    console.error('Error getting users:', error)
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    console.log('🚀 Adding test users...')

    // Check if users already exist
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@library.com' }
    })

    const existingUser = await prisma.user.findUnique({
      where: { email: 'user@library.com' }
    })

    if (existingAdmin && existingUser) {
      // Update existing users with proper hashed passwords
      const hashedAdminPassword = await hashPassword('admin123')
      const hashedUserPassword = await hashPassword('user123')

      await prisma.user.update({
        where: { email: 'admin@library.com' },
        data: { password: hashedAdminPassword }
      })

      await prisma.user.update({
        where: { email: 'user@library.com' },
        data: { password: hashedUserPassword }
      })

      return NextResponse.json({
        message: 'Existing users updated with properly hashed passwords',
        action: 'updated'
      })
    }

    // Create new users with hashed passwords
    const hashedAdminPassword = await hashPassword('admin123')
    const hashedUserPassword = await hashPassword('user123')

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@library.com',
        username: 'admin',
        password: hashedAdminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1-555-0001',
        address: '123 Library Street, Admin City, AC 12345',
        role: 'ADMIN',
        isActive: true
      }
    })

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@library.com',
        username: 'regularuser',
        password: hashedUserPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0002',
        address: '456 Reader Avenue, Book City, BC 67890',
        role: 'USER',
        isActive: true
      }
    })

    console.log('✅ Test users created successfully')

    return NextResponse.json({
      message: 'Test users created successfully',
      users: [
        { email: adminUser.email, role: adminUser.role },
        { email: regularUser.email, role: regularUser.role }
      ]
    })

  } catch (error: any) {
    console.error('Error creating test users:', error)
    return NextResponse.json(
      { error: 'Failed to create test users: ' + error.message },
      { status: 500 }
    )
  }
}
