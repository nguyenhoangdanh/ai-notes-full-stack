# Attachments API

File upload and management with OCR-ready processing and Cloudflare R2 + local fallback.

## 📋 Overview

- Single-file upload per request with background processing
- R2 cloud storage with graceful local fallback
- OCR/text extraction pipeline placeholders
- Activity tracking on upload/delete

All endpoints require:
- Authorization: Bearer <jwt_token>
- Guard: JwtAuthGuard

## 🔐 Endpoints

### POST /attachments/:noteId/upload

Upload a single file to a note.

Headers:
- Authorization: Bearer <jwt_token>
- Content-Type: multipart/form-data

Form-data:
- file (File) required

Success (201):
```json
{
  "success": true,
  "attachment": {
    "id": "cm4attach123",
    "filename": "image.png",
    "fileType": "image/png",
    "fileSize": 102400,
    "fileUrl": "https://r2.dev/bucket/attachments/...",
    "uploadedAt": "2024-01-15T14:30:00.000Z",
    "category": "image"
  }
}
```

Error (201):
```json
{ "success": false, "message": "No file provided" }
```

Notes:
- Validates MIME type and size per category (see Supported Types below).
- Queues background processing after successful upload.

---

### GET /attachments/:noteId

List attachments for a note.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- noteId (string)

Success (200):
```json
{
  "success": true,
  "attachments": [
    {
      "id": "cm4attach123",
      "filename": "doc.pdf",
      "fileType": "application/pdf",
      "fileSize": 2048576,
      "fileUrl": "https://r2.dev/.../doc.pdf",
      "uploadedAt": "2024-01-15T14:30:00.000Z",
      "category": "document",
      "ocrText": "Extracted text...",
      "ocrConfidence": 0.85
    }
  ],
  "count": 1
}
```

Error (200):
```json
{ "success": false, "attachments": [], "error": "Note not found or not accessible" }
```

---

### GET /attachments/:attachmentId/download

Download an attachment.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- attachmentId (string)

Success (200):
- If stored on R2:
```json
{ "success": true, "downloadUrl": "https://r2.dev/.../file.ext", "filename": "file.ext" }
```
- If stored locally: streams binary with headers:
```
Content-Disposition: attachment; filename="file.ext"
Content-Type: <mime>
```

---

### DELETE /attachments/:attachmentId

Delete an attachment.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- attachmentId (string)

Success (200):
```json
{ "success": true, "message": "Attachment \"file.ext\" deleted successfully" }
```

Errors:
- 404 Not Found: Attachment not found or not accessible

---

### GET /attachments/search/:query?limit=10

Search attachments by filename and OCR text.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- query (string)

Query params:
- limit (number, optional, default: 10)

Success (200):
```json
{
  "success": true,
  "results": [
    {
      "id": "cm4attach123",
      "filename": "react_tutorial.pdf",
      "fileType": "application/pdf",
      "fileUrl": "https://r2.dev/.../react_tutorial.pdf",
      "note": { "id": "cm4note123", "title": "React Learning" },
      "ocrText": "React is a JavaScript...",
      "relevance": 0.95
    }
  ],
  "count": 1,
  "query": "react"
}
```

---

### GET /attachments/analytics/overview?days=30

Get attachment analytics overview.

Headers:
- Authorization: Bearer <jwt_token>

Query params:
- days (number, optional, default: 30)

Success (200):
```json
{
  "success": true,
  "analytics": {
    "totalAttachments": 12,
    "totalStorageUsed": 15728640,
    "averageFileSize": 1310720,
    "typeDistribution": [
      { "fileType": "image/png", "count": 5, "category": "image" }
    ],
    "recentUploads": [
      { "id": "cm4attach123", "filename": "doc.pdf", "note": { "id": "cm4note123", "title": "Docs" } }
    ],
    "totalRecentUploads": 1
  },
  "period": {
    "days": 30,
    "startDate": "2023-12-16T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z"
  }
}
```

---

### POST /attachments/:attachmentId/ocr

Request OCR processing for an attachment.

Headers:
- Authorization: Bearer <jwt_token>

Path params:
- attachmentId (string)

Success (202):
```json
{
  "success": true,
  "message": "OCR processing requested",
  "attachmentId": "cm4attach123"
}
```

---

### GET /attachments/types/supported

Supported file types and limits.

Success (200):
```json
{
  "success": true,
  "supportedTypes": {
    "image": {
      "mimeTypes": ["image/jpeg","image/jpg","image/png","image/webp","image/gif","image/svg+xml"],
      "maxSize": "10MB",
      "description": "Images with OCR text extraction support"
    },
    "document": {
      "mimeTypes": [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/markdown",
        "text/csv"
      ],
      "maxSize": "50MB",
      "description": "Documents with text extraction support"
    },
    "audio": {
      "mimeTypes": ["audio/mpeg","audio/wav","audio/mp4","audio/webm","audio/ogg"],
      "maxSize": "100MB",
      "description": "Audio files with transcription support"
    },
    "video": {
      "mimeTypes": ["video/mp4","video/webm","video/quicktime","video/avi"],
      "maxSize": "500MB",
      "description": "Video files with preview generation"
    },
    "archive": {
      "mimeTypes": ["application/zip","application/x-zip-compressed","application/x-rar-compressed","application/x-7z-compressed"],
      "maxSize": "100MB",
      "description": "Archive files"
    }
  },
  "totalTypes": 19
}
```

## Notes

- Upload uses field name "file". Multiple-file upload endpoints are not supported.
- Delete returns 200 JSON response, not 204.
- Download returns a JSON with URL for R2 files, or streams local files directly.
- Activities recorded: ATTACHMENT_UPLOAD and ATTACHMENT_DELETE.
