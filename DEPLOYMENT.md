# AI Notes Full Stack - Environment Setup Guide

This guide covers the complete environment configuration for both development and production deployments of the AI Notes full-stack application.

## 🏗️ Architecture Overview

The AI Notes application consists of:
- **Frontend**: Next.js application with React Query and TypeScript
- **Backend**: NestJS API with Prisma ORM and PostgreSQL
- **Authentication**: Dual authentication system (cookies + headers) with JWT
- **External Services**: Firebase, Cloudflare R2, AI APIs

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (optional, for caching)
- Git

### 1. Frontend Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd ai-notes-full-stack

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your development values
```

**Required Frontend Variables:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:5000
NODE_ENV=development
```

### 2. Backend Environment Setup

```bash
# Navigate to backend
cd ai-notes-backend

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Edit .env with your development values
```

**Required Backend Variables:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_notes_dev"
JWT_SECRET="your-development-jwt-secret"
FRONTEND_URL="http://localhost:5000"
```

### 3. Database Setup

```bash
# Start PostgreSQL service
sudo service postgresql start

# Create database
createdb ai_notes_dev

# Run migrations
npm run prisma:migrate
npm run prisma:generate
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd ai-notes-backend
npm run start:dev

# Terminal 2: Start frontend  
cd ..
npm run dev
```

## 🚀 Production Deployment

### Environment Configuration

#### Frontend (Vercel/Netlify)

Use `.env.production.example` as template:

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-api.railway.app/api
NEXT_PUBLIC_COOKIE_SECURE=true
NODE_ENV=production
```

#### Backend (Railway/Heroku/DigitalOcean)

Use `.env.production.example` as template:

```env
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
FRONTEND_URL=https://your-app.vercel.app
COOKIE_SECURE=true
NODE_ENV=production
```

### Platform-Specific Deployment

#### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

#### Railway (Backend)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Configure start command: `npm run start:prod`
4. Set up PostgreSQL addon

#### Database Migration (Production)

```bash
# Run migrations in production
npx prisma migrate deploy
npx prisma generate
```

## 🔒 Security Configuration

### Authentication & Cookies

The application implements a dual authentication system:

1. **Primary**: HTTP-only cookies (secure, sameSite)
2. **Fallback**: Authorization headers (for iOS/macOS compatibility)

**Cookie Configuration:**
```typescript
// Production
{
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: '', // Leave empty for localhost compatibility
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

### CORS Configuration

**Development:**
```env
CORS_ORIGINS=http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000
```

**Production:**
```env
CORS_ORIGINS=https://your-app.vercel.app,https://your-domain.com
```

## 🔑 External Services Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://your-api.railway.app/api/auth/google/callback`

### Firebase (Optional)

1. Create Firebase project
2. Generate service account key
3. Configure storage bucket
4. Set environment variables

### AI APIs

#### OpenAI
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Set `OPENAI_API_KEY` environment variable

#### Google AI (Gemini)
1. Get API key from [Google AI Studio](https://makersuite.google.com)
2. Set `GOOGLE_AI_API_KEY` environment variable

## 📱 Cross-Platform Compatibility

### iOS/macOS Considerations

The authentication system includes special handling for iOS/macOS:

1. **Cookie fallback**: If cookies are blocked, uses Authorization headers
2. **iOS-specific headers**: `X-Access-Token` and `X-iOS-Fallback`
3. **CORS configuration**: Includes iOS compatibility headers

### Testing on Different Devices

```bash
# Test cookie authentication
curl -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test header fallback
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/auth/verify
```

## 🔍 Monitoring & Debugging

### Health Checks

**Frontend:**
- Endpoint: `${NEXT_PUBLIC_APP_URL}/api/health`

**Backend:**
- Endpoint: `${API_BASE_URL}/health`

### Environment Validation

The application includes built-in environment validation:

```typescript
// Backend validates required environment variables on startup
// Frontend validates configuration in providers
```

### Common Issues

1. **CORS Errors**: Check `CORS_ORIGINS` matches frontend URL exactly
2. **Cookie Not Set**: Ensure `COOKIE_SECURE` matches HTTPS usage
3. **Database Connection**: Verify `DATABASE_URL` format and credentials
4. **Authentication Fails**: Check `JWT_SECRET` consistency between deployments

## 📊 Feature Flags

Control application features through environment variables:

```env
# Frontend Features
NEXT_PUBLIC_ENABLE_SYNC=true
NEXT_PUBLIC_ENABLE_VOICE_NOTES=true  
NEXT_PUBLIC_ENABLE_TEMPLATES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true

# Backend Features  
DEBUG=false
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

## 🚨 Troubleshooting

### Development Issues

1. **Port conflicts**: Change ports in environment variables
2. **Database connection**: Check PostgreSQL service status
3. **Authentication errors**: Verify JWT_SECRET and cookie settings

### Production Issues

1. **HTTPS required**: Ensure all URLs use HTTPS in production
2. **Environment variables**: Double-check all required variables are set
3. **Database migrations**: Run migrations after deployment
4. **CORS issues**: Verify origin URLs match exactly

## 📞 Support

For deployment assistance:
1. Check the troubleshooting section above
2. Review environment variable requirements
3. Verify external service configurations
4. Test authentication flow on target platforms