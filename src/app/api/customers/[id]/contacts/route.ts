import { NextRequest, NextResponse } from 'next/server'
import { customerStorage } from '@/lib/customerStorage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: customerId } = await params
  
  try {
    const body = await request.json()
    
    const newContact = customerStorage.addContactPerson(customerId, {
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      department: body.department,
      email: body.email,
      phone: body.phone,
      isActive: true
    })

    if (!newContact) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      contact: newContact
    })
  } catch (error) {
    console.error('Error adding contact person:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add contact person' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: customerId } = await params
  
  try {
    const body = await request.json()
    const { contactId, ...updates } = body
    
    const success = customerStorage.updateContactPerson(customerId, contactId, updates)

    if (!success) {
      return NextResponse.json({ error: 'Customer or contact not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating contact person:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact person' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: customerId } = await params
  
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 })
    }
    
    const success = customerStorage.removeContactPerson(customerId, contactId)

    if (!success) {
      return NextResponse.json({ error: 'Customer or contact not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing contact person:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove contact person' },
      { status: 500 }
    )
  }
}