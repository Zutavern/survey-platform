import { NextRequest, NextResponse } from 'next/server'
import { customerStorage } from '@/lib/customerStorage'
import { tallyCacheService } from '@/lib/tallyCache'

const TALLY_API_KEY = process.env.TALLY_API_KEY || 'tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE'
const TALLY_API_BASE = 'https://api.tally.so'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: customerId } = await params
  
  try {
    const surveys = customerStorage.getCustomerSurveys(customerId)
    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Error fetching customer surveys:', error)
    return NextResponse.json({ error: 'Failed to fetch customer surveys' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: customerId } = await params
  
  try {
    const body = await request.json()
    const { templateId, assignedTo, customTitle, customDescription } = body
    
    // Get the original Tally form data
    const originalForm = tallyCacheService.getFormData(templateId)
    if (!originalForm) {
      return NextResponse.json({ error: 'Template form not found' }, { status: 404 })
    }

    const customer = customerStorage.getCustomer(customerId)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create a copy of the form in Tally for individual evaluation
    const copiedFormData = {
      title: customTitle || `${originalForm.title} - ${customer.companyName}`,
      description: customDescription || `${originalForm.description} - Individuelle Auswertung für ${customer.companyName}`,
      status: "PUBLISHED",
      blocks: originalForm.questions ? originalForm.questions.flatMap((question: any, index: number) => {
        const timestamp = Date.now();
        const groupUuid = `group-${timestamp}-${index}`;
        
        // Create question title block
        const titleBlock = {
          uuid: `title-${timestamp}-${index}`,
          type: 'TITLE',
          groupUuid: groupUuid,
          groupType: 'QUESTION',
          payload: {
            safeHTMLSchema: [[question.title]]
          }
        };
        
        // Create input block
        const inputType = question.type === 'text' ? 'INPUT_TEXT' : 
                         question.type === 'email' ? 'INPUT_EMAIL' :
                         question.type === 'textarea' ? 'TEXTAREA' :
                         question.type === 'radio' ? 'MULTIPLE_CHOICE' :
                         question.type === 'checkbox' ? 'CHECKBOXES' :
                         question.type === 'rating' ? 'LINEAR_SCALE' :
                         'INPUT_TEXT';
        
        const inputBlock = {
          uuid: `input-${timestamp}-${index}`,
          type: inputType,
          groupUuid: `input-group-${timestamp}-${index}`,
          groupType: inputType,
          payload: {
            isRequired: question.required || false,
            ...(question.description && { description: question.description }),
            ...(inputType === 'LINEAR_SCALE' && {
              start: 1,
              end: 5,
              step: 1,
              hasLeftLabel: true,
              leftLabel: "Poor",
              hasRightLabel: true,
              rightLabel: "Excellent"
            }),
            ...(question.options && question.options.length > 0 && {
              options: question.options.map((option: string, idx: number) => ({
                uuid: `option-${timestamp}-${idx}`,
                label: option
              }))
            })
          }
        };
        
        return [titleBlock, inputBlock];
      }) : []
    }

    // Create form in Tally
    let tallyFormId = null
    try {
      const response = await fetch(`${TALLY_API_BASE}/forms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TALLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(copiedFormData),
      })

      if (response.ok) {
        const tallyData = await response.json()
        tallyFormId = tallyData.id
        console.log(`✅ Created individual Tally form ${tallyFormId} for customer ${customer.companyName}`)
      }
    } catch (tallyError) {
      console.error('Failed to create Tally form copy:', tallyError)
    }

    // Assign survey to customer
    const customerSurvey = customerStorage.assignSurveyToCustomer(customerId, templateId, assignedTo)
    
    if (!customerSurvey) {
      return NextResponse.json({ error: 'Failed to assign survey' }, { status: 500 })
    }

    // Update with Tally form ID if created successfully
    if (tallyFormId) {
      customerSurvey.tallyFormId = tallyFormId
      customerSurvey.title = copiedFormData.title
      customerSurvey.description = copiedFormData.description
    }

    return NextResponse.json({
      success: true,
      survey: customerSurvey,
      tallyUrl: tallyFormId ? `https://tally.so/r/${tallyFormId}` : null
    })
  } catch (error) {
    console.error('Error assigning survey to customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to assign survey' },
      { status: 500 }
    )
  }
}