import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        additionalContacts: true,
        assignedSurveys: true
      }
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Transform to match expected format
    const transformedCustomer = {
      ...customer,
      primaryContact: {
        firstName: customer.primaryContactFirstName,
        lastName: customer.primaryContactLastName,
        role: customer.primaryContactRole,
        email: customer.primaryContactEmail,
        phone: customer.primaryContactPhone
      }
    }

    return NextResponse.json(transformedCustomer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    const existingCustomer = customerStorage.getCustomer(id)
    
    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updatedCustomer = customerStorage.saveCustomer({
      ...existingCustomer,
      ...body,
      id,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      customer: updatedCustomer
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const customer = await prisma.customer.findUnique({
      where: { id }
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}