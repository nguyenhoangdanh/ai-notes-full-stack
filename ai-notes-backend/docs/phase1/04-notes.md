# Notes Management API

Core note CRUD operations with advanced search and RAG processing.

## 📋 Overview

The notes system provides comprehensive note management with markdown support, tagging, search capabilities, and automatic AI processing for semantic search and chat integration.

### Features
- ✅ Full CRUD operations for notes
- ✅ Markdown content support  
- ✅ Tag-based organization
- ✅ Advanced search capabilities
- ✅ Automatic RAG processing for AI chat
- ✅ Workspace-scoped organization
- ✅ Soft deletion for data safety

## 🔐 Endpoints

### GET /notes

Get all notes for the authenticated user with optional filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `workspaceId` (string, optional) - Filter by workspace ID
- `limit` (string, optional) - Limit number of results (parsed as integer)

**Success Response (200):**
```json
[
  {
    "id": "cm4note123",
    "title": "My Important Note",
    "content": "# Heading\n\nNote content in **markdown** format...",
    "tags": ["work", "important"],
    "workspaceId": "cm4workspace123", 
    "ownerId": "cm4user123",
    "isDeleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z",
    "workspace": {
      "id": "cm4workspace123",
      "name": "My Workspace"
    }
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

### POST /notes

Create a new note with automatic background processing.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Note Title",
  "content": "# Note Content\n\nMarkdown formatted content here...",
  "tags": ["tag1", "tag2"], 
  "workspaceId": "cm4workspace123"
}
```

**Validation Rules:**
- `title`: Required string (@IsString)
- `content`: Required string (@IsString)  
- `tags`: Array of strings (@IsArray @IsString({ each: true }))
- `workspaceId`: Required string (@IsString)

**Success Response (201):**
```json
{
  "id": "cm4note456",
  "title": "New Note Title",
  "content": "# Note Content\n\nMarkdown formatted content here...",
  "tags": ["tag1", "tag2"],
  "workspaceId": "cm4workspace123",
  "ownerId": "cm4user123", 
  "isDeleted": false,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "workspace": {
    "id": "cm4workspace123", 
    "name": "My Workspace"
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "message": [
    "title must be a string",
    "content must be a string", 
    "workspaceId must be a string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}

// 404 - Workspace Not Found
{
  "message": "Workspace not found or not owned by user",
  "error": "Not Found", 
  "statusCode": 404
}
```

**Background Processing:**
- Automatic RAG processing via `processForRAG()`
- Auto-categorization queuing via `CategoriesService.queueAutoCategorization()`

---

### GET /notes/search

Search notes using text-based matching across title, content, and tags.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `q`: Search query string (@IsString, required)
- `limit`: Maximum results (@IsOptional @Type(() => Number) @IsNumber @Min(1) @Max(100), default: 10)

**Success Response (200):**
```json
[
  {
    "id": "cm4note123",
    "title": "React Development Guide", 
    "content": "# React Development\n\nReact is a JavaScript library...",
    "tags": ["react", "javascript", "development"],
    "workspaceId": "cm4workspace123",
    "ownerId": "cm4user123",
    "isDeleted": false,
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z",
    "workspace": {
      "id": "cm4workspace123",
      "name": "Development Notes"
    }
  }
]
```

**Search Implementation:**
- Uses Prisma `OR` conditions with case-insensitive matching
- `title.contains` with `mode: 'insensitive'`
- `content.contains` with `mode: 'insensitive'`
- `tags.hasSome` for tag array matching
- Filters out soft-deleted notes (`isDeleted: false`)
- Orders by `updatedAt: 'desc'`

---

### GET /notes/:id

Get a specific note by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string) - Note ID

**Success Response (200):**
```json
{
  "id": "cm4note123",
  "title": "My Important Note", 
  "content": "# Heading\n\nNote content in **markdown** format...",
  "tags": ["work", "important"],
  "workspaceId": "cm4workspace123",
  "ownerId": "cm4user123",
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z",
  "workspace": {
    "id": "cm4workspace123",
    "name": "My Workspace"
  }
}
```

**Error Responses:**
```json
// 404 - Note Not Found
{
  "message": "Note not found",
  "error": "Not Found",
  "statusCode": 404
}

// 401 - Unauthorized  
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### PATCH /notes/:id

Update an existing note with version control and re-processing.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `id` (string) - Note ID

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "content": "Updated content...", 
  "tags": ["new", "tags"],
  "workspaceId": "cm4workspace456"
}
```

**Validation Rules (UpdateNoteDto extends PartialType(CreateNoteDto)):**
- `title`: Optional string (@IsOptional @IsString)
- `content`: Optional string (@IsOptional @IsString)
- `tags`: Optional array of strings (@IsOptional @IsArray @IsString({ each: true }))
- `workspaceId`: Optional string (@IsOptional @IsString)

**Success Response (200):**
```json
{
  "id": "cm4note123",
  "title": "Updated Title", 
  "content": "Updated content...",
  "tags": ["new", "tags"],
  "workspaceId": "cm4workspace123",
  "ownerId": "cm4user123",
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T15:45:00.000Z",
  "workspace": {
    "id": "cm4workspace123",
    "name": "My Workspace"
  }
}
```

**Background Processing:**
- Version control via `VersionsService.handleNoteUpdate()` if title/content changed
- RAG re-processing if content changed
- Re-categorization if significant content change detected (>20% length change or >100 characters)

---

### DELETE /notes/:id

Soft delete a note (marks as deleted but keeps in database).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string) - Note ID

**Success Response (204):**
No content returned.

**Error Response (404):**
```json
{
  "message": "Note not found",
  "error": "Not Found", 
  "statusCode": 404
}
```

**Implementation Details:**
- Soft delete: sets `isDeleted: true` in database
- Removes associated vectors via `VectorsService.deleteByNote()`
- Note excluded from all future queries

---

### POST /notes/:id/process-rag

Manually trigger RAG processing for a note to enable AI chat functionality.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string) - Note ID

**Success Response (202):**
```json
{
  "message": "Processing started"
}
```

**Processing Details:**
- Calls `VectorsService.processNoteForRAG()` asynchronously
- Error handling with console logging
- Does not wait for completion (fire-and-forget)

**Error Response (404):**
```json
{
  "message": "Note not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🔧 Implementation Details

### Authentication & Authorization
- All endpoints protected by `JwtAuthGuard`
- User extracted from JWT via `@CurrentUser()` decorator
- All database queries scoped by `ownerId: userId`

### Database Operations
- Uses Prisma ORM with explicit `include` for workspace data
- Soft delete implementation with `isDeleted` flag
- All queries filter by `isDeleted: false` except delete operation
- Workspace ownership verification in create/update operations

### Service Dependencies
- **VectorsService**: RAG processing and vector management
- **CategoriesService**: Auto-categorization functionality  
- **VersionsService**: Version control with forwardRef to avoid circular dependency
- **PrismaService**: Database operations

### Content Change Detection
Private method `hasSignificantContentChange()`:
- Calculates length difference and ratio
- Triggers re-categorization if >20% change or >100 characters
- Used to optimize background processing

### Error Handling
- Comprehensive validation via DTOs and class-validator
- Custom NotFoundException for missing resources
- Workspace ownership validation before operations
- Graceful error handling in background processing

## 🧪 Testing Examples

**Create note:**
```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note with **markdown**",
    "tags": ["test", "markdown"],
    "workspaceId": "YOUR_WORKSPACE_ID"
  }'
```

**Search notes:**
```bash
curl -X GET "http://localhost:3001/api/notes/search?q=markdown&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update note:**
```bash
curl -X PATCH http://localhost:3001/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Process for RAG:**
```bash
curl -X POST http://localhost:3001/api/notes/NOTE_ID/process-rag \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Next:** [Vector Search & RAG API](./05-vectors.md)
