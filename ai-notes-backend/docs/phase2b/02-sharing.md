# Sharing API

Public sharing system with access control, view analytics, and comprehensive link management.

## 📋 Overview

The sharing system enables users to share notes publicly or privately with comprehensive access control, view tracking, and detailed analytics. It supports password protection, expiration dates, and view limitations.

### Features
- ✅ Public and private share link generation
- ✅ Password protection and expiration dates
- ✅ View count tracking and analytics
- ✅ Access control with authentication requirements
- ✅ Share link management and revocation
- ✅ Background analytics processing

## 🔐 Endpoints

### POST /share/notes/:noteId/create

Create a new share link for a note.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `noteId` (string) - Note ID to create share link for

**Request Body:**
```json
{
  "isPublic": true,
  "expiresAt": "2024-12-31T23:59:59.999Z",
  "allowComments": false,
  "requireAuth": false,
  "maxViews": 100,
  "password": "sharePassword123"
}
```

**Validation Rules:**
- `isPublic`: Optional boolean (@IsOptional @IsBoolean)
- `expiresAt`: Optional ISO date string (@IsOptional @IsDateString)
- `allowComments`: Optional boolean (@IsOptional @IsBoolean)
- `requireAuth`: Optional boolean (@IsOptional @IsBoolean)
- `maxViews`: Optional number (@IsOptional @IsNumber @Min(1))
- `password`: Optional string (@IsOptional @IsString @MinLength(6))

**Success Response (201):**
```json
{
  "success": true,
  "shareLink": {
    "id": "cm4share123",
    "token": "abc123def456ghi789",
    "url": "https://frontend.example/share/abc123def456ghi789",
    "isPublic": true,
    "expiresAt": "2024-12-31T23:59:59.999Z",
    "settings": {
      "allowComments": false,
      "requireAuth": false,
      "maxViews": 100,
      "hasPassword": true
    }
  },
  "message": "Share link created successfully"
}
```

**Error Responses:**
```json
// 404 - Note not found or not owned by user
{
  "message": "Share link not found or not owned by user",
  "error": "Not Found",
  "statusCode": 404
}
```

Notes:
- If a share link already exists for the note, the existing link is updated and returned instead of returning a conflict.

---

### GET /share/notes/:noteId/links

Get all share links for a specific note.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `noteId` (string) - Note ID

**Success Response (200):**
```json
[
  {
    "id": "cm4share123",
    "noteId": "cm4note123",
    "token": "abc123def456ghi789",
    "isPublic": true,
    "expiresAt": "2024-12-31T23:59:59.999Z",
    "allowComments": false,
    "requireAuth": false,
    "maxViews": 100,
    "passwordHash": "hashed_password_string",
    "settings": {},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "shareViews": [
      {
        "id": "cm4view123",
        "shareLinkId": "cm4share123",
        "viewerIp": "192.168.1.1",
        "viewerAgent": "Mozilla/5.0...",
        "referrer": "https://google.com",
        "viewerId": null,
        "isUnique": true,
        "metadata": {},
        "viewedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "_count": {
      "shareViews": 25
    }
  }
]
```

**Error Response (404):**
```json
{
  "message": "Note not found",
  "error": "Not Found", 
  "statusCode": 404
}
```

---

### GET /share/:token

Access a shared note via token (public endpoint).

**Parameters:**
- `token` (string) - Share link token

**Query Parameters:**
- `password` (string, optional) - Password for protected links

**Success Response (200):**
```json
{
  "note": {
    "id": "cm4note123",
    "title": "React Development Guide",
    "content": "# React Development Guide\n\nThis is a comprehensive guide...",
    "tags": ["react", "javascript", "development"],
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "shareInfo": {
    "id": "cm4share123",
    "allowComments": false,
    "settings": {}
  },
  "author": {
    "id": "cm4user123",
    "name": "John Doe",
    "image": "https://avatar.com/john.jpg"
  }
}
```

**Error Responses:**
```json
// 404 - Invalid or expired token
{
  "message": "Share link not found or expired",
  "error": "Not Found",
  "statusCode": 404
}

// 401 - Password required  
{
  "message": "Password required",
  "error": "Unauthorized",
  "statusCode": 401
}

// 401 - Authentication required
{
  "message": "Authentication required",
  "error": "Unauthorized", 
  "statusCode": 401
}

// 429 - Max views reached
{
  "message": "Share link has reached maximum view limit",
  "error": "Too Many Requests",
  "statusCode": 429
}
```

---

### PATCH /share/:shareId

Update an existing share link.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `shareId` (string) - Share link ID

**Request Body:**
```json
{
  "isPublic": false,
  "expiresAt": "2024-06-30T23:59:59.999Z", 
  "allowComments": true,
  "maxViews": 50
}
```

**Validation Rules:**
- Same validation as create endpoint
- All fields are optional for updates

**Success Response (200):**
```json
{
  "success": true,
  "shareLink": {
    "id": "cm4share123",
    "token": "abc123def456ghi789",
    "url": "https://frontend.example/share/abc123def456ghi789",
    "isPublic": false,
    "expiresAt": "2024-06-30T23:59:59.999Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Share link updated successfully"
}
```

**Error Response (404):**
```json
{
  "message": "Share link not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### DELETE /share/:shareId

Delete/revoke a share link.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `shareId` (string) - Share link ID

**Success Response (204):**
No content returned.

**Error Response (404):**
```json
{
  "message": "Share link not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### GET /share/:shareId/analytics

Get analytics for a share link.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `shareId` (string) - Share link ID

**Success Response (200):**
```json
{
  "shareLink": {
    "id": "cm4share123",
    "token": "abc123def456ghi789",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "analytics": {
    "totalViews": 156,
    "uniqueViews": 89,
    "recentViews": 12,
    "viewsByDay": [
      {
        "date": "2024-01-15",
        "views": 34,
        "uniqueViews": 28
      },
      {
        "date": "2024-01-16", 
        "views": 28,
        "uniqueViews": 22
      }
    ],
    "topReferrers": [
      {
        "referrer": "https://google.com",
        "count": 45
      },
      {
        "referrer": "https://twitter.com",
        "count": 32
      }
    ],
    "geographicData": [
      {
        "country": "US",
        "count": 67
      },
      {
        "country": "GB",
        "count": 23
      }
    ]
  }
}
```

---

### GET /share/user/stats

Get sharing statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalShares": 45,
    "activeShares": 32,
    "inactiveShares": 13,
    "totalViews": 2456,
    "recentViews": 456
  }
}
```
