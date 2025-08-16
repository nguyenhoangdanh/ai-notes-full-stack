# Auto-Summaries API

AI-powered automatic summarization system for notes with multiple templates and models.

## 📋 Overview

The auto-summaries system generates intelligent summaries of notes using various AI models and summarization templates. Provides different summary styles for different contexts and maintains processing history.

### Features
- ✅ Multiple AI model support (Gemini, Groq, OpenAI)  
- ✅ Template-based summaries for different contexts
- ✅ Automatic and manual summary generation
- ✅ Background processing for bulk operations
- ✅ Statistics and usage tracking

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### GET /summaries/notes/:noteId

Get existing summary for a specific note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success Response (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "summary": {
    "id": "cm4sum123",
    "noteId": "cm4note123",
    "summary": "Summary text...",
    "keyPoints": ["Point 1", "Point 2"],
    "wordCount": 127,
    "model": "gemini-1.5-flash",
    "ownerId": "cm4user123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "note": {
      "title": "Note title",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    "readingTime": 1,
    "isStale": false
  },
  "message": "Summary retrieved successfully"
}
```

Not Found (200 with success=false):
```json
{
  "success": false,
  "message": "No summary found for this note",
  "noteId": "cm4note123",
  "summary": null
}
```

---

### POST /summaries/notes/:noteId/generate

Generate AI summary for a note.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)

Request body:
```json
{
  "minWords": 100,
  "maxSummaryLength": 300,
  "includeKeyPoints": true,
  "model": "gemini-1.5-flash"
}
```

Validation:
- minWords: optional number, 50-500 (default 100)
- maxSummaryLength: optional number, 100-1000 (default 300)
- includeKeyPoints: optional boolean (default true)
- model: optional string

Success Response (201):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "summary": {
    "summary": "Summary text...",
    "keyPoints": ["Point 1", "Point 2"],
    "wordCount": 450,
    "readingTime": 3,
    "model": "gemini-1.5-flash"
  },
  "message": "Summary generated successfully"
}
```

Error (201 with success=false):
```json
{
  "success": false,
  "noteId": "cm4note123",
  "message": "Failed to generate summary",
  "error": "Reason message"
}
```

---

### DELETE /summaries/notes/:noteId

Delete summary for a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success Response (204):
- No content

Error Response (404):
```json
{
  "statusCode": 404,
  "message": "Summary not found",
  "error": "Not Found"
}
```

---

### POST /summaries/batch

Generate summaries for multiple notes.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Request body:
```json
{
  "noteIds": ["note1", "note2"],
  "minWords": 100,
  "skipExisting": false
}
```

Validation:
- noteIds: required array of strings; controller enforces 1..50 items
- minWords: optional number, >=50 (default 100)
- skipExisting: optional boolean (default false)

Success Response (immediate, 201):
```json
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "noteId": "note1",
      "success": true,
      "summary": { "wordCount": 380, "model": "gemini-1.5-flash" }
    }
  ],
  "message": "Batch processing completed. 2/2 summaries generated."
}
```

Queued Response (201):
```json
{
  "success": true,
  "jobId": "batch_job_id",
  "total": 25,
  "invalidNotes": [],
  "message": "Batch summary generation queued successfully"
}
```

Validation Errors (201 with success=false):
```json
{
  "success": false,
  "message": "Maximum 50 notes allowed per batch request"
}
```

---

### POST /summaries/notes/:noteId/queue

Queue summary generation for background processing.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)

Request body (optional):
- Same as Generate request body (all fields optional)

Success Response (202):
```json
{
  "success": true,
  "jobId": "sum_job_id",
  "noteId": "cm4note123",
  "userId": "cm4user123",
  "message": "Summary generation queued successfully"
}
```

Error (202 with success=false):
```json
{
  "success": false,
  "message": "Failed to queue summary generation",
  "error": "Reason message"
}
```

---

### GET /summaries/user/stats

Get summary statistics for the authenticated user.

Headers:
- Authorization: Bearer <jwt_token>

Success Response (200):
```json
{
  "success": true,
  "stats": {
    "totalSummaries": 89,
    "recentSummaries": 12,
    "averageWordCount": 145,
    "summariesByModel": {
      "gemini-1.5-flash": 67,
      "gpt-3.5-turbo": 15,
      "llama3-8b-8192": 7
    }
  }
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "stats": {
    "totalSummaries": 0,
    "recentSummaries": 0,
    "averageWordCount": 0,
    "summariesByModel": {}
  }
}
```

---

### GET /summaries/templates

Get available summary templates.

Headers:
- Authorization: Bearer <jwt_token>

Success Response (200):
```json
{
  "success": true,
  "templates": [
    { "id": "executive", "name": "Executive Summary", "description": "...", "prompt": "..." }
  ]
}
```

---

### POST /summaries/notes/:noteId/template/:templateId

Generate summary using a specific template.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)
- templateId (string) one of: executive, academic, meeting, research, project

Success Response (201):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "templateId": "executive",
  "summary": {
    "summary": "Summary text...",
    "keyPoints": ["Point 1", "Point 2"],
    "wordCount": 420,
    "readingTime": 3,
    "model": "gemini-1.5-flash"
  },
  "message": "Template-based summary generated successfully"
}
```

Invalid Template (201 with success=false):
```json
{
  "success": false,
  "message": "Invalid template ID"
}
```

---

### GET /summaries/notes/:noteId/versions

Get summary version history.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Query params:
- limit (number, optional, default: 10)

Success Response (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "versions": [
    {
      "id": "cm4sum123",
      "version": 1,
      "summary": "Summary text...",
      "keyPoints": ["Point 1", "Point 2"],
      "wordCount": 127,
      "model": "gemini-1.5-flash",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isCurrent": true
    }
  ],
  "count": 1
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "versions": [],
  "count": 0,
  "error": "Reason message"
}
```
