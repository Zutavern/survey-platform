#!/bin/bash

# Survey Platform Deployment Script
# This script handles deployment to Vercel with proper checks

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN environment variable is not set"
    echo "   Please set it with: export VERCEL_TOKEN=your_token_here"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Run tests
echo "🧪 Running tests..."
if npm test --passWithNoTests; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
    exit 1
fi

# Build the application
echo "🏗️ Building application..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

if [ "$1" = "production" ] || [ "$1" = "prod" ]; then
    echo "📦 Deploying to PRODUCTION..."
    vercel --prod --token=$VERCEL_TOKEN
    echo "🎉 Successfully deployed to production!"
else
    echo "📦 Deploying to PREVIEW..."
    PREVIEW_URL=$(vercel --token=$VERCEL_TOKEN)
    echo "🎉 Successfully deployed to preview!"
    echo "🔗 Preview URL: $PREVIEW_URL"
fi

echo "✅ Deployment completed successfully!"