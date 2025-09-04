import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        additionalContacts: true,
        assignedSurveys: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    // Transform to match expected format
    const transformedCustomers = customers.map(customer => ({
      ...customer,
      primaryContact: {
        firstName: customer.primaryContactFirstName,
        lastName: customer.primaryContactLastName,
        role: customer.primaryContactRole,
        email: customer.primaryContactEmail,
        phone: customer.primaryContactPhone
      }
    }))
    
    return NextResponse.json(transformedCustomers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newCustomer = await prisma.customer.create({
      data: {
        companyName: body.companyName,
        street: body.street,
        postalCode: body.postalCode,
        city: body.city,
        primaryContactFirstName: body.primaryContact.firstName,
        primaryContactLastName: body.primaryContact.lastName,
        primaryContactRole: body.primaryContact.role,
        primaryContactEmail: body.primaryContact.email,
        primaryContactPhone: body.primaryContact.phone,
        status: 'ACTIVE'
      },
      include: {
        additionalContacts: true,
        assignedSurveys: true
      }
    })

    return NextResponse.json({
      success: true,
      customer: newCustomer
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}