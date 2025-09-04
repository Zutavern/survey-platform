import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import OpenAI from 'openai'

interface AnalyzeRequestBody {
  submissionId: string
}

function mapSubmissionToPayload(submission: any, fields: any[], answers: any[]) {
  const fieldById = new Map(fields.map((f) => [f.id, f]))
  const mappedAnswers = answers.map((a) => {
    const f = fieldById.get(a.fieldId)
    return {
      fieldKey: f?.key ?? a.fieldId,
      label: f?.label ?? 'Unknown',
      type: f?.type ?? 'text',
      value: a.value,
    }
  })

  return {
    form: {
      id: submission.form.id,
      title: submission.form.title,
      description: submission.form.description ?? '',
      status: submission.form.status,
    },
    submission: {
      id: submission.id,
      submittedAt: submission.submittedAt,
      respondent: submission.respondent ?? null,
    },
    answers: mappedAnswers,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    if (!body?.submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 })
    }

    const submission = await prisma.formSubmission.findUnique({
      where: { id: body.submissionId },
      include: {
        form: true,
        answers: true,
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const fields = await prisma.formField.findMany({ where: { formId: submission.formId } })
    const payload = mapSubmissionToPayload(submission, fields, submission.answers)

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'Du bist ein präziser Analyst. Antworte als valides kompaktes JSON mit Schlüsseln: insights, risks, recommended_next_steps.',
      },
      {
        role: 'user',
        content: `Analysiere folgende Formular-Submission und gib strukturierte Insights zurück. Daten: ${JSON.stringify(
          payload
        )}`,
      },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages,
      temperature: 0.2,
    })

    const content = completion.choices[0]?.message?.content || '{}'

    const saved = await prisma.analysis.create({
      data: {
        submissionId: submission.id,
        model: 'gpt-4o-mini',
        result: JSON.parse(content),
      },
    })

    return NextResponse.json({ success: true, analysisId: saved.id, result: saved.result })
  } catch (error: any) {
    console.error('Analyze submission error:', error)
    return NextResponse.json({ error: 'Failed to analyze submission' }, { status: 500 })
  }
}


