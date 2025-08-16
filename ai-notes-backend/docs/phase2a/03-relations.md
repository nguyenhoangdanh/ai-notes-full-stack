# Relations Discovery API

Intelligent system for discovering and managing relationships between notes.

## 📋 Overview

The relations system identifies connections between notes using multiple analysis methods including semantic similarity, contextual relationships, temporal patterns, and direct references. Helps users discover related content and build knowledge graphs.

### Features
- ✅ Multi-type relation detection (semantic, contextual, temporal, reference)
- ✅ Graph visualization data generation
- ✅ Manual relation management
- ✅ Background analysis processing
- ✅ Relevance scoring and ranking
- ✅ Statistics and insights

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### GET /relations/notes/:noteId/related

Find notes related to a specific note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string) - Source note ID

Query params:
- limit (number, optional, 1-20, default: 5)

Success Response (200):
```json
{
  "success": true,
  "noteId": "note_id",
  "count": 2,
  "relatedNotes": [
    {
      "noteId": "related_note_id",
      "title": "Related note title",
      "relevance": 0.87,
      "type": "SEMANTIC",
      "excerpt": "First 200 chars of related content...",
      "reasons": [
        "Semantic similarity: 87.0%",
        "Content analysis using AI embeddings"
      ]
    }
  ],
  "message": "Found 2 related note(s)"
}
```

Error Response (200):
```json
{
  "success": false,
  "noteId": "note_id",
  "count": 0,
  "relatedNotes": [],
  "message": "Failed to find related notes",
  "error": "Error message"
}
```

Relation types:
- SEMANTIC | CONTEXTUAL | TEMPORAL | REFERENCE

---

### GET /relations/notes/:noteId/stored

Get previously stored relations for a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string) - Source note ID

Query params:
- limit (number, optional, 1-20, default: 10)

Success Response (200):
```json
{
  "success": true,
  "noteId": "note_id",
  "count": 1,
  "relations": [
    {
      "noteId": "related_note_id",
      "title": "Related note title",
      "relevance": 0.92,
      "type": "SEMANTIC",
      "excerpt": "First 200 chars of related content...",
      "reasons": [
        "Stored relation: semantic"
      ]
    }
  ],
  "message": "Found 1 stored relation(s)"
}
```

Error Response (200):
```json
{
  "success": false,
  "noteId": "note_id",
  "count": 0,
  "relations": [],
  "message": "Failed to retrieve stored relations",
  "error": "Error message"
}
```

---

### POST /relations/notes/:noteId/save-relation

Manually create a relation between two notes.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string) - Source note ID

Request body:
```json
{
  "targetNoteId": "string",
  "relevance": 0.9,
  "type": "REFERENCE"
}
```

Validation:
- targetNoteId: required string
- relevance: required number (0-1)
- type: required enum one of ["SEMANTIC","CONTEXTUAL","TEMPORAL","REFERENCE"]

Notes:
- Fails if source/target not found or not owned by the user
- Fails if source equals target

Success Response (201):
```json
{
  "success": true,
  "relation": {
    "id": "relation_id",
    "sourceNoteId": "note_id",
    "targetNoteId": "target_note_id",
    "relevance": 0.9,
    "type": "REFERENCE",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Relation saved successfully"
}
```

Error Response (201):
```json
{
  "success": false,
  "message": "Cannot create relation from note to itself"
}
```

---

### POST /relations/notes/:noteId/analyze

Queue background relation analysis for a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Request body:
- None

Success Response (202):
```json
{
  "success": true,
  "message": "Relation analysis job queued successfully",
  "noteId": "note_id"
}
```

Error Response (202):
```json
{
  "success": false,
  "message": "Failed to queue relation analysis",
  "error": "Error message"
}
```

---

### GET /relations/notes/:noteId/graph

Get relation graph data for visualization.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Query params:
- depth (number, optional, default: 2)

Success Response (200):
```json
{
  "success": true,
  "noteId": "note_id",
  "depth": 2,
  "nodes": [
    {
      "id": "note_id",
      "title": "Note title",
      "depth": 0,
      "createdAt": "2024-01-10T09:00:00.000Z"
    }
  ],
  "edges": [
    {
      "id": "noteA-noteB",
      "source": "noteA",
      "target": "noteB",
      "type": "SEMANTIC",
      "relevance": 0.87
    }
  ],
  "totalNodes": 1,
  "totalEdges": 1
}
```

Error Response (200):
```json
{
  "success": false,
  "message": "Failed to build relation graph",
  "error": "Error message"
}
```

---

### DELETE /relations/notes/:sourceNoteId/relations/:targetNoteId

Delete a relation between two notes (both directions considered).

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- sourceNoteId (string)
- targetNoteId (string)

Success Response (204):
- No content

---

### GET /relations/stats/:userId

Get relation statistics for the authenticated user.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- userId (string) - Required by route, but ignored in processing. Stats are computed for the current authenticated user.

Success Response (200):
```json
{
  "success": true,
  "stats": {
    "totalRelations": 12,
    "relationsByType": {
      "SEMANTIC": 5,
      "CONTEXTUAL": 4,
      "TEMPORAL": 2,
      "REFERENCE": 1
    },
    "topConnectedNotes": [
      {
        "noteId": "note_id",
        "connectionCount": 4
      }
    ]
  }
}
```

Error Response (200):
```json
{
  "success": false,
  "stats": {
    "totalRelations": 0,
    "relationsByType": {},
    "topConnectedNotes": []
  }
}
```
