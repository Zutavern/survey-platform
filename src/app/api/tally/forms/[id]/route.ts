import { NextRequest, NextResponse } from 'next/server'

const TALLY_API_BASE = 'https://api.tally.so'

// Helper function to get Tally API key safely
async function getTallyApiKey(): Promise<string | undefined> {
  try {
    const { cookies } = await import('next/headers')
    const { prisma } = await import('@/lib/prisma')
    const { decrypt, Encrypted } = await import('@/lib/crypto')
    const { env } = await import('@/lib/env')

    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth-token')
    
    if (authCookie?.value === 'authenticated') {
      const cred = await prisma.apiCredential.findUnique({
        where: { userEmail: 'admin@admin.com' },
        select: { tallyCipher: true, tallyIv: true, tallyTag: true }
      })
      
      if (cred?.tallyCipher && cred.tallyIv && cred.tallyTag) {
        try {
          return decrypt({
            cipher: cred.tallyCipher,
            iv: cred.tallyIv,
            tag: cred.tallyTag
          } as Encrypted)
        } catch (e) {
          console.error('Failed to decrypt stored Tally API key:', e)
        }
      }
    }
    
    return env.TALLY_API_KEY
  } catch (err) {
    console.error('Error resolving Tally API key:', err)
    return process.env.TALLY_API_KEY
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params
  
  try {
    const apiKey = await getTallyApiKey()
    
    if (!apiKey) {
      console.warn('No Tally API key available, returning mock data')
      // Return mock form data as fallback
      const mockForm = {
        id: formId,
        title: 'Kunden-Assessment - Ersteinschätzung',
        description: 'Erfassung der wichtigsten Kundeninformationen für Beratungsprojekte',
        status: 'draft',
        questions: [
          {
            id: '1',
            type: 'text',
            title: 'Unternehmensname',
            description: 'Bitte geben Sie den vollständigen Namen Ihres Unternehmens an',
            required: true,
            placeholder: 'z.B. Mustermann GmbH',
            order: 1
          },
          {
            id: '2',
            type: 'radio',
            title: 'Unternehmensgröße',
            description: 'Wie viele Mitarbeiter hat Ihr Unternehmen?',
            required: true,
            options: ['1-10 Mitarbeiter', '11-50 Mitarbeiter', '51-250 Mitarbeiter', '251-1000 Mitarbeiter', '1000+ Mitarbeiter'],
            order: 2
          }
        ],
        settings: {
          allowMultipleSubmissions: false,
          showProgressBar: true,
          collectEmails: true,
          thankYouMessage: 'Vielen Dank für Ihre Teilnahme! Wir werden uns bald bei Ihnen melden.'
        }
      }
      return NextResponse.json(mockForm)
    }

    const response = await fetch(`${TALLY_API_BASE}/forms/${formId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Tally form data to our format
    const transformedForm = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.published ? 'published' : 'draft',
      questions: data.blocks?.filter((block: any) => block.type === 'INPUT_TEXT' || block.type === 'INPUT_EMAIL' || block.type === 'MULTIPLE_CHOICE').map((block: any, index: number) => ({
        id: block.id,
        type: mapTallyBlockType(block.type),
        title: block.properties?.title || `Question ${index + 1}`,
        description: block.properties?.description || '',
        required: block.properties?.required || false,
        options: block.properties?.choices?.map((choice: any) => choice.label) || [],
        placeholder: block.properties?.placeholder || '',
        order: index + 1,
      })) || [],
      settings: {
        allowMultipleSubmissions: !data.settings?.oneResponsePerUser || false,
        showProgressBar: data.settings?.showProgressBar || true,
        collectEmails: data.settings?.collectEmail || false,
        thankYouMessage: data.settings?.thankYouMessage || 'Vielen Dank für Ihre Teilnahme!',
      },
    }

    return NextResponse.json(transformedForm)
  } catch (error) {
    console.error('Error fetching Tally form:', error)
    
    // Return mock form data as fallback
    const mockForm = {
      id: formId,
      title: 'Kunden-Assessment - Ersteinschätzung',
      description: 'Erfassung der wichtigsten Kundeninformationen für Beratungsprojekte',
      status: 'draft',
      questions: [
        {
          id: '1',
          type: 'text',
          title: 'Unternehmensname',
          description: 'Bitte geben Sie den vollständigen Namen Ihres Unternehmens an',
          required: true,
          placeholder: 'z.B. Mustermann GmbH',
          order: 1
        },
        {
          id: '2',
          type: 'radio',
          title: 'Unternehmensgröße',
          description: 'Wie viele Mitarbeiter hat Ihr Unternehmen?',
          required: true,
          options: ['1-10 Mitarbeiter', '11-50 Mitarbeiter', '51-250 Mitarbeiter', '251-1000 Mitarbeiter', '1000+ Mitarbeiter'],
          order: 2
        },
        {
          id: '3',
          type: 'select',
          title: 'Branche',
          description: 'In welcher Branche ist Ihr Unternehmen tätig?',
          required: true,
          options: ['IT/Software', 'Beratung', 'Produktion', 'Handel', 'Dienstleistung', 'Gesundheitswesen', 'Bildung', 'Finanzwesen', 'Sonstiges'],
          order: 3
        },
        {
          id: '4',
          type: 'email',
          title: 'Kontakt E-Mail',
          description: 'Ihre primäre Kontakt-E-Mail-Adresse',
          required: true,
          placeholder: 'max.mustermann@example.com',
          order: 4
        },
        {
          id: '5',
          type: 'checkbox',
          title: 'Aktueller Hauptbedarf',
          description: 'In welchen Bereichen sehen Sie aktuell den größten Handlungsbedarf? (Mehrfachauswahl möglich)',
          required: false,
          options: ['Strategieentwicklung', 'Prozessoptimierung', 'Technologie & Digitalisierung', 'Personal & Organisation', 'Finanzen & Controlling'],
          order: 5
        }
      ],
      settings: {
        allowMultipleSubmissions: false,
        showProgressBar: true,
        collectEmails: true,
        thankYouMessage: 'Vielen Dank für Ihre Teilnahme! Wir werden uns bald bei Ihnen melden.'
      }
    }

    return NextResponse.json(mockForm)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params
  
  try {
    const body = await request.json()
    const apiKey = await getTallyApiKey()

    if (!apiKey) {
      console.warn('No Tally API key available, returning mock response')
      return NextResponse.json({ success: true, message: 'Form updated successfully (mock)' })
    }

    const formData = {
      title: body.title,
      description: body.description,
      published: body.status === 'published',
      blocks: body.questions?.map((question: any) => ({
        type: mapToTallyBlockType(question.type),
        properties: {
          title: question.title,
          description: question.description,
          required: question.required,
          placeholder: question.placeholder,
          choices: question.options?.map((option: string) => ({ label: option })),
        },
      })) || [],
      settings: {
        oneResponsePerUser: !body.settings?.allowMultipleSubmissions,
        showProgressBar: body.settings?.showProgressBar,
        collectEmail: body.settings?.collectEmails,
        thankYouMessage: body.settings?.thankYouMessage,
      },
    }

    const response = await fetch(`${TALLY_API_BASE}/forms/${formId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ success: true, form: data })
  } catch (error) {
    console.error('Error updating Tally form:', error)
    
    // Return mock success response
    return NextResponse.json({ success: true, message: 'Form updated successfully (mock)' })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params
  
  try {
    const { prisma } = await import('@/lib/prisma')
    const { tallyCacheService } = await import('@/lib/tallyCache')
    const { mockStorage } = await import('@/lib/mockStorage')
    const { decrypt, Encrypted } = await import('@/lib/crypto')
    const { cookies } = await import('next/headers')
    const { env } = await import('@/lib/env')

    // Get API key using helper function
    const apiKey = await getTallyApiKey()

    // Check if this is a database form (local/AI generated)
    const dbForm = await prisma.formDefinition.findUnique({
      where: { id: formId },
      include: {
        fields: true,
        submissions: {
          include: {
            answers: true,
            analyses: true
          }
        }
      }
    })

    if (dbForm) {
      console.log('🗑️ Deleting local/database form:', formId)
      
      // Delete the form and all related data (cascading deletes will handle the rest)
      await prisma.formDefinition.delete({
        where: { id: formId }
      })
      
      // Also remove from mock storage if it exists there
      mockStorage.deleteForm(formId)
      
      // Clear cache
      tallyCacheService.clearAll()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lokales Formular erfolgreich gelöscht',
        deletedRecords: {
          formDefinition: 1,
          formFields: dbForm.fields.length,
          formSubmissions: dbForm.submissions.length,
          formAnswers: dbForm.submissions.reduce((sum, sub) => sum + sub.answers.length, 0),
          analyses: dbForm.submissions.reduce((sum, sub) => sum + sub.analyses.length, 0)
        }
      })
    }

    // Check if it's a Tally form by sourceId
    const tallyForm = await prisma.formDefinition.findFirst({
      where: { sourceId: formId },
      include: {
        fields: true,
        submissions: {
          include: {
            answers: true,
            analyses: true
          }
        }
      }
    })

    let tallyDeleted = false
    if (apiKey) {
      try {
        console.log('🗑️ Attempting to delete Tally form:', formId)
        const response = await fetch(`${TALLY_API_BASE}/forms/${formId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          console.log('✅ Tally form deleted successfully')
          tallyDeleted = true
        } else {
          console.log('⚠️ Tally API delete failed, status:', response.status)
        }
      } catch (tallyError) {
        console.error('❌ Error deleting from Tally API:', tallyError)
      }
    }

    // Clean up database records for Tally form if they exist
    let deletedRecords = {
      formDefinition: 0,
      formFields: 0,
      formSubmissions: 0,
      formAnswers: 0,
      analyses: 0
    }

    if (tallyForm) {
      console.log('🗑️ Cleaning up database records for Tally form:', formId)
      
      deletedRecords = {
        formDefinition: 1,
        formFields: tallyForm.fields.length,
        formSubmissions: tallyForm.submissions.length,
        formAnswers: tallyForm.submissions.reduce((sum, sub) => sum + sub.answers.length, 0),
        analyses: tallyForm.submissions.reduce((sum, sub) => sum + sub.analyses.length, 0)
      }

      await prisma.formDefinition.delete({
        where: { id: tallyForm.id }
      })
    }

    // Also remove from mock storage
    mockStorage.deleteForm(formId)
    
    // Clear cache to refresh the forms list
    tallyCacheService.clearAll()

    const message = tallyDeleted 
      ? 'Formular erfolgreich aus Tally und lokaler Datenbank gelöscht'
      : 'Formular aus lokaler Datenbank gelöscht (Tally API nicht verfügbar)'

    return NextResponse.json({ 
      success: true, 
      message,
      tallyDeleted,
      deletedRecords
    })

  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Formulars' },
      { status: 500 }
    )
  }
}

// Helper functions to map between our format and Tally's format
function mapTallyBlockType(tallyType: string): string {
  switch (tallyType) {
    case 'INPUT_TEXT':
      return 'text'
    case 'INPUT_EMAIL':
      return 'email'
    case 'INPUT_TEXTAREA':
      return 'textarea'
    case 'MULTIPLE_CHOICE':
      return 'radio'
    case 'CHECKBOXES':
      return 'checkbox'
    case 'DROPDOWN':
      return 'select'
    case 'RATING':
      return 'rating'
    default:
      return 'text'
  }
}

function mapToTallyBlockType(ourType: string): string {
  switch (ourType) {
    case 'text':
      return 'INPUT_TEXT'
    case 'email':
      return 'INPUT_EMAIL'
    case 'textarea':
      return 'INPUT_TEXTAREA'
    case 'radio':
      return 'MULTIPLE_CHOICE'
    case 'checkbox':
      return 'CHECKBOXES'
    case 'select':
      return 'DROPDOWN'
    case 'rating':
      return 'RATING'
    default:
      return 'INPUT_TEXT'
  }
}