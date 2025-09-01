import { NextRequest, NextResponse } from 'next/server'
import { tallyCacheService } from '@/lib/tallyCache'

const TALLY_API_KEY = process.env.TALLY_API_KEY || 'tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE'
const TALLY_API_BASE = 'https://api.tally.so'

export async function GET() {
  try {
    // Check cache first (5 minute cache)
    const cachedForms = tallyCacheService.getAllCachedForms();
    const hasRecentCache = cachedForms.length > 0 && tallyCacheService.isFresh('forms-list', 5);
    
    if (hasRecentCache) {
      console.log('📊 Returning cached Tally forms');
      return NextResponse.json(cachedForms.map(cached => cached.data));
    }

    console.log('🔄 Fetching fresh Tally forms data...');
    
    // Fetch from Tally API
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
    console.log(`✅ Fetched ${data.items?.length || 0} forms from Tally`);
    
    // Transform and cache Tally forms
    const tallyForms = await Promise.all(
      (data.items || []).map(async (form: any) => {
        // Fetch detailed form data including blocks/questions
        try {
          const detailResponse = await fetch(`${TALLY_API_BASE}/forms/${form.id}`, {
            headers: {
              'Authorization': `Bearer ${TALLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          let questions: any[] = [];
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            // Extract questions from blocks
            questions = detailData.blocks?.filter((block: any) => 
              block.groupType === 'QUESTION' && block.type === 'TITLE'
            ).map((block: any, index: number) => ({
              id: `q${index + 1}`,
              title: block.payload?.safeHTMLSchema?.[0]?.[0] || 'Question',
              type: 'text', // Default, we'd need more logic to determine actual type
              required: false
            })) || [];
          }

          const transformedForm = {
            id: form.id,
            title: form.name || 'Untitled Form',
            description: '',
            status: form.status === 'PUBLISHED' ? 'published' : 'draft',
            url: `https://tally.so/r/${form.id}`,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
            responses: form.numberOfSubmissions || 0,
            views: 0, // Tally doesn't provide view count in list API
            questions,
            source: 'tally'
          };

          // Cache individual form data
          tallyCacheService.setFormData(form.id, transformedForm);
          
          return transformedForm;
        } catch (detailError) {
          console.error(`Error fetching details for form ${form.id}:`, detailError);
          
          const basicForm = {
            id: form.id,
            title: form.name || 'Untitled Form',
            description: '',
            status: form.status === 'PUBLISHED' ? 'published' : 'draft',
            url: `https://tally.so/r/${form.id}`,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
            responses: form.numberOfSubmissions || 0,
            views: 0,
            questions: [],
            source: 'tally'
          };

          tallyCacheService.setFormData(form.id, basicForm);
          return basicForm;
        }
      })
    );

    // Cache the forms list
    tallyCacheService.setFormData('forms-list', tallyForms);

    return NextResponse.json(tallyForms)
  } catch (error) {
    console.error('❌ Error fetching Tally forms:', error)
    
    // Return cached data if available, even if stale
    const cachedForms = tallyCacheService.getAllCachedForms();
    if (cachedForms.length > 0) {
      console.log('📋 Returning stale cached data due to API error');
      return NextResponse.json(cachedForms.map(cached => cached.data));
    }
    
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Try real Tally API first
    const formData = {
      title: body.title,
      description: body.description,
      status: "PUBLISHED",
      blocks: (body.questions || []).flatMap((question: any, index: number) => {
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
            }),
            ...(inputType === 'TEXTAREA' && {
              hasDefaultAnswer: false,
              placeholder: question.description || ""
            })
          }
        };
        
        return [titleBlock, inputBlock];
      })
    }

    try {
      console.log('Attempting to create form in Tally:', JSON.stringify(formData, null, 2))
      const response = await fetch(`${TALLY_API_BASE}/forms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TALLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Tally API Response Status:', response.status)
      const responseText = await response.text()
      console.log('Tally API Response:', responseText)

      if (response.ok) {
        const data = JSON.parse(responseText)
        console.log('✅ Form successfully created in Tally!')
        return NextResponse.json({
          success: true,
          form: {
            id: data.id,
            title: data.title,
            description: data.description,
            status: 'published',
            createdAt: new Date().toISOString(),
            tallyUrl: `https://tally.so/r/${data.id}`
          }
        })
      }
    } catch (tallyError) {
      console.error('❌ Tally API failed, using mock storage:', tallyError)
    }

    // Fallback to mock storage
    const newForm = {
      id: `form-${Date.now()}`,
      title: body.title || 'Untitled Form',
      description: body.description || '',
      status: 'draft',
      questions: body.questions || [],
      settings: body.settings || {
        allowMultipleSubmissions: false,
        showProgressBar: true,
        collectEmails: true,
        thankYouMessage: 'Vielen Dank für Ihre Teilnahme!'
      },
      createdAt: new Date().toISOString(),
      aiGenerated: body.aiGenerated || false,
      originalPrompt: body.originalPrompt || ''
    }

    // Save to mock storage
    const savedForm = mockStorage.saveForm(newForm)

    return NextResponse.json({
      success: true,
      form: {
        id: savedForm.id,
        title: savedForm.title,
        description: savedForm.description,
        status: savedForm.status,
        createdAt: savedForm.createdAt,
        questions: savedForm.questions
      }
    })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create form' },
      { status: 500 }
    )
  }
}