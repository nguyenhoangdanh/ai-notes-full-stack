# Backend API Contract Ledger

## API Conventions

- **Base URL**: `/api/v1` (assumed from NestJS structure)
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json` for most endpoints
- **Field Casing**: camelCase throughout
- **Dates**: ISO 8601 strings
- **Success Envelope**: `{ success: boolean, data: T, message?: string }`
- **Error Format**: `{ error: string, message: string, statusCode: number }`
- **Pagination**: `{ page: number, limit: number, total: number, hasNext: boolean, hasPrev: boolean }`

## Authentication Module (/auth)

### POST /auth/register
- **Body**: `{ email: string, password: string, name?: string }`
- **Response**: `{ access_token: string, user: UserInfo }`
- **Errors**: 400 (validation), 409 (user exists)

### POST /auth/login  
- **Body**: `{ email: string, password: string }`
- **Response**: `{ access_token: string, user: UserInfo }`
- **Errors**: 401 (invalid credentials)

### GET /auth/google
- **Purpose**: Initiates Google OAuth flow
- **Response**: Redirect to Google OAuth

### GET /auth/google/callback
- **Query**: OAuth callback parameters
- **Response**: Redirect to frontend with token

### GET /auth/verify
- **Headers**: Authorization: Bearer {token}
- **Response**: `{ valid: boolean, user: UserInfo }`
- **Errors**: 401 (invalid token)

### GET /auth/me
- **Headers**: Authorization: Bearer {token}
- **Response**: `UserInfo`
- **Errors**: 401 (not authenticated)

## Users Module (/users)

### GET /users/profile
- **Headers**: Authorization: Bearer {token}
- **Response**: `UserProfile`

### PATCH /users/profile
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ name?: string, image?: string }`
- **Response**: `UserProfile`

## Workspaces Module (/workspaces)

### GET /workspaces
- **Headers**: Authorization: Bearer {token}
- **Response**: `Workspace[]`

### GET /workspaces/default
- **Headers**: Authorization: Bearer {token}
- **Response**: `Workspace`

### POST /workspaces
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ name: string }`
- **Response**: `Workspace`

## Notes Module (/notes)

### GET /notes
- **Headers**: Authorization: Bearer {token}
- **Query**: `{ workspaceId?: string, limit?: number }`
- **Response**: `Note[]`

### GET /notes/search
- **Headers**: Authorization: Bearer {token}
- **Query**: `{ q: string, limit?: number }`
- **Response**: `SearchResult[]`

### GET /notes/:id
- **Headers**: Authorization: Bearer {token}
- **Path**: `{ id: string }`
- **Response**: `Note`
- **Errors**: 404 (not found)

### POST /notes
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ title: string, content: string, tags: string[], workspaceId: string }`
- **Response**: `Note`

### PATCH /notes/:id
- **Headers**: Authorization: Bearer {token}
- **Path**: `{ id: string }`
- **Body**: `{ title?: string, content?: string, tags?: string[], workspaceId?: string }`
- **Response**: `Note`
- **Errors**: 404 (not found)

### DELETE /notes/:id
- **Headers**: Authorization: Bearer {token}
- **Path**: `{ id: string }`
- **Response**: 204 No Content
- **Errors**: 404 (not found)

### POST /notes/:id/process-rag
- **Headers**: Authorization: Bearer {token}
- **Path**: `{ id: string }`
- **Response**: `{ message: string }`

## Chat Module (/chat)

### POST /chat/stream
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ query: string, model?: string, maxTokens?: number }`
- **Response**: Streaming text response
- **Headers**: X-Citations (JSON array of citations)

### POST /chat/complete
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ query: string, model?: string, maxTokens?: number }`
- **Response**: `{ response: string, citations: Citation[] }`

### POST /chat/suggest
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ content: string, selectedText?: string, suggestionType: SuggestionType, targetLanguage?: string }`
- **Response**: `{ suggestion: string, type: string }`

### POST /chat/apply-suggestion
- **Headers**: Authorization: Bearer {token}
- **Body**: `{ noteId: string, originalContent: string, suggestion: string, selectedText?: string, applyType: ApplyType, position?: number }`
- **Response**: `{ content: string }`

## Smart Features

### Categories Module (/smart/categories)
- GET /smart/categories - List user categories
- POST /smart/categories - Create category
- PATCH /smart/categories/:id - Update category
- DELETE /smart/categories/:id - Delete category
- POST /smart/categories/auto-categorize - Auto-categorize notes

### Duplicates Module (/smart/duplicates)
- GET /smart/duplicates - Get duplicate reports
- POST /smart/duplicates/detect - Run duplicate detection
- PATCH /smart/duplicates/:id - Resolve duplicate
- POST /smart/duplicates/:id/merge - Merge duplicates

### Relations Module (/smart/relations)
- GET /smart/relations/:noteId - Get related notes
- POST /smart/relations/discover - Discover relations
- DELETE /smart/relations/:id - Remove relation

### Summaries Module (/smart/summaries)
- GET /smart/summaries/:noteId - Get note summary
- POST /smart/summaries/:noteId - Generate summary
- DELETE /smart/summaries/:noteId - Delete summary

## Collaboration Features

### Collaboration Module (/collaboration)
- GET /collaboration/notes/:noteId - Get collaborators
- POST /collaboration/notes/:noteId/invite - Invite collaborator
- PATCH /collaboration/:id - Update permissions
- DELETE /collaboration/:id - Remove collaborator

### Share Module (/share)
- GET /share/notes/:noteId/links - Get share links
- POST /share/notes/:noteId/links - Create share link
- PATCH /share/links/:id - Update share link
- DELETE /share/links/:id - Delete share link
- GET /share/:token - Access shared note

### Versions Module (/versions)
- GET /versions/notes/:noteId - Get note versions
- POST /versions/notes/:noteId - Create version
- GET /versions/:id - Get specific version
- POST /versions/:id/restore - Restore version

## Advanced Content Features

### Tags Module (/tags)
- GET /tags - List user tags
- POST /tags - Create tag
- PATCH /tags/:id - Update tag
- DELETE /tags/:id - Delete tag
- GET /tags/:id/notes - Get notes with tag

### Templates Module (/templates)
- GET /templates - List templates
- GET /templates/public - List public templates
- POST /templates - Create template
- PATCH /templates/:id - Update template
- DELETE /templates/:id - Delete template
- POST /templates/:id/use - Create note from template

### Attachments Module (/attachments)
- GET /attachments/notes/:noteId - Get note attachments
- POST /attachments/notes/:noteId - Upload attachment
- GET /attachments/:id - Download attachment
- DELETE /attachments/:id - Delete attachment
- GET /attachments/:id/ocr - Get OCR results

## Productivity Features (/productivity)

### Pomodoro
- GET /productivity/pomodoro/sessions - Get sessions
- POST /productivity/pomodoro/sessions - Start session
- PATCH /productivity/pomodoro/sessions/:id - Update session
- DELETE /productivity/pomodoro/sessions/:id - Cancel session

### Tasks
- GET /productivity/tasks - Get tasks
- POST /productivity/tasks - Create task
- PATCH /productivity/tasks/:id - Update task
- DELETE /productivity/tasks/:id - Delete task

### Calendar
- GET /productivity/calendar/events - Get events
- POST /productivity/calendar/events - Create event
- PATCH /productivity/calendar/events/:id - Update event
- DELETE /productivity/calendar/events/:id - Delete event

## Mobile Features (/mobile)

### Voice Notes
- GET /mobile/voice-notes - Get voice notes
- POST /mobile/voice-notes - Upload voice note
- GET /mobile/voice-notes/:id/transcription - Get transcription
- DELETE /mobile/voice-notes/:id - Delete voice note

### Location
- POST /mobile/location/notes/:noteId - Add location to note
- GET /mobile/location/notes/:noteId - Get note location
- DELETE /mobile/location/notes/:noteId - Remove location

### Offline Sync
- GET /mobile/sync/pending - Get pending sync operations
- POST /mobile/sync/operations - Submit sync operations
- POST /mobile/sync/resolve-conflicts - Resolve sync conflicts

## Notifications Module (/notifications)

- GET /notifications - Get user notifications
- PATCH /notifications/:id/read - Mark as read
- DELETE /notifications/:id - Delete notification
- POST /notifications/mark-all-read - Mark all as read

## Search Module (/search)

- GET /search - Advanced search with filters
- POST /search/save - Save search query
- GET /search/saved - Get saved searches
- DELETE /search/saved/:id - Delete saved search
- GET /search/history - Get search history

## Analytics Module (/analytics)

- GET /analytics/notes/:noteId - Get note analytics
- GET /analytics/dashboard - Get user dashboard analytics
- GET /analytics/usage - Get usage statistics

## Export Module (/export)

- POST /export/notes - Export notes
- GET /export/history - Get export history
- GET /export/:id/download - Download export file
- DELETE /export/:id - Delete export

## Settings Module (/settings)

- GET /settings - Get user settings
- PATCH /settings - Update user settings
- GET /settings/usage - Get usage statistics
- POST /settings/reset - Reset to defaults

## Type Definitions

### Common Types
```typescript
interface UserInfo {
  id: string
  email: string
  name?: string
  image?: string
}

interface Workspace {
  id: string
  name: string
  ownerId: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  workspaceId: string
  ownerId: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface Citation {
  noteId: string
  title: string
  excerpt: string
  relevance: number
}

type SuggestionType = 'improve' | 'expand' | 'summarize' | 'restructure' | 'examples' | 'grammar' | 'translate'
type ApplyType = 'replace' | 'append' | 'insert'
```

## Error Handling

All endpoints follow consistent error patterns:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (resource already exists)
- 429: Too Many Requests (rate limiting)
- 500: Internal Server Error

Error response format:
```typescript
interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}
```