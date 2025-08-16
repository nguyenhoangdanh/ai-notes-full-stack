# Workspaces Management API

Workspace organization system for grouping and managing notes.

## 📋 Overview

Workspaces provide a way to organize notes into separate contexts. Each user has a default workspace created automatically, and can create additional workspaces as needed.

### Features
- ✅ Default workspace creation on user registration
- ✅ Multiple workspace support
- ✅ Workspace-scoped note organization
- ✅ User-specific workspace access

## 🔐 Endpoints

### GET /workspaces

Get all workspaces for the authenticated user, ordered by creation date (newest first).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
[
  {
    "id": "cm4workspace123",
    "name": "My Workspace",
    "ownerId": "cm4user123", 
    "isDefault": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "cm4workspace456", 
    "name": "Work Projects",
    "ownerId": "cm4user123",
    "isDefault": false,
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-10T09:00:00.000Z"
  }
]
```

**Error Response (401):**
```json
{
  "message": "Unauthorized", 
  "statusCode": 401
}
```

---

### GET /workspaces/default

Get the user's default workspace.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "id": "cm4workspace123",
  "name": "My Workspace",
  "ownerId": "cm4user123",
  "isDefault": true,
  "createdAt": "2024-01-01T00:00:00.000Z", 
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response if no default workspace (200):**
```json
null
```

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### POST /workspaces

Create a new workspace.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Project Workspace"
}
```

**Validation Rules:**
- `name`: Required string (validated by interface definition, no explicit decorators)

**Success Response (201):**
```json
{
  "id": "cm4workspace789",
  "name": "New Project Workspace", 
  "ownerId": "cm4user123",
  "isDefault": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
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

### Authentication & Authorization
- All endpoints protected by `JwtAuthGuard`
- User extracted from JWT token via `@CurrentUser()` decorator
- All operations automatically scoped to authenticated user

### Data Security
- All workspace queries filtered by `ownerId` to prevent cross-user access
- User ID automatically injected from JWT token, not from request body
- No explicit validation decorators in current CreateWorkspaceDto interface

### Database Operations
- `findAll()`: Returns all user workspaces ordered by `createdAt: 'desc'`
- `findDefault()`: Uses `findFirst()` with `where: { ownerId, isDefault: true }`
- `create()`: Creates workspace with `{ ...data, ownerId: userId, isDefault: false }`
- `findOne()`: Internal method for workspace access validation

### Default Workspace
- Created automatically during user registration in `UsersService.create()`
- Named "My Workspace" with `isDefault: true` flag
- Cannot be created through API (always auto-generated)

### Service Dependencies
- WorkspacesModule exports WorkspacesService for use in other modules
- Service depends only on PrismaService for database operations
- Used by NotesModule for workspace validation

## 🧪 Testing Examples

**Get workspaces:**
```bash
curl -X GET http://localhost:3001/api/workspaces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get default workspace:**
```bash
curl -X GET http://localhost:3001/api/workspaces/default \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create workspace:**
```bash
curl -X POST http://localhost:3001/api/workspaces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Workspace"}'
```

---

**Next:** [Notes Management API](./04-notes.md)
