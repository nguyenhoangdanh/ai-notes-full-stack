# Versions API

Version control system for notes with automatic and manual versioning capabilities.

## 📋 Overview

The versions system provides comprehensive version control for notes, tracking changes over time and allowing users to restore previous versions. It includes automatic versioning based on change detection and manual version creation.

### Features
- ✅ Automatic version creation for significant changes
- ✅ Manual version creation with custom change logs
- ✅ Version comparison and difference analysis
- ✅ Version restoration capabilities
- ✅ Background processing for version management
- ✅ Change detection algorithms

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### GET /versions/notes/:noteId/history

Get version history for a note.

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
  "versions": [
    {
      "id": "cm4version123",
      "version": 3,
      "title": "React Hooks Guide - Updated",
      "changeLog": "Added useEffect examples and performance tips",
      "createdAt": "2024-01-15T14:30:00.000Z",
      "createdBy": { "id": "cm4user123", "name": "John Doe", "email": "john@example.com", "image": null },
      "wordCount": 1250,
      "characterCount": 6800
    }
  ],
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "versions": [],
  "error": "Error message"
}
```

---

### GET /versions/:versionId

Get a specific version.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- versionId (string)

Success (200):
```json
{
  "success": true,
  "version": {
    "id": "cm4version123",
    "version": 3,
    "title": "React Hooks Guide - Updated",
    "content": "# React Hooks Guide...",
    "changeLog": "Added useEffect examples and performance tips",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "createdBy": { "id": "cm4user123", "name": "John Doe", "email": "john@example.com", "image": null },
    "note": { "id": "cm4note123", "currentTitle": "Current Note Title" },
    "statistics": { "wordCount": 1250, "characterCount": 6800, "lineCount": 200 }
  }
}
```

Not found (200 with success=false):
```json
{
  "success": false,
  "version": null,
  "error": "Version not found or not accessible"
}
```

---

### POST /versions/notes/:noteId/create

Create a version (manual or automatic).

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)

Body (optional):
```json
{
  "changeLog": "Manual backup before major revision",
  "changeType": "minor",
  "isAutomatic": false
}
```

Success (201):
```json
{
  "created": true,
  "version": {
    "id": "cm4version456",
    "version": 5,
    "title": "React Hooks Guide - Current",
    "changeLog": "Manual backup before major revision",
    "createdAt": "2024-01-15T16:00:00.000Z",
    "createdBy": { "id": "cm4user123", "name": "John Doe", "email": "john@example.com", "image": null }
  },
  "message": "Version 5 created successfully"
}
```

No significant changes (201):
```json
{
  "created": false,
  "message": "No significant changes detected",
  "existingVersion": 4
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "message": "Failed to create version"
}
```

---

### GET /versions/notes/:noteId/compare?from=2&to=3

Compare two versions of a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Query params:
- from (number, required)
- to (number, required)

Success (200):
```json
{
  "success": true,
  "comparison": {
    "oldVersion": { "version": 2, "title": "React Hooks Guide", "content": "...", "createdAt": "2024-01-14T10:15:00.000Z" },
    "newVersion": { "version": 3, "title": "React Hooks Guide - Updated", "content": "...", "createdAt": "2024-01-15T14:30:00.000Z" },
    "differences": {
      "titleChanged": true,
      "contentDiffs": [
        { "type": "added", "lineNumber": 15, "newText": "## useEffect Hook...", "context": "..." }
      ],
      "statistics": { "linesAdded": 25, "linesRemoved": 8, "linesModified": 12, "wordsAdded": 180, "wordsRemoved": 45 }
    }
  }
}
```

Validation error (200):
```json
{
  "success": false,
  "message": "Invalid version numbers"
}
```

---

### POST /versions/:versionId/restore

Restore a note to a specific version.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- versionId (string)

Success (200):
```json
{
  "success": true,
  "restoredNote": {
    "id": "cm4note123",
    "title": "React Hooks Guide",
    "content": "# React Hooks Guide...",
    "workspace": { "id": "ws1", "name": "Default" }
  },
  "restoredFrom": { "version": 2, "createdAt": "2024-01-14T10:15:00.000Z" },
  "message": "Successfully restored note to version 2"
}
```

Error (200):
```json
{
  "success": false,
  "message": "Failed to restore version"
}
```

---

### DELETE /versions/:versionId

Delete a version.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- versionId (string)

Success (204):
- No content

Errors:
- 404 Not Found: Version not found or not accessible
- 403 Forbidden: Cannot delete the only version of a note; cannot delete versions less than 24 hours old

---

### GET /versions/notes/:noteId/statistics

Get version statistics for a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "statistics": {
    "totalVersions": 8,
    "versionsPerDay": 0.5,
    "firstVersion": { "version": 1, "createdAt": "2024-01-10T09:00:00.000Z" },
    "latestVersion": { "version": 8, "createdAt": "2024-01-15T16:30:00.000Z", "changeLog": "Auto-generated: ..." },
    "contributorStats": [{ "userId": "cm4user123", "versionCount": 8 }]
  }
}
```

Error (200):
```json
{
  "success": false,
  "statistics": null,
  "error": "Error message"
}
```

---

### GET /versions/recent

Get recent versions across all user notes.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- limit (number, optional, default: 20)

Success (200):
```json
{
  "success": true,
  "versions": [
    {
      "id": "cm4version789",
      "version": 9,
      "noteId": "cm4note123",
      "noteTitle": "React Hooks Guide",
      "versionTitle": "React Hooks Guide - Latest",
      "changeLog": "Minor edits",
      "createdAt": "2024-01-15T17:00:00.000Z",
      "createdBy": { "id": "cm4user123", "name": "John Doe", "image": null }
    }
  ],
  "count": 1
}
```

Error (200):
```json
{
  "success": false,
  "versions": [],
  "error": "Error message"
}
```

---

### POST /versions/notes/:noteId/auto-version

Trigger automatic versioning check.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success (202):
```json
{
  "success": true,
  "message": "Auto-versioning check triggered"
}
```

Error (202):
```json
{
  "success": false,
  "message": "Failed to trigger auto-versioning"
}
```

---

### GET /versions/notes/:noteId/timeline

Get version timeline with summary.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "timeline": [
    {
      "id": "cm4version123",
      "version": 3,
      "title": "React Hooks Guide - Updated",
      "changeLog": "Added useEffect examples and performance tips",
      "createdAt": "2024-01-15T14:30:00.000Z",
      "createdBy": { "id": "cm4user123", "name": "John Doe", "email": "john@example.com", "image": null },
      "wordCount": 1250,
      "characterCount": 6800,
      "isLatest": true,
      "timeFromPrevious": null,
      "position": 0,
      "type": "minor"
    }
  ],
  "summary": {
    "totalVersions": 1,
    "oldestVersion": "2024-01-15T14:30:00.000Z",
    "newestVersion": "2024-01-15T14:30:00.000Z",
    "averageTimeBetweenVersions": null
  }
}
```

Error (200):
```json
{
  "success": false,
  "timeline": [],
  "error": "Error message"
}
```

<!-- Removed non-API sections (testing, background jobs, issues, advanced features) to reflect controller/service behavior only. -->
