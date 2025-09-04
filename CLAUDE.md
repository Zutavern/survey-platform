# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern survey system built with Next.js 15, TypeScript, Prisma ORM, and Shadcn UI components. The application allows users to create and manage surveys with various question types (text, multiple choice, checkbox, rating), collect responses, and analyze results.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build the application
npm run build

# Start production server  
npm start

# Run ESLint
npm run lint
```

## Database Management

The project uses **Neon (Serverless PostgreSQL)** with Prisma ORM for both development and production:

### Development with Neon
```bash
# Setup development database (see NEON_SETUP.md)
cp .env.local.example .env.local
# Add your Neon development database URL

# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to Neon development database
npx prisma db push

# Create test users
node scripts/create-test-users.js

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Production Migrations
```bash
# Create and apply migrations
npx prisma migrate dev --name [migration-name]
npx prisma migrate deploy

# Production deployment uses Neon main branch automatically
# via Vercel environment variables
```

For detailed Neon setup instructions, see `NEON_SETUP.md`.

## Recent Database Schema Changes

### Form Persistence Models (Added)
The application now includes a universal form storage system:

```prisma
model FormDefinition {
  id          String   @id @default(cuid())
  sourceId    String?  // Links to external providers (e.g., Tally)
  title       String
  description String?
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  fields      FormField[]
  submissions FormSubmission[]
}

model FormField {
  id       String   @id @default(cuid())
  formId   String
  key      String   // Stable identifier for the field
  label    String
  type     String   // Field type (text, email, radio, etc.)
  required Boolean  @default(false)
  order    Int      @default(0)
  options  Json?    // Field configuration as JSON
}

model FormSubmission {
  id          String   @id @default(cuid())
  formId      String
  submittedAt DateTime @default(now())
  respondent  String?
  meta        Json?
  answers     FormAnswer[]
  analyses    Analysis[]  // AI analysis results
}

model Analysis {
  id           String   @id @default(cuid())
  submissionId String
  model        String   // AI model used (e.g., "gpt-4")
  result       Json     // Analysis results
  createdAt    DateTime @default(now())
}
```

### API Credentials Security (Added)
Encrypted storage for user API keys:

```prisma
model ApiCredential {
  id           String   @id @default(cuid())
  userEmail    String   @unique
  tallyCipher  String?  // AES-256-GCM encrypted components
  tallyIv      String?
  tallyTag     String?
  openaiCipher String?
  openaiIv     String?
  openaiTag    String?
}
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI, Radix UI primitives
- **Database**: Neon (Serverless PostgreSQL) with Prisma ORM
- **AI Integration**: OpenAI GPT-4 for form generation and submission analysis
- **Icons**: Lucide React

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - Reusable Shadcn UI components
- `src/lib/` - Utility functions and Prisma client setup
- `prisma/schema.prisma` - Database schema definition

### Database Schema
The core entities are:
- **User**: User management with surveys and responses
- **Survey**: Survey details with questions and responses
- **Question**: Questions with types (TEXT, MULTIPLE_CHOICE, CHECKBOX, RATING)
- **Option**: Answer options for multiple choice questions
- **Response**: User submissions to surveys
- **Answer**: Individual answers linking responses to questions/options
- **Customer**: Customer management with contact information and assigned surveys
- **ContactPerson**: Additional contacts for customer organizations
- **CustomerSurvey**: Surveys assigned to customers with Tally integration
- **FormDefinition**: Generic form storage for both Tally and local forms
- **FormField**: Configurable form fields with validation and options
- **FormSubmission**: User submissions to forms with metadata
- **FormAnswer**: Individual answers to form fields with JSON value storage
- **Analysis**: AI-powered analysis results of form submissions
- **ApiCredential**: Encrypted storage of user API keys (Tally, OpenAI)

### Color Scheme
The application uses a consistent dark blue color palette:
- Primary: `#1e3a8a` (dark blue)
- Secondary: `#dbeafe` (light blue)  
- Accent: `#3b82f6` (standard blue)
- Background: `#f0f9ff` (very light blue)

## Component Development

### Adding Shadcn UI Components
```bash
# Add new Shadcn UI component
npx shadcn@latest add [component-name]
```

### Existing UI Components
- `button.tsx` - Button variants
- `card.tsx` - Card containers
- `input.tsx`, `textarea.tsx` - Form inputs
- `checkbox.tsx`, `radio-group.tsx` - Form controls
- `label.tsx` - Form labels
- `badge.tsx` - Status indicators
- `delete-confirmation-dialog.tsx` - Modal delete confirmations

## Environment Setup

### Development Environment
```bash
# Copy development environment template
cp .env.local.example .env.local

# Configure with your Neon development database
DATABASE_URL="postgresql://username:password@ep-dev-branch-xyz.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-dev-branch-xyz.neon.tech/neondb?sslmode=require"
JWT_SECRET="development-jwt-secret"
ENCRYPTION_KEY="dev-encryption-key-32-chars!!"
OPENAI_API_KEY="your-openai-api-key-here"
```

### Production Environment (Vercel)
Set these environment variables in Vercel:
- `@neon-database-url` - Neon production database URL
- `@neon-direct-url` - Neon direct connection URL  
- `@jwt-secret` - Production JWT secret
- `@encryption-key` - Production encryption key
- `@openai-api-key` - OpenAI API key for form generation

See `NEON_SETUP.md` for detailed configuration instructions.

## API Routes Structure

The application uses Next.js App Router with route handlers:

### Survey Management
- `POST /api/surveys` - Create new survey
- `GET /api/surveys` - List all surveys  
- `GET /api/surveys/[id]` - Get single survey
- `PUT /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey

### Customer Management
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get single customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### AI-Powered Features
- `POST /api/ai/generate-form` - Generate forms using OpenAI GPT-4
- `POST /api/ai/analyze-submission` - Analyze form submissions with AI

### Form Management
- `GET /api/forms` - List form definitions
- `POST /api/forms` - Create form definition
- `GET /api/forms/[id]` - Get form details
- `POST /api/forms/[id]/submit` - Submit form response

## AI-Powered Features

### Form Generation
The platform includes AI-powered form generation using OpenAI GPT-4:
- **Smart Form Creation**: Generate professional forms from natural language prompts
- **Comprehensive Field Types**: Supports text, email, phone, radio, checkbox, select, rating, scale, date, file upload
- **Intelligent Validation**: Automatically adds appropriate validation rules
- **Professional Styling**: Consistent theme and UX patterns

### Submission Analysis
AI-powered analysis of form submissions:
- **Content Analysis**: Extract insights from text responses
- **Sentiment Analysis**: Understand respondent sentiment
- **Pattern Recognition**: Identify trends across submissions
- **Automated Reporting**: Generate summaries and recommendations

### API Key Management
Secure storage of user API credentials:
- **Encrypted Storage**: Uses AES-256-GCM encryption for API keys
- **Per-User Keys**: Individual API keys for Tally and OpenAI
- **Fallback Support**: System-level keys as fallback option

## Form Persistence System

### Universal Form Storage
The platform provides a unified form storage system that works with both Tally forms and locally created forms:

#### FormDefinition Model
- Stores form metadata (title, description, status)
- Links to external providers via `sourceId`
- Tracks creation and modification dates

#### FormField Model  
- Flexible field configuration with JSON options
- Support for all common form field types
- Built-in validation and ordering

#### FormSubmission & FormAnswer Models
- Normalized submission storage
- JSON-based answer values for flexibility
- Complete audit trail with timestamps

### Benefits
- **Provider Agnostic**: Works with Tally, local forms, or future providers
- **Rich Analytics**: Enables cross-form analysis and reporting
- **Data Portability**: Easy migration between form providers
- **Consistent API**: Unified interface regardless of form source

## MCP Servers

The project is configured with the following MCP servers for enhanced AI capabilities:

### Context7 MCP
- **Purpose**: Up-to-date documentation and code examples
- **Usage**: Add "use context7" to prompts for current library documentation
- **Configuration**: Auto-configured via `npx -y @upstash/context7-mcp@latest`

### Tally MCP
- **Purpose**: Form management and survey creation via natural language
- **API Key**: `tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE`
- **Configuration**: Remote server via `mcp-remote`
- **Available Tools**:
  - `create_form` - Create new Tally forms with custom fields
  - `modify_form` - Update existing form configurations
  - `get_form` - Retrieve detailed form information
  - `list_forms` - Browse all forms
  - `delete_form` - Remove forms
  - `get_submissions` - Access form submission data
  - `analyze_submissions` - Get insights from responses
  - `share_form` - Generate sharing links and embed codes
  - `manage_workspace` - Handle workspace settings
  - `manage_team` - Team member and permission management

### MCP Server Management
```bash
# List all configured MCP servers
claude mcp list

# Get details about specific server
claude mcp get [server-name]

# Remove MCP server
claude mcp remove [server-name] -s local
```