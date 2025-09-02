import { NextRequest, NextResponse } from 'next/server'
import { tallyCacheService } from '@/lib/tallyCache'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { decrypt, Encrypted } from '@/lib/crypto'
import { cookies } from 'next/headers'
const TALLY_API_BASE = 'https://api.tally.so'

/**
 * Resolve the Tally API key for the current request:
 * 1. If an authenticated user cookie is present, try to load & decrypt
 *    a per-user key from the database.
 * 2. Fallback to the server-level environment variable.
 */
async function resolveTallyApiKey(): Promise<string | undefined> {
  try {
    // `cookies()` became async in Next 15, therefore await it before accessing
    const cookieStore = await cookies()
    const authCookie  = cookieStore.get('auth-token')
    if (authCookie?.value === 'authenticated') {
      // Simplified: single admin user
      const cred = await prisma.apiCredential.findUnique({
        where: { userEmail: 'admin@admin.com' },
        select: { tallyCipher: true, tallyIv: true, tallyTag: true },
      })
      if (cred?.tallyCipher && cred.tallyIv && cred.tallyTag) {
        try {
          return decrypt({
            cipher: cred.tallyCipher,
            iv: cred.tallyIv,
            tag: cred.tallyTag,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params
  
  try {
    const apiKey = await resolveTallyApiKey()
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No Tally API key configured for user or server',
          message: 'Configure a Tally API key in Settings first.',
        },
        { status: 500 }
      )
    }

    // Check cache first (2 minute cache for analytics)
    const cachedAnalytics = tallyCacheService.getAnalytics(formId);
    if (cachedAnalytics && tallyCacheService.isFresh(`analytics-${formId}`, 2)) {
      console.log(`📊 Returning cached analytics for form ${formId}`);
      return NextResponse.json(cachedAnalytics);
    }

    console.log(`🔄 Fetching fresh analytics for form ${formId}...`);

    // Fetch form details
    const formResponse = await fetch(`${TALLY_API_BASE}/forms/${formId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!formResponse.ok) {
      throw new Error(`Tally form API error: ${formResponse.status}`)
    }

    const formData = await formResponse.json()
    
    // Try to fetch submissions, but continue without them if unauthorized
    let submissionsData = { items: [] };
    try {
      const submissionsResponse = await fetch(`${TALLY_API_BASE}/forms/${formId}/responses`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (submissionsResponse.ok) {
        submissionsData = await submissionsResponse.json();
        console.log(`📊 Fetched ${submissionsData.items?.length || 0} submissions`);
      } else if (submissionsResponse.status === 401) {
        console.log(`⚠️  No access to submissions data (401) - continuing with form data only`);
      } else {
        console.log(`⚠️  Submissions API error ${submissionsResponse.status} - continuing without submissions`);
      }
    } catch (submissionsError) {
      console.log(`⚠️  Could not fetch submissions:`, submissionsError);
    }

    console.log(`✅ Form: ${formData.name || 'Untitled'}, Submissions: ${formData.numberOfSubmissions || 0}`);

    // Calculate analytics based on real Tally data
    const totalViews = 0; // Tally doesn't provide view count in API
    const totalSubmissions = formData.numberOfSubmissions || 0
    const conversionRate = 0; // Can't calculate without view count

    // Process real submissions
    const submissions = submissionsData.items?.map((response: any) => ({
      id: response.responseId,
      submittedAt: response.createdAt,
      answers: response.fields?.reduce((acc: any, field: any) => {
        acc[field.key] = field.value
        return acc
      }, {}) || {},
      completionTime: null, // Tally doesn't provide completion time
      source: 'tally'
    })) || []

    // Extract questions from form blocks
    const questionBlocks = formData.blocks?.filter((block: any) => 
      block.groupType === 'QUESTION' && block.type === 'TITLE'
    ) || [];

    const inputBlocks = formData.blocks?.filter((block: any) => 
      ['INPUT_TEXT', 'INPUT_EMAIL', 'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'LINEAR_SCALE', 'TEXTAREA'].includes(block.type)
    ) || [];

    // Generate question statistics from real data
    const questionStats = questionBlocks.map((titleBlock: any, index: number) => {
      const inputBlock = inputBlocks[index];
      const questionTitle = titleBlock.payload?.safeHTMLSchema?.[0]?.[0] || 'Question';
      
      // Find responses for this question
      const questionResponses = submissions.filter((sub: any) => sub.answers[titleBlock.uuid] || sub.answers[inputBlock?.uuid]);
      const responseCount = questionResponses.length;
      const responseRate = totalSubmissions > 0 ? (responseCount / totalSubmissions) * 100 : 0;

      // Calculate answer distribution for choice questions
      let answers: { [key: string]: number } = {};
      if (inputBlock && ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(inputBlock.type)) {
        questionResponses.forEach((sub: any) => {
          const answer = sub.answers[titleBlock.uuid] || sub.answers[inputBlock.uuid];
          if (Array.isArray(answer)) {
            answer.forEach((a: string) => {
              answers[a] = (answers[a] || 0) + 1;
            });
          } else if (answer) {
            answers[answer] = (answers[answer] || 0) + 1;
          }
        });
      }

      return {
        id: titleBlock.uuid,
        title: questionTitle,
        type: inputBlock ? mapTallyBlockType(inputBlock.type) : 'text',
        responseCount,
        responseRate,
        answers,
      };
    });

    const analytics = {
      id: formId,
      title: formData.name || 'Untitled Form',
      status: formData.status === 'PUBLISHED' ? 'published' : 'draft',
      totalViews,
      totalSubmissions,
      conversionRate,
      avgCompletionTime: 0, // Not available from Tally
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      lastSubmission: submissions.length > 0 ? submissions[submissions.length - 1].submittedAt : null,
      submissions: submissions.slice(-10), // Last 10 submissions
      questionStats,
      source: 'tally'
    }

    // Cache the analytics
    tallyCacheService.setAnalytics(formId, analytics);
    tallyCacheService.setFormData(`analytics-${formId}`, analytics);

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('❌ Error fetching Tally analytics:', error)
    
    // Try to return stale cached data if available
    const staleAnalytics = tallyCacheService.getAnalytics(formId);
    if (staleAnalytics) {
      console.log(`📋 Returning stale cached analytics for form ${formId} due to API error`);
      return NextResponse.json(staleAnalytics);
    }
    
    // Return minimal error response - no mock data
    return NextResponse.json({
      error: 'Unable to fetch analytics data',
      message: 'Tally API is currently unavailable and no cached data exists',
      formId,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

// Helper function to map Tally block types
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