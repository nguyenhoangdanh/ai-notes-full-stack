# Collaboration API

Real-time collaborative editing system with user permissions, invitations, and live presence tracking.

## 📋 Overview

The collaboration system enables multiple users to work on notes simultaneously with real-time synchronization, permission management, and conflict resolution. It provides comprehensive collaboration features with proper access control and activity tracking.

### Features
- ✅ User permissions (READ/WRITE/ADMIN) with granular access control
- ✅ Invitation system via email with role assignment
- ✅ Collaboration management and member oversight
- ✅ Activity tracking and collaboration analytics
- ✅ Background notification processing
- ✅ Permission inheritance and cascading

## 🔐 Endpoints

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

### POST /collaboration/notes/:noteId/invite

Invite a user to collaborate on a note.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)

Request body:
```json
{
  "email": "collaborator@example.com",
  "permission": "write"
}
```

Validation:
- email: required email
- permission: required enum one of ["read","write","admin"]

Success Response (201):
```json
{
  "success": true,
  "collaboration": {
    "id": "cm4collab123",
    "user": {
      "id": "cm4user456",
      "name": "Jane Smith",
      "email": "collaborator@example.com",
      "image": "https://avatar.com/jane.jpg"
    },
    "permission": "write",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Collaborator invited successfully"
}
```

Alternate Success (pending invitee) (201):
```json
{
  "success": true,
  "message": "Invitation will be sent when user registers",
  "pendingInvitation": {
    "email": "collaborator@example.com",
    "permission": "WRITE",
    "noteTitle": "React Development Guide"
  }
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "message": "Only admins can invite collaborators"
}
```

---

### GET /collaboration/notes/:noteId/collaborators

Get all collaborators for a specific note (includes owner).

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success Response (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "collaborators": [
    {
      "id": "cm4userOwner",
      "user": {
        "id": "cm4userOwner",
        "name": "Owner Name",
        "email": "owner@example.com",
        "image": null
      },
      "permission": "ADMIN",
      "lastActive": "2024-01-15T10:30:00.000Z",
      "isOnline": false
    },
    {
      "id": "cm4user456",
      "user": {
        "id": "cm4user456",
        "name": "Jane Smith",
        "email": "collaborator@example.com",
        "image": "https://avatar.com/jane.jpg"
      },
      "permission": "write",
      "lastActive": "2024-01-15T10:30:00.000Z",
      "isOnline": true,
      "cursor": {
        "line": 12,
        "column": 4
      }
    }
  ],
  "count": 2
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "collaborators": [],
  "error": "You do not have access to this note"
}
```

---

### DELETE /collaboration/notes/:noteId/collaborators/:userId

Remove a collaborator from a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)
- userId (string) - collaborator user ID

Success Response (204):
- No content

Error:
- Throws standard HTTP errors (403, 404) from service

---

### PATCH /collaboration/notes/:noteId/collaborators/:userId/permission

Update a collaborator's permission.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)
- userId (string)

Request body:
```json
{
  "permission": "admin"
}
```

Validation:
- permission: required enum one of ["read","write","admin"]

Success Response (200):
```json
{
  "success": true,
  "message": "Permission updated successfully"
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "message": "Only admins can update permissions"
}
```

---

### GET /collaboration/notes/:noteId/permission

Get the current user's permission for a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success Response (200):
```json
{
  "success": true,
  "noteId": "cm4note123",
  "permission": "write",
  "hasAccess": true
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "permission": null,
  "hasAccess": false,
  "error": "You do not have access to this note"
}
```

---

### GET /collaboration/my-collaborations

Get notes the current user is collaborating on.

Headers:
- Authorization: Bearer <jwt_token>

Success Response (200):
```json
{
  "success": true,
  "collaborations": [
    {
      "id": "cm4collab123",
      "note": {
        "id": "cm4note123",
        "title": "React Development Guide",
        "updatedAt": "2024-01-15T11:30:00.000Z",
        "owner": {
          "id": "cm4user789",
          "name": "John Doe",
          "email": "john@example.com",
          "image": "https://avatar.com/john.jpg"
        }
      },
      "permission": "write",
      "joinedAt": "2024-01-15T10:30:00.000Z",
      "isOwner": false
    }
  ],
  "count": 1
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "collaborations": [],
  "error": "Error message"
}
```

---

### GET /collaboration/stats

Get collaboration statistics for the authenticated user.

Headers:
- Authorization: Bearer <jwt_token>

Success Response (200):
```json
{
  "success": true,
  "stats": {
    "ownedNotes": 12,
    "collaboratedNotes": 5,
    "totalCollaborators": 9
  }
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "stats": {
    "ownedNotes": 0,
    "collaboratedNotes": 0,
    "totalCollaborators": 0
  }
}
```

---

### POST /collaboration/notes/:noteId/join

Join a collaboration session (presence).

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Path params:
- noteId (string)

Request body:
```json
{
  "socketId": "socket-123"
}
```

Success Response (200):
```json
{
  "success": true,
  "collaborators": [
    {
      "id": "cm4userOwner",
      "user": { "id": "cm4userOwner", "name": "Owner", "email": "owner@example.com", "image": null },
      "permission": "ADMIN",
      "lastActive": "2024-01-15T10:30:00.000Z",
      "isOnline": true
    }
  ]
}
```

Error (200 with success=false):
```json
{
  "success": false,
  "message": "You do not have access to this note"
}
```

---

### POST /collaboration/leave

Leave collaboration session.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Request body:
```json
{
  "socketId": "socket-123"
}
```

Success Response (204):
- No content

---

### POST /collaboration/cursor-update

Update user cursor position in collaboration session.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: application/json

Request body:
```json
{
  "socketId": "socket-123",
  "cursor": {
    "line": 10,
    "column": 5,
    "selection": { "start": 100, "end": 120 }
  }
}
```

Success Response (204):
- No content
