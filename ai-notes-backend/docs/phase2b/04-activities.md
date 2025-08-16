# Activities API

Audit logging and analytics for user and note activities.

## 📋 Overview

Tracks user actions (create, update, delete, view, search) across notes and provides analytics and insights.

### Features
- ✅ Activity feed (user and per-note)
- ✅ Action tracking with metadata
- ✅ Usage statistics and trends
- ✅ Background analytics processing

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### GET /activities/user

Get the authenticated user's recent activities.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- limit (number, optional, default: 20)

Success (200):
```json
{
  "success": true,
  "activities": [
    {
      "id": "cm4activity123",
      "userId": "cm4user123",
      "action": "UPDATE",
      "noteId": "cm4note123",
      "metadata": { "field": "title" },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "note": { "id": "cm4note123", "title": "React Guide" }
    }
  ],
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "activities": [],
  "error": "Error message"
}
```

---

### GET /activities/notes/:noteId

Get activity history for a specific note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Query params:
- limit (number, optional, default: 50)

Success (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "activities": [
    {
      "id": "cm4activity234",
      "userId": "cm4user456",
      "action": "VIEW",
      "noteId": "cm4note123",
      "metadata": { "source": "web" },
      "createdAt": "2024-01-15T11:00:00.000Z",
      "user": { "id": "cm4user456", "name": "Jane Smith", "email": "jane@example.com", "image": null }
    }
  ],
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "noteId": "cm4note123",
  "activities": [],
  "error": "Error message"
}
```

---

### POST /activities/track

Track a user activity event.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Body:
```json
{
  "action": "UPDATE",
  "noteId": "cm4note123",
  "metadata": { "section": "Introduction", "changes": 3 }
}
```

Validation:
- action: required enum ["CREATE","UPDATE","DELETE","VIEW","SEARCH"]
- noteId: optional string
- metadata: optional object

Success (201):
```json
{
  "success": true,
  "activity": {
    "id": "cm4activity345",
    "userId": "cm4user123",
    "action": "UPDATE",
    "noteId": "cm4note123",
    "metadata": { "section": "Introduction", "changes": 3 },
    "createdAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Activity tracked"
}
```

Error (201):
```json
{
  "success": false,
  "message": "Failed to track activity",
  "error": "Error message"
}
```

---

### GET /activities/stats

Get activity statistics for the authenticated user.

Headers:
- Authorization: Bearer <jwt_token>

Success (200):
```json
{
  "success": true,
  "stats": {
    "totalActivities": 256,
    "recentActivities": { "last7Days": 42, "last30Days": 128 },
    "byAction": { "CREATE": 12, "UPDATE": 98, "DELETE": 6, "VIEW": 120, "SEARCH": 20 },
    "mostActiveNotes": [
      { "noteId": "cm4note123", "title": "React Guide", "activityCount": 18 }
    ]
  }
}
```

Error (200):
```json
{
  "success": false,
  "stats": null,
  "error": "Error message"
}
```

---

### GET /activities/trending

Get trending notes and actions based on recent activity.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- window (string, optional, default: "7d") - One of "24h", "7d", "30d"
- limit (number, optional, default: 5)

Success (200):
```json
{
  "success": true,
  "trending": {
    "notes": [
      { "noteId": "cm4note123", "title": "React Guide", "score": 0.92, "actions": { "VIEW": 22, "UPDATE": 6 } }
    ],
    "actions": [
      { "action": "VIEW", "count": 120 },
      { "action": "SEARCH", "count": 34 }
    ]
  }
}
```

Error (200):
```json
{
  "success": false,
  "trending": null,
  "error": "Error message"
}
```

---

### POST /activities/queue-analytics

Queue background analytics processing.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Body (optional):
```json
{
  "windowDays": 30,
  "priority": 0
}
```

Success (202):
```json
{
  "success": true,
  "jobId": "activity_job_123",
  "message": "Activity analytics job queued"
}
```

Error (202):
```json
{
  "success": false,
  "message": "Failed to queue analytics",
  "error": "Error message"
}
```

## 🧾 Action Types

- CREATE, UPDATE, DELETE, VIEW, SEARCH
