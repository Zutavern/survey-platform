import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Comprehensive Tally form schema with all possible field types
const TALLY_FORM_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Form title (max 100 characters)"
    },
    description: {
      type: "string", 
      description: "Form description (max 500 characters)"
    },
    settings: {
      type: "object",
      properties: {
        allowMultipleSubmissions: { type: "boolean", default: false },
        requireLogin: { type: "boolean", default: false },
        collectEmails: { type: "boolean", default: true },
        showProgressBar: { type: "boolean", default: true },
        showQuestionNumbers: { type: "boolean", default: true },
        randomizeQuestions: { type: "boolean", default: false },
        autoSave: { type: "boolean", default: true },
        confirmBeforeSubmit: { type: "boolean", default: false },
        thankYouMessage: { type: "string", default: "Vielen Dank für Ihre Teilnahme!" },
        redirectUrl: { type: "string", description: "URL to redirect after submission" },
        submitButtonText: { type: "string", default: "Absenden" },
        theme: {
          type: "object",
          properties: {
            primaryColor: { type: "string", default: "#3B82F6" },
            backgroundColor: { type: "string", default: "#FFFFFF" },
            textColor: { type: "string", default: "#1F2937" },
            fontFamily: { type: "string", enum: ["Inter", "Roboto", "Open Sans", "Lato", "Poppins"] }
          }
        },
        notifications: {
          type: "object", 
          properties: {
            email: { type: "string", description: "Email for form notifications" },
            webhook: { type: "string", description: "Webhook URL for real-time notifications" },
            slackWebhook: { type: "string", description: "Slack webhook for notifications" }
          }
        }
      }
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { 
            type: "string", 
            enum: [
              "text", "textarea", "email", "url", "phone", "number", 
              "radio", "checkbox", "select", "multiselect",
              "rating", "scale", "ranking", "date", "time", "datetime",
              "file_upload", "signature", "address", "payment",
              "legal_consent", "section_break", "page_break",
              "matrix_radio", "matrix_checkbox", "slider",
              "image_choice", "video_choice", "audio_upload",
              "calculation", "conditional_logic", "hidden"
            ]
          },
          title: { type: "string", description: "Question title" },
          description: { type: "string", description: "Question description/help text" },
          required: { type: "boolean", default: false },
          placeholder: { type: "string", description: "Placeholder text for input fields" },
          
          // Options for choice-based questions
          options: {
            type: "array",
            items: { type: "string" },
            description: "Options for radio, checkbox, select questions"
          },
          
          // Advanced field properties
          validation: {
            type: "object",
            properties: {
              minLength: { type: "number" },
              maxLength: { type: "number" },
              minValue: { type: "number" },
              maxValue: { type: "number" },
              pattern: { type: "string", description: "Regex pattern for validation" },
              customMessage: { type: "string", description: "Custom validation error message" }
            }
          },
          
          // Rating/Scale specific
          ratingScale: {
            type: "object",
            properties: {
              min: { type: "number", default: 1 },
              max: { type: "number", default: 5 },
              step: { type: "number", default: 1 },
              lowLabel: { type: "string", description: "Label for lowest rating" },
              highLabel: { type: "string", description: "Label for highest rating" }
            }
          },
          
          // File upload specific
          fileUpload: {
            type: "object",
            properties: {
              allowedTypes: { type: "array", items: { type: "string" } },
              maxFileSize: { type: "number", description: "Max file size in MB" },
              maxFiles: { type: "number", default: 1 }
            }
          },
          
          // Date/Time specific
          dateTime: {
            type: "object",
            properties: {
              format: { type: "string", enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
              minDate: { type: "string" },
              maxDate: { type: "string" },
              disablePastDates: { type: "boolean", default: false },
              disableFutureDates: { type: "boolean", default: false }
            }
          },
          
          // Matrix questions
          matrix: {
            type: "object",
            properties: {
              rows: { type: "array", items: { type: "string" } },
              columns: { type: "array", items: { type: "string" } }
            }
          },
          
          // Conditional logic
          conditionalLogic: {
            type: "object",
            properties: {
              showIf: {
                type: "object",
                properties: {
                  questionId: { type: "string" },
                  operator: { type: "string", enum: ["equals", "not_equals", "contains", "greater_than", "less_than"] },
                  value: { type: "string" }
                }
              }
            }
          },
          
          // Payment specific
          payment: {
            type: "object",
            properties: {
              currency: { type: "string", default: "EUR" },
              amount: { type: "number" },
              description: { type: "string" },
              allowCustomAmount: { type: "boolean", default: false }
            }
          }
        },
        required: ["type", "title"]
      }
    }
  },
  required: ["title", "questions"]
}

const SYSTEM_PROMPT = `You are an expert form designer specializing in creating professional surveys and assessments using Tally.
Your task is to generate comprehensive, well-structured forms based on user prompts.

CAPABILITIES:
- All Tally field types: text, textarea, email, url, phone, number, radio, checkbox, select, multiselect, rating, scale, ranking, date, time, datetime, file_upload, signature, address, payment, legal_consent, section_break, page_break, matrix_radio, matrix_checkbox, slider, image_choice, video_choice, audio_upload, calculation, conditional_logic, hidden
- Advanced validation rules and constraints
- Conditional logic and branching
- Professional styling and theming
- Payment integration
- File upload with restrictions
- Matrix questions for complex data collection
- Multi-page forms with progress tracking
- Custom validation messages
- Email notifications and webhooks

DESIGN PRINCIPLES:
1. Create logical question flow
2. Use appropriate field types for data collection
3. Include validation where necessary
4. Add helpful descriptions and placeholders
5. Structure complex forms with sections
6. Consider user experience and accessibility
7. Include professional styling options
8. Add conditional logic for dynamic forms

Generate forms that are:
- Professional and user-friendly
- Comprehensive but not overwhelming
- Properly validated and structured
- Accessible and mobile-responsive
- Suitable for the intended use case

Always return valid JSON matching the schema provided.`

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Use provided API key or fall back to environment variable
    const openaiKey = apiKey || process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      )
    }

    const openaiClient = new OpenAI({
      apiKey: openaiKey,
    })

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4-1106-preview", // Using GPT-4 Turbo for better JSON generation
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user", 
          content: `Create a professional form based on this prompt: "${prompt}"\n\nGenerate a comprehensive form with appropriate field types, validation, styling, and advanced features. Make it production-ready and user-friendly.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated from OpenAI')
    }

    let formData
    try {
      formData = JSON.parse(generatedContent)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON generated by AI' },
        { status: 500 }
      )
    }

    // Validate and enhance the generated form
    const enhancedForm = {
      id: `ai-form-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      aiGenerated: true,
      originalPrompt: prompt,
      
      // Ensure required fields
      settings: {
        allowMultipleSubmissions: false,
        showProgressBar: true,
        collectEmails: true,
        confirmBeforeSubmit: true,
        submitButtonText: "Absenden",
        thankYouMessage: "Vielen Dank für Ihre Teilnahme!",
        theme: {
          primaryColor: "#3B82F6",
          backgroundColor: "#FFFFFF", 
          textColor: "#1F2937",
          fontFamily: "Inter"
        },
        ...formData.settings
      },
      
      // Add IDs to questions if missing
      questions: formData.questions?.map((question: any, index: number) => ({
        id: question.id || `q${index + 1}`,
        order: index + 1,
        ...question
      })) || []
    }

    // Return the generated form
    return NextResponse.json({
      success: true,
      form: enhancedForm,
      metadata: {
        promptLength: prompt.length,
        questionCount: enhancedForm.questions.length,
        estimatedCompletionTime: Math.ceil(enhancedForm.questions.length * 0.5), // 30 seconds per question
        generatedAt: new Date().toISOString(),
        model: "gpt-4-1106-preview"
      }
    })

  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your API key and billing.' },
        { status: 402 }
      )
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key provided.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate form', details: error.message },
      { status: 500 }
    )
  }
}