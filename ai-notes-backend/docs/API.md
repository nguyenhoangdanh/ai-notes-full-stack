# AI Notes Backend - Complete API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints (except auth endpoints) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Magic Link
```http
POST /auth/magic-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### OAuth Endpoints
```http
GET /auth/google      # Redirects to Google OAuth
GET /auth/github      # Redirects to GitHub OAuth
```

---

## 📝 Notes API

### List Notes
```http
GET /notes?workspaceId=<workspace_id>&limit=50
```

### Create Note
```http
POST /notes
Content-Type: application/json

{
  "title": "My Note Title",
  "content": "Note content in markdown format",
  "workspaceId": "workspace_id",
  "tags": ["tag1", "tag2"]
}
```

### Get Note
```http
GET /notes/:id
```

### Update Note
```http
PATCH /notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["updated", "tags"]
}
```

### Delete Note
```http
DELETE /notes/:id
```

### Search Notes
```http
GET /notes/search?q=search_term&limit=20
```

---

## 🧠 Smart Features API

### Categories

#### List Categories
```http
GET /categories
```

#### Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "Research",
  "description": "Research-related notes",
  "color": "#3B82F6",
  "keywords": ["research", "study", "analysis"]
}
```

#### Auto-Categorize Note
```http
POST /categories/auto-categorize/:noteId
```

### Duplicates

#### Find Duplicates
```http
GET /duplicates?status=PENDING
```

#### Merge Duplicates
```http
POST /duplicates/:id/merge
Content-Type: application/json

{
  "strategy": "keep_original" | "keep_duplicate" | "merge_content"
}
```

### Relations

#### Get Related Notes
```http
GET /relations/:noteId?limit=10
```

### Summaries

#### Generate Summary
```http
POST /summaries/:noteId
Content-Type: application/json

{
  "length": "short" | "medium" | "long",
  "model": "gpt-3.5-turbo"
}
```

#### Get Summary
```http
GET /summaries/:noteId
```

---

## 🚀 Productivity API

### Tasks

#### List Tasks
```http
GET /tasks?status=TODO&priority=HIGH
```

#### Create Task
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "noteId": "optional_note_id",
  "priority": "HIGH",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["documentation", "priority"]
}
```

#### Update Task
```http
PATCH /tasks/:id
Content-Type: application/json

{
  "status": "COMPLETED",
  "completedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Task Statistics
```http
GET /tasks/stats
```

### Pomodoro

#### Start Session
```http
POST /pomodoro
Content-Type: application/json

{
  "noteId": "optional_note_id",
  "duration": 25,
  "type": "WORK",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

#### Get Active Session
```http
GET /pomodoro/active
```

#### Update Session
```http
PATCH /pomodoro/:id
Content-Type: application/json

{
  "status": "COMPLETED",
  "completedAt": "2024-01-15T10:25:00Z"
}
```

#### Get Statistics
```http
GET /pomodoro/stats/today
GET /pomodoro/stats?start=2024-01-01&end=2024-01-31
```

### Calendar

#### List Events
```http
GET /calendar?start=2024-01-01&end=2024-01-31
```

#### Create Event
```http
POST /calendar
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync meeting",
  "noteId": "optional_note_id",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T15:00:00Z",
  "location": "Conference Room A",
  "isAllDay": false,
  "recurrence": "FREQ=WEEKLY;BYDAY=MO"
}
```

#### Get Today's Events
```http
GET /calendar/today
```

### Review System

#### List Review Prompts
```http
GET /review?active=true
```

#### Create Review Prompt
```http
POST /review
Content-Type: application/json

{
  "type": "WEEKLY",
  "title": "Weekly Reflection",
  "questions": [
    "What were the key insights this week?",
    "What patterns do I notice?",
    "What should I focus on next week?"
  ],
  "frequency": "weekly",
  "nextDue": "2024-01-21T18:00:00Z"
}
```

#### Answer Review Prompt
```http
POST /review/:id/answer
Content-Type: application/json

{
  "answers": [
    "Key insight: Need to organize notes better",
    "Pattern: Most productive in mornings",
    "Focus: Implement better tagging system"
  ]
}
```

#### Setup Default Prompts
```http
POST /review/setup-defaults
```

---

## 📱 Mobile Features API

### Voice Notes

#### Upload Voice Note
```http
POST /voice-notes/upload
Content-Type: multipart/form-data

# Form data:
audio: <audio_file>
noteId: "optional_note_id"
duration: 120
language: "en-US"
```

#### List Voice Notes
```http
GET /voice-notes?noteId=<note_id>
```

#### Get Transcription Status
```http
GET /voice-notes/:id/transcription
```

#### Retry Transcription
```http
POST /voice-notes/:id/retry-transcription
```

### Location Notes

#### Add Location to Note
```http
POST /location-notes
Content-Type: application/json

{
  "noteId": "note_id",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10
}
```

#### Add Location with Geocoding
```http
POST /location-notes/add-with-geocode
Content-Type: application/json

{
  "noteId": "note_id",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10
}
```

#### Find Nearby Notes
```http
GET /location-notes/nearby?lat=40.7128&lng=-74.0060&radius=5
```

#### Get Location Statistics
```http
GET /location-notes/stats
```

### Offline Sync

#### Queue Offline Changes
```http
POST /offline-sync/queue
Content-Type: application/json

{
  "deviceId": "device_uuid",
  "noteId": "note_id",
  "action": "CREATE" | "UPDATE" | "DELETE",
  "data": {
    "title": "Note title",
    "content": "Note content"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### Get Pending Sync
```http
GET /offline-sync/pending?deviceId=<device_id>
```

#### Process Sync
```http
POST /offline-sync/process
Content-Type: application/json

{
  "deviceId": "device_uuid"
}
```

#### Resolve Conflict
```http
POST /offline-sync/resolve-conflict/:syncId
Content-Type: application/json

{
  "resolution": "keep_server" | "keep_offline"
}
```

---

## 📤 Export API

### Create Export
```http
POST /export
Content-Type: application/json

{
  "type": "MULTIPLE_NOTES",
  "format": "PDF",
  "noteIds": ["note1", "note2", "note3"],
  "filename": "my-notes-export",
  "settings": {
    "includeMetadata": true,
    "includeTags": true,
    "includeImages": true,
    "formatOptions": {
      "fontSize": 12,
      "fontFamily": "Arial",
      "margins": {
        "top": 20,
        "bottom": 20,
        "left": 20,
        "right": 20
      }
    }
  }
}
```

### List Exports
```http
GET /export
```

### Download Export
```http
GET /export/:id/download
```

### Get Export Statistics
```http
GET /export/stats
```

---

## 🔔 Notifications & Reminders API

### Notifications

#### List Notifications
```http
GET /notifications?isRead=false&limit=50
```

#### Mark as Read
```http
POST /notifications/:id/read
```

#### Mark All as Read
```http
POST /notifications/mark-all-read
```

#### Get Unread Count
```http
GET /notifications/unread-count
```

### Reminders

#### Create Reminder
```http
POST /reminders
Content-Type: application/json

{
  "noteId": "note_id",
  "title": "Review quarterly goals",
  "remindAt": "2024-01-15T09:00:00Z",
  "recurrence": "monthly"
}
```

#### List Reminders
```http
GET /reminders?complete=false
```

#### Get Due Reminders
```http
GET /reminders/due
```

#### Mark Complete
```http
POST /reminders/:id/complete
```

#### Get Reminder Statistics
```http
GET /reminders/stats
```

---

## 🤝 Collaboration API

### Collaboration

#### Invite Collaborator
```http
POST /collaboration/:noteId/invite
Content-Type: application/json

{
  "email": "collaborator@example.com",
  "permission": "WRITE"
}
```

#### List Collaborations
```http
GET /collaboration/notes/:noteId
```

#### Update Permission
```http
PATCH /collaboration/:id
Content-Type: application/json

{
  "permission": "ADMIN"
}
```

### Sharing

#### Create Share Link
```http
POST /share
Content-Type: application/json

{
  "noteId": "note_id",
  "isPublic": true,
  "expiresAt": "2024-12-31T23:59:59Z",
  "allowComments": true,
  "requireAuth": false,
  "maxViews": 100,
  "password": "optional_password"
}
```

#### Get Share Link
```http
GET /share/:token
```

#### List Share Links
```http
GET /share/note/:noteId
```

### Versions

#### List Versions
```http
GET /versions/:noteId
```

#### Create Version
```http
POST /versions/:noteId
Content-Type: application/json

{
  "changeLog": "Added new section on API documentation"
}
```

#### Restore Version
```http
POST /versions/:versionId/restore
```

---

## 📊 Analytics API

### User Analytics
```http
GET /analytics/overview
```

**Response:**
```json
{
  "overview": {
    "noteCount": 150,
    "totalWordCount": 25000,
    "averageNoteLength": 167,
    "writingStreak": 7
  },
  "charts": {
    "notesByMonth": [
      {"month": "2024-01", "count": 20},
      {"month": "2024-02", "count": 25}
    ],
    "topTags": [
      {"tag": "research", "count": 45},
      {"tag": "personal", "count": 30}
    ]
  },
  "features": {
    "collaboration": {
      "sharedNotes": 12,
      "collaborations": 5,
      "shareLinks": 8
    },
    "tasks": {
      "total": 50,
      "completed": 35,
      "completionRate": 70
    },
    "pomodoro": {
      "totalSessions": 120,
      "totalDurationMinutes": 3000,
      "averageSessionLength": 25
    }
  }
}
```

### Workspace Analytics
```http
GET /analytics/workspaces
```

### Content Analytics
```http
GET /analytics/content
```

### Track Note Action
```http
POST /analytics/note/:noteId/track
Content-Type: application/json

{
  "action": "view" | "edit" | "share"
}
```

---

## 🔍 Search API

### Enhanced Search
```http
GET /search/enhanced?q=search_term&filters={"tags":["research"]}&limit=20
```

### Semantic Search
```http
POST /search/semantic
Content-Type: application/json

{
  "query": "machine learning algorithms",
  "limit": 10,
  "threshold": 0.7
}
```

### Search History
```http
GET /search/history?limit=50
```

### Saved Searches
```http
GET /search/saved
POST /search/saved
```

---

## 📁 File Management API

### Attachments

#### Upload Attachment
```http
POST /attachments/upload
Content-Type: multipart/form-data

# Form data:
file: <file>
noteId: "note_id"
description: "Optional description"
```

#### List Attachments
```http
GET /attachments/note/:noteId
```

#### Download Attachment
```http
GET /attachments/:id/download
```

### Templates

#### List Templates
```http
GET /templates?isPublic=true
```

#### Create Template
```http
POST /templates
Content-Type: application/json

{
  "name": "Meeting Notes Template",
  "description": "Standard template for meeting notes",
  "content": "# Meeting Notes\n\n**Date:** {{date}}\n**Attendees:** {{attendees}}\n\n## Agenda\n\n## Notes\n\n## Action Items\n",
  "tags": ["meeting", "template"],
  "isPublic": false,
  "metadata": {
    "variables": ["date", "attendees"]
  }
}
```

---

## 🏢 Workspace API

### List Workspaces
```http
GET /workspaces
```

### Create Workspace
```http
POST /workspaces
Content-Type: application/json

{
  "name": "Personal Projects",
  "isDefault": false
}
```

### Update Workspace
```http
PATCH /workspaces/:id
Content-Type: application/json

{
  "name": "Updated Workspace Name"
}
```

---

## ⚙️ Settings API

### Get Settings
```http
GET /settings
```

### Update Settings
```http
PATCH /settings
Content-Type: application/json

{
  "model": "gpt-4-turbo-preview",
  "maxTokens": 4000,
  "autoReembed": true
}
```

---

## 📈 Usage Tracking

### Get Usage Statistics
```http
GET /usage/stats
```

### Daily Usage
```http
GET /usage/daily?date=2024-01-15
```

---

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error details"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Request validation failed
- `CONFLICT` (409): Resource conflict
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

API endpoints are rate limited:
- **100 requests per minute** for authenticated users
- **20 requests per minute** for unauthenticated endpoints
- **10 requests per minute** for intensive operations (AI features, exports)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

---

## Pagination

List endpoints support pagination:

```http
GET /notes?page=1&limit=20&sort=updatedAt&order=desc
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

This API documentation covers all implemented features across all phases of the AI Notes backend development. Each endpoint includes proper authentication, validation, error handling, and follows RESTful conventions.