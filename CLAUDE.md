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

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI, Radix UI primitives
- **Database**: Neon (Serverless PostgreSQL) with Prisma ORM
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
```

### Production Environment (Vercel)
Set these environment variables in Vercel:
- `@neon-database-url` - Neon production database URL
- `@neon-direct-url` - Neon direct connection URL  
- `@jwt-secret` - Production JWT secret
- `@encryption-key` - Production encryption key

See `NEON_SETUP.md` for detailed configuration instructions.

## API Routes Structure

The application uses Next.js App Router with route handlers:
- `POST /api/surveys` - Create new survey
- `GET /api/surveys` - List all surveys  
- `GET /api/surveys/[id]` - Get single survey
- `PUT /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey

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