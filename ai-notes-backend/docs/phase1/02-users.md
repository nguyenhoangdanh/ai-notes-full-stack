# User Management API

User profile management with secure data handling and profile updates.

## 📋 Overview

The user management system provides profile operations for authenticated users. All operations are secured with JWT authentication and automatically scoped to the current user.

### Features
- ✅ User profile retrieval
- ✅ Profile updates (name, image)
- ✅ Automatic user data scoping
- ✅ Password exclusion from responses

## 🔐 Endpoints

### GET /users/me

Get current authenticated user profile information.

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
  "image": "https://lh3.googleusercontent.com/a/default-user",
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

---

### PATCH /users/me

Update current user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "image": "https://new-avatar-url.com/avatar.jpg"
}
```

**Validation Rules:**
- `name`: Optional string (no explicit validation in code)
- `image`: Optional string (no explicit validation in code)

**Success Response (200):**
```json
{
  "id": "cm4abc123def",
  "email": "user@example.com",
  "name": "Updated Name",
  "image": "https://new-avatar-url.com/avatar.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
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

### Data Security
- User ID extracted from JWT token via @CurrentUser decorator
- Password field explicitly excluded from all responses using Prisma select
- All operations automatically scoped to authenticated user
- No access to other users' data

### Profile Updates
- Supports partial updates (only provided fields updated)
- No validation constraints on name or image fields in current implementation
- Name and image updates immediately reflected in responses
- Timestamps automatically updated by Prisma @updatedAt

### User Data Scoping
- All user queries use explicit select to exclude password
- findByEmail() method has includePassword parameter for auth purposes
- Response always follows User type interface (without password)

## 🧪 Testing Examples

**Get current user:**
```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update profile:**
```bash
curl -X PATCH http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "image": "https://example.com/avatar.jpg"
  }'
```

## 📝 Notes on Duplicate Endpoints

Both `/auth/me` and `/users/me` provide the same functionality:
- `/auth/me` returns user directly from @CurrentUser decorator
- `/users/me` also returns user directly from @CurrentUser decorator
- Both require JWT authentication via JwtAuthGuard
- Both return identical response format

---

**Next:** [Workspaces Management API](./03-workspaces.md)
