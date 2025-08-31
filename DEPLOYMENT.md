# 🚀 CI/CD Deployment Guide

## Overview
This project includes a complete CI/CD pipeline using GitHub Actions and Vercel for automated testing, building, and deployment.

## 🔧 Setup Instructions

### 1. Vercel Setup

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Login to Vercel
```bash
vercel login
```

#### Initialize Vercel Project
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your team/personal account
- Link to existing project? **N** 
- Project name: `survey-platform`
- Directory: `./` (current directory)
- Override settings? **N**

### 2. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following **Repository Secrets**:

#### Required Secrets:
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
TALLY_API_KEY=tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE
DATABASE_URL=postgresql://username:password@localhost:5432/survey_db
```

#### How to get these values:

**VERCEL_TOKEN:**
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token value

**VERCEL_ORG_ID and VERCEL_PROJECT_ID:**
```bash
vercel project ls
# Or check .vercel/project.json after running 'vercel'
```

### 3. Vercel Environment Variables

In your Vercel dashboard → Project Settings → Environment Variables:

Add these variables for **Production**, **Preview**, and **Development**:

```
TALLY_API_KEY=tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE
DATABASE_URL=postgresql://username:password@localhost:5432/survey_db
NODE_ENV=production
```

## 🔄 CI/CD Pipeline Features

### Automated Workflows:

#### 1. **Pull Request Workflow**
- ✅ Run tests on Node.js 18 & 20
- ✅ ESLint code quality check
- ✅ Security audit
- ✅ Build verification
- ✅ Deploy to Vercel Preview
- ✅ Lighthouse performance tests
- ✅ Automatic PR comment with preview URL

#### 2. **Main Branch Workflow**
- ✅ All PR checks plus:
- ✅ CodeQL security analysis
- ✅ Deploy to Vercel Production
- ✅ Production health checks

#### 3. **Security Features**
- 🛡️ npm audit for vulnerabilities
- 🛡️ CodeQL static analysis
- 🛡️ Dependency vulnerability scanning

## 📊 Deployment Commands

### Manual Deployment:
```bash
# Deploy to preview
npm run deploy

# Deploy to production
npm run deploy:prod

# Or use Vercel CLI directly
vercel --prod
```

### Local Development:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
```

## 🌐 Domain Configuration

### Custom Domain Setup:
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. SSL certificate will be automatically provisioned

### Recommended Domain Structure:
```
Production:  survey-platform.yourdomain.com
Staging:     staging.survey-platform.yourdomain.com  
Development: dev.survey-platform.yourdomain.com
```

## 🔍 Monitoring & Analytics

### Built-in Monitoring:
- 📈 Vercel Analytics (automatically enabled)
- 🚨 Error tracking via Vercel
- 📊 Performance monitoring
- 🔍 Lighthouse CI reports

### Health Check Endpoints:
```bash
GET /api/health        # Application health
GET /api/auth/check    # Authentication status
```

## 🚨 Troubleshooting

### Common Issues:

**Build Failures:**
```bash
# Check logs in GitHub Actions or Vercel
vercel logs your-deployment-url
```

**Environment Variables:**
```bash
# Verify environment variables are set
vercel env ls
```

**Database Connection:**
```bash
# Test database connection locally
npm run test:db
```

### Support:
- 📖 Check the GitHub Actions logs
- 🔍 Review Vercel deployment logs
- 📧 Check error notifications

## 🔄 Workflow Diagram

```
Push/PR → GitHub Actions → Tests → Build → Security Scan → Deploy
    ↓            ↓           ↓       ↓         ↓           ↓
  Trigger    Node 18/20   Jest    Next.js   CodeQL    Vercel
    ↓            ↓           ↓       ↓         ↓           ↓
 Webhook      ESLint     Coverage   Assets   Audit    Preview/Prod
```

## 📈 Performance Targets

Our CI/CD pipeline enforces these quality gates:
- 🎯 Performance Score: > 80
- 🎯 Accessibility Score: > 90
- 🎯 Best Practices: > 80
- 🎯 SEO Score: > 80
- ✅ Zero security vulnerabilities
- ✅ 100% test coverage goal

---

**🎉 Your app is now ready for professional deployment!**

The pipeline will automatically:
- Test your code on every push
- Deploy previews for every PR
- Deploy to production on main branch merges
- Monitor performance and security
- Provide detailed feedback via GitHub comments