# Tags Management API

Advanced tagging system with analytics, suggestions, and hierarchical organization.

## 📋 Overview

The tags system provides comprehensive tag management beyond simple string arrays. It includes tag analytics, smart suggestions, hierarchical relationships, and detailed usage tracking for better content organization.

### Features
- ✅ Structured tag management with metadata
- ✅ Tag analytics and usage statistics
- ✅ Smart tag suggestions based on content analysis
- ✅ Hierarchical tag relationships (parent-child)
- ✅ Tag cleanup and optimization tools
- ✅ Bulk tag operations
- ✅ Background processing for tag analysis

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### GET /tags

Get all tags for the authenticated user with usage counts.

Headers:
- Authorization: Bearer <jwt_token>

Success (200):
```json
{
  "success": true,
  "tags": [
    {
      "id": "cm4tag123",
      "name": "react",
      "color": "#3B82F6",
      "description": "React.js framework and ecosystem",
      "noteCount": 12,
      "createdAt": "2024-01-10T09:00:00.000Z"
    }
  ],
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "tags": [],
  "error": "Error message"
}
```

---

### POST /tags

Create a new tag.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Body:
```json
{
  "name": "machine-learning",
  "color": "#10B981",
  "description": "ML algorithms and techniques",
  "parentId": "optional-parent-tag-id"
}
```

Validation:
- name: required string
- color: optional string (hex)
- description: optional string
- parentId: optional string (must belong to user if provided)

Success (201):
```json
{
  "id": "cm4tag789",
  "name": "machine-learning",
  "color": "#10B981",
  "description": "ML algorithms and techniques",
  "ownerId": "cm4user123",
  "createdAt": "2024-01-15T17:00:00.000Z"
}
```

Error (201):
```json
{
  "success": false,
  "message": "Tag already exists"
}
```

---

### PUT /tags/:tagId

Update tag details.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- tagId (string)

Body:
```json
{
  "name": "react-framework",
  "color": "#61DAFB",
  "description": "React hooks and ecosystem"
}
```

Success (200):
```json
{
  "id": "cm4tag123",
  "name": "react-framework",
  "color": "#61DAFB",
  "description": "React hooks and ecosystem",
  "ownerId": "cm4user123",
  "createdAt": "2024-01-10T09:00:00.000Z"
}
```

Error (200):
```json
{
  "success": false,
  "message": "Tag name already exists"
}
```

---

### DELETE /tags/:tagId

Delete tag (with optional reassignment).

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- tagId (string)

Body (optional):
```json
{
  "reassignTo": "cm4tag999",
  "removeFromNotes": true
}
```

Success (200):
```json
{
  "success": true,
  "affectedNotes": 3,
  "message": "Tag \"react\" deleted successfully"
}
```

---

### GET /tags/hierarchy

Get tag hierarchy (flat for now).

Headers:
- Authorization: Bearer <jwt_token>

Success (200):
```json
{
  "success": true,
  "hierarchy": [
    {
      "id": "cm4tag123",
      "name": "react",
      "color": "#3B82F6",
      "description": "React.js framework and ecosystem",
      "noteCount": 12,
      "children": []
    }
  ]
}
```

---

### GET /tags/analytics

Get tag analytics.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- days (number, optional, default: 30)

Success (200):
```json
{
  "success": true,
  "analytics": {
    "totalTags": 45,
    "mostUsedTags": [
      { "name": "javascript", "count": 18, "color": "#F59E0B" }
    ],
    "recentlyUsed": [
      { "name": "machine-learning", "lastUsed": "2024-01-15T16:45:00.000Z" }
    ],
    "tagGrowth": [
      { "date": "2024-01-15", "count": 5 }
    ],
    "colorDistribution": [
      { "color": "#3B82F6", "count": 8 }
    ],
    "relationshipMap": [
      { "tag1": "react", "tag2": "javascript", "coOccurrences": 10 }
    ]
  },
  "period": {
    "days": 30,
    "startDate": "2023-12-16T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z"
  }
}
```

Error (200):
```json
{
  "success": false,
  "analytics": null,
  "error": "Error message"
}
```

---

### POST /tags/suggest/:noteId

Get tag suggestions for a note based on content.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)

Body:
```json
{
  "content": "Note content to analyze"
}
```

Success (200):
```json
{
  "success": true,
  "suggestions": [
    { "name": "tutorial", "confidence": 0.65, "reason": "content_based", "relatedTags": [] }
  ],
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "suggestions": [],
  "error": "Error message"
}
```

---

### POST /tags/bulk-operation

Perform bulk tag operations on notes.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Body:
```json
{
  "type": "assign",
  "noteIds": ["cm4note123", "cm4note456"],
  "tagIds": ["cm4tag123"],
  "replacementTagId": "cm4tag999"
}
```

Success (200):
```json
{
  "success": true,
  "processedCount": 2,
  "totalRequested": 2,
  "errors": []
}
```

Error (200):
```json
{
  "success": false,
  "processedCount": 1,
  "totalRequested": 2,
  "errors": ["Note cm4note456 not found or not owned by user"]
}
```

---

### GET /tags/suggestions/history

Get tag suggestion application history.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- limit (number, optional, default: 20)

Success (200):
```json
{
  "success": true,
  "history": [
    {
      "id": "cm4activity001",
      "suggestedTag": "react",
      "confidence": 0.8,
      "appliedAt": "2024-01-15T12:34:56.000Z",
      "noteId": "cm4note123"
    }
  ],
  "count": 1
}
```

---

### GET /tags/export

Export tags data.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- format (string, optional, default: "json") - "json" | "csv"

Success (200) JSON:
```json
{
  "success": true,
  "data": [
    { "id": "cm4tag123", "name": "react", "color": "#3B82F6", "description": "React.js framework", "noteCount": 12, "createdAt": "2024-01-10T09:00:00.000Z" }
  ],
  "format": "json",
  "count": 1
}
```

Success (200) CSV:
```json
{
  "success": true,
  "data": "Name,Color,Description,Note Count,Created At\nreact,#3B82F6,React.js framework,12,2024-01-10T09:00:00.000Z",
  "format": "csv",
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

---

### POST /tags/import

Import tags.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Body:
```json
{
  "tags": [
    { "name": "frontend", "color": "#8B5CF6", "description": "Frontend engineering" }
  ],
  "mergeStrategy": "merge"
}
```

Success (201):
```json
{
  "success": true,
  "imported": 1,
  "skipped": 0,
  "errors": [],
  "message": "Import completed: 1 imported, 0 skipped"
}
```

Error (201):
```json
{
  "success": false,
  "message": "Failed to import tags"
}
```
