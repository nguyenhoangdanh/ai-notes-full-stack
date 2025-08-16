# Authentication API

Complete authentication system with email/password and Google OAuth support.

## 📋 Overview

The authentication system provides secure user registration, login, and token management. Supports both traditional email/password and Google OAuth authentication methods.

### Features
- ✅ Email/password registration and login
- ✅ Google OAuth integration
- ✅ JWT token management (7-day expiry)
- ✅ Token verification
- ✅ User profile retrieval
- ✅ Automatic workspace and settings creation

## 🔐 Endpoints

### POST /auth/register

Register a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, required (@IsEmail)
- `password`: Minimum 6 characters, required (@IsString @MinLength(6))
- `name`: String, optional (@IsOptional @IsString)

**Success Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm4abc123def",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "message": ["email must be a valid email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request",
  "statusCode": 400
}

// 409 - User Already Exists
{
  "message": "User with this email already exists",
  "error": "Conflict", 
  "statusCode": 409
}
```

---

### POST /auth/login

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com", 
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Valid email format, required (@IsEmail)
- `password`: String, required (@IsString)

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm4abc123def",
    "email": "user@example.com", 
    "name": "John Doe",
    "image": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error Responses:**
```json
// 401 - Invalid Credentials
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}

// 401 - OAuth User (No Password)
{
  "message": "Please use Google login or reset your password",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

---

### GET /auth/google

Initiate Google OAuth authentication flow.

**No Parameters Required**

**Behavior:** Redirects to Google OAuth consent screen

**OAuth Configuration:**
- Scopes: `email`, `profile`
- Callback URL: `/auth/google/callback`

---

### GET /auth/google/callback

Google OAuth callback endpoint (internal use only).

**No Parameters Required**

**Behavior:**
- Processes Google OAuth response
- Creates user account if doesn't exist
- Updates existing user with Google profile info
- Redirects to frontend with token

**Redirect URL:**
```
${FRONTEND_URL}/auth/callback?token=<jwt_token>
```

---

### GET /auth/verify

Verify JWT token validity and get user info.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "cm4abc123def",
    "email": "user@example.com",
    "name": "John Doe", 
    "image": "https://lh3.googleusercontent.com/...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### GET /auth/me

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "id": "cm4abc123def", 
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://lh3.googleusercontent.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## 🔧 Implementation Details

### JWT Token Configuration
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable via JWT_EXPIRES_IN)
- **Secret**: Stored in JWT_SECRET environment variable

**Token Payload:**
```json
{
  "email": "user@example.com",
  "sub": "user_id",
  "iat": 1642723200,
  "exp": 1643328000
}
```

### Google OAuth Setup

**Required Environment Variables:**
```env
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

**Redirect URIs (Google Cloud Console):**
- Development: `http://localhost:3001/api/auth/google/callback`
- Production: `https://your-api.domain.com/api/auth/google/callback`

### Automatic Resource Creation

When a new user is created, the system automatically:

1. **Creates Default Workspace:**
```json
{
  "name": "My Workspace",
  "isDefault": true,
  "ownerId": "user_id"
}
```

2. **Creates Default Settings:**
```json
{
  "model": "gemini-1.5-flash",
  "maxTokens": 4000,
  "autoReembed": true,
  "ownerId": "user_id"
}
```

## 🛡️ Security Features

### Password Security
- Passwords hashed with bcryptjs (12 rounds)
- Passwords never returned in API responses

### OAuth Security
- Google OAuth with proper scopes
- Secure callback URL validation
- Automatic profile image updates

## 🧪 Testing Examples

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "testpass123"
  }'
```

**Verify Token:**
```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Next:** [User Management API](./02-users.md)
