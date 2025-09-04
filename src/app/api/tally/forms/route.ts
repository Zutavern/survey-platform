import { NextRequest, NextResponse } from 'next/server'
import { tallyCacheService } from '@/lib/tallyCache'
import { env } from '@/lib/env'
import { mockStorage } from '@/lib/mockStorage'
import { prisma } from '@/lib/prisma'
import { decrypt, Encrypted } from '@/lib/crypto'
import { cookies } from 'next/headers'

// Base URL stays constant
const TALLY_API_BASE = 'https://api.tally.so'

/**
 * Resolve the Tally API key for the current request:
 * 1. If authenticated (simple cookie check), look for encrypted key in DB and decrypt.
 * 2. Fallback to environment variable TALLY_API_KEY.
 */
async function resolveTallyApiKey(): Promise<string | undefined> {
  try {
    // `cookies()` must be awaited in Next.js 15+
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth-token')
    if (authCookie?.value === 'authenticated') {
      // Simplified auth: hard-coded admin user
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
  } catch (err) {
    console.error('Error resolving per-user Tally API key:', err)
  }
  // Fallback to env
  return env.TALLY_API_KEY
}

export async function GET() {
  try {
    const apiKey = await resolveTallyApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No Tally API key configured for user or server' },
        { status: 500 }
      )
    }

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
        'Authorization': `Bearer ${apiKey}`,
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
              'Authorization': `Bearer ${apiKey}`,
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

    // Merge in locally stored mock forms (e.g., AI-generated fallback) for dev/demo
    const mockFormsRaw = mockStorage.getAllForms();
    const mockForms = (mockFormsRaw || []).map((f: any) => ({
      id: f.id,
      title: f.title,
      description: f.description || '',
      status: f.status || 'draft',
      url: f.id.startsWith('form-') ? undefined : `https://tally.so/r/${f.id}`,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      responses: 0,
      views: 0,
      questions: f.questions || [],
      source: 'local'
    }));

    const combined = [...tallyForms, ...mockForms];

    // Cache the forms list
    tallyCacheService.setFormData('forms-list', combined);

    return NextResponse.json(combined)
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

    const apiKey = await resolveTallyApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'No Tally API key configured for user or server' },
        { status: 500 }
      )
    }
    
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
          'Authorization': `Bearer ${apiKey}`,
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
        // Invalidate cache so next GET returns fresh list including the new form
        tallyCacheService.clearAll()
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
    // Invalidate cache to include the newly saved local form in subsequent GET
    tallyCacheService.clearAll()

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