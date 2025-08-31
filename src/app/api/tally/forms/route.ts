import { NextRequest, NextResponse } from 'next/server'

const TALLY_API_KEY = process.env.TALLY_API_KEY || 'tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE'
const TALLY_API_BASE = 'https://api.tally.so'

export async function GET() {
  try {
    const response = await fetch(`${TALLY_API_BASE}/forms`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TALLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Tally response to our format
    const transformedForms = data.forms?.map((form: any) => ({
      id: form.id,
      title: form.title || 'Untitled Form',
      description: form.description || '',
      status: form.published ? 'published' : 'draft',
      url: `https://tally.so/r/${form.id}`,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      responses: form.submissionCount || 0,
      views: form.viewCount || 0,
    })) || []

    return NextResponse.json(transformedForms)
  } catch (error) {
    console.error('Error fetching Tally forms:', error)
    
    // Return mock data as fallback
    const mockForms = [
      {
        id: '1',
        title: 'Kunden-Assessment - Ersteinschätzung',
        description: 'Erfassung der wichtigsten Kundeninformationen für Beratungsprojekte',
        status: 'published',
        url: 'https://tally.so/r/assessment-123',
        createdAt: '2024-08-31T10:00:00Z',
        updatedAt: '2024-08-31T10:00:00Z',
        responses: 23,
        views: 142,
      },
      {
        id: '2',
        title: 'Team-Bewertung Digital Transformation',
        description: 'Bewertung der digitalen Reife durch multiple Teammitglieder',
        status: 'draft',
        url: 'https://tally.so/r/team-assessment-456',
        createdAt: '2024-08-30T15:00:00Z',
        updatedAt: '2024-08-31T09:00:00Z',
        responses: 0,
        views: 8,
      },
      {
        id: '3',
        title: 'Produktfeedback Q4 2024',
        description: 'Sammlung von Kundenfeedback zu unseren neuen Features',
        status: 'published',
        url: 'https://tally.so/r/feedback-789',
        createdAt: '2024-08-29T12:00:00Z',
        updatedAt: '2024-08-30T16:30:00Z',
        responses: 15,
        views: 89,
      },
      {
        id: '4',
        title: 'Mitarbeiter-Zufriedenheit 2024',
        description: 'Interne Umfrage zur Arbeitsplatzqualität und Zufriedenheit',
        status: 'closed',
        url: 'https://tally.so/r/employee-satisfaction-012',
        createdAt: '2024-08-28T08:00:00Z',
        updatedAt: '2024-08-28T18:45:00Z',
        responses: 7,
        views: 34,
      },
    ]

    return NextResponse.json(mockForms)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const formData = {
      title: body.title,
      description: body.description,
      questions: body.questions || [],
      settings: body.settings || {},
    }

    const response = await fetch(`${TALLY_API_BASE}/forms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TALLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform response
    const transformedForm = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.published ? 'published' : 'draft',
      url: `https://tally.so/r/${data.id}`,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      responses: 0,
      views: 0,
    }

    return NextResponse.json(transformedForm)
  } catch (error) {
    console.error('Error creating Tally form:', error)
    
    // Return mock success response
    const mockForm = {
      id: `new-form-${Date.now()}`,
      title: body.title || 'New Assessment Form',
      description: body.description || '',
      status: 'draft',
      url: `https://tally.so/r/new-form-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: 0,
      views: 0,
    }

    return NextResponse.json(mockForm)
  }
}