import { NextRequest, NextResponse } from 'next/server'
import { customerStorage } from '@/lib/customerStorage'
import { Customer } from '@/lib/types/customer'

export async function GET() {
  try {
    const customers = customerStorage.getAllCustomers()
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      companyName: body.companyName,
      street: body.street,
      postalCode: body.postalCode,
      city: body.city,
      primaryContact: {
        firstName: body.primaryContact.firstName,
        lastName: body.primaryContact.lastName,
        role: body.primaryContact.role,
        email: body.primaryContact.email,
        phone: body.primaryContact.phone
      },
      additionalContacts: [],
      assignedSurveys: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    }

    const savedCustomer = customerStorage.saveCustomer(newCustomer)

    return NextResponse.json({
      success: true,
      customer: savedCustomer
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}