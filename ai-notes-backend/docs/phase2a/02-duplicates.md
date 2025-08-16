# Duplicates Detection API

Intelligent duplicate detection and merging system for notes.

## 📋 Overview

The duplicates system identifies similar or duplicate notes using multiple detection methods including content similarity, title matching, and semantic analysis. Provides automated detection with manual review and merging capabilities.

### Features
- ✅ Multi-method duplicate detection (content, title, semantic)
- ✅ Configurable similarity thresholds
- ✅ Smart merge strategies with content preservation
- ✅ Background processing with BullMQ
- ✅ Duplicate reports management with status tracking
- ✅ Statistics and insights dashboard

## 🔐 Endpoints

### GET /duplicates/detect

Detect duplicate notes using multiple similarity detection methods.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `noteId` (string, optional) - Check specific note for duplicates against all other notes
- `threshold` (number, optional, default: 0.7) - Similarity threshold (0.1-1.0)

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "duplicates": [
    {
      "originalNoteId": "cm4note123",
      "duplicateNoteId": "cm4note456",
      "similarity": 0.92,
      "type": "CONTENT",
      "suggestedAction": "MERGE"
    },
    {
      "originalNoteId": "cm4note123",
      "duplicateNoteId": "cm4note789",
      "similarity": 0.83,
      "type": "SEMANTIC", 
      "suggestedAction": "REVIEW"
    }
  ],
  "message": "Found 2 potential duplicate(s)"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "count": 0,
  "duplicates": [],
  "message": "Failed to detect duplicates",
  "error": "Detailed error message"
}
```

**Suggested Actions:**
- `MERGE`: Similarity >= 0.95 (very high confidence)
- `REVIEW`: Similarity >= 0.85 (high confidence, manual review)
- `KEEP_SEPARATE`: Similarity < 0.85 (low confidence)

---

### GET /duplicates/reports

Get duplicate reports with filtering and status management.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (string, optional) - Filter by: 'PENDING', 'CONFIRMED', 'DISMISSED', 'MERGED'

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "reports": [
    {
      "id": "cm4dup123",
      "originalNoteId": "cm4note123",
      "duplicateNoteId": "cm4note456",
      "similarity": 0.92,
      "type": "CONTENT",
      "status": "PENDING", 
      "ownerId": "cm4user123",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "resolvedAt": null,
      "originalNote": {
        "id": "cm4note123",
        "title": "React Hooks Guide",
        "content": "React hooks are functions..."
      },
      "duplicateNote": {
        "id": "cm4note456",
        "title": "React Hooks Tutorial",
        "content": "React hooks are functions..."
      }
    }
  ],
  "statusFilter": "PENDING"
}
```

---

### POST /duplicates/reports

Create a duplicate report manually.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "originalNoteId": "cm4note123",
  "duplicateNoteId": "cm4note456", 
  "similarity": 0.87,
  "type": "CONTENT"
}
```

**Validation Rules:**
- `originalNoteId`: Required string (@IsString)
- `duplicateNoteId`: Required string (@IsString)
- `similarity`: Required number 0-1 (@IsNumber @Min(0) @Max(1))
- `type`: Required enum 'CONTENT' | 'TITLE' | 'SEMANTIC' (@IsEnum)

**Success Response (201):**
```json
{
  "success": true,
  "report": {
    "id": "cm4dup789",
    "originalNoteId": "cm4note123",
    "duplicateNoteId": "cm4note456",
    "similarity": 0.87,
    "type": "CONTENT", 
    "status": "PENDING",
    "ownerId": "cm4user123",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "resolvedAt": null,
    "originalNote": {
      "id": "cm4note123",
      "title": "React Hooks Guide"
    },
    "duplicateNote": {
      "id": "cm4note456", 
      "title": "React Hooks Tutorial"
    }
  },
  "message": "Duplicate report created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "One or both notes not found or not owned by user"
}
```

---

### PATCH /duplicates/reports/:id

Update duplicate report status.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `id` (string) - Report ID

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Validation Rules:**
- `status`: Required enum 'CONFIRMED' | 'DISMISSED' | 'MERGED' (@IsEnum)

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "id": "cm4dup123",
    "originalNoteId": "cm4note123",
    "duplicateNoteId": "cm4note456",
    "similarity": 0.92,
    "type": "CONTENT",
    "status": "CONFIRMED",
    "ownerId": "cm4user123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "resolvedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Report status updated to CONFIRMED"
}
```

---

### POST /duplicates/merge

Merge duplicate notes with content preservation.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "originalNoteId": "cm4note123",
  "duplicateNoteId": "cm4note456"
}
```

**Validation Rules:**
- `originalNoteId`: Required string (@IsString)
- `duplicateNoteId`: Required string (@IsString)

**Success Response (200):**
```json
{
  "success": true,
  "mergedNote": {
    "id": "cm4note123",
    "title": "React Hooks Guide", 
    "content": "React hooks are functions that let you use state...\n\n---\n\nReact hooks are functions that allow you to use state...",
    "tags": ["react", "hooks", "tutorial"],
    "workspaceId": "cm4workspace123",
    "ownerId": "cm4user123",
    "isDeleted": false,
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  },
  "deletedNoteId": "cm4note456",
  "message": "Notes merged successfully"
}
```

**Merge Logic:**
- Original note content is preserved
- Duplicate note content is appended with separator (`\n\n---\n\n`)
- Tags are merged (union of both sets)
- Duplicate note is soft deleted (`isDeleted: true`)
- All related duplicate reports marked as 'MERGED'
- Vector embeddings reprocessed for merged note

**Error Response (404):**
```json
{
  "success": false,
  "message": "One or both notes not found",
  "error": "Note not found or not owned by user"
}
```

---

### POST /duplicates/queue-detection

Queue background duplicate detection job.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "noteId": "cm4note123"
}
```

**Success Response (202):**
```json
{
  "success": true,
  "message": "Duplicate detection job queued successfully",
  "noteId": "cm4note123"
}
```

---

### GET /duplicates/stats

Get duplicate detection statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalReports": 15,
    "pendingReports": 8,
    "mergedReports": 3,
    "resolvedReports": 7
  }
}
```

## 🔧 Detection Algorithms

### Multi-Method Similarity Detection

The system uses a sophisticated three-tier detection approach:

**1. Title Similarity (Fast)**
```typescript
const titleSimilarity = stringSimilarity.compareTwoStrings(
  note1.title.toLowerCase(),
  note2.title.toLowerCase()
);
```

**2. Content Similarity (Comprehensive)**
```typescript
// Weighted combination of multiple metrics
const contentSimilarity = (basicSimilarity * 0.6) + (jaccardSimilarity * 0.4);

// Basic string similarity
const basicSimilarity = stringSimilarity.compareTwoStrings(cleanContent1, cleanContent2);

// Jaccard similarity (token-based overlap)
const jaccardSimilarity = intersection.size / union.size;
```

**3. Semantic Similarity (AI-Powered)**
```typescript
// Cosine similarity between vector embeddings
const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
// Uses stored OpenAI embeddings when available
```

### Content Preprocessing
```typescript
private cleanContent(content: string): string {
  return content
    .replace(/[#*_`~]/g, '') // Remove markdown formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
}
```

### Performance Optimizations
- **Early Exit**: Skip semantic similarity for low content similarity (< 0.3)
- **Batch Limiting**: Process maximum 500 notes for individual checks, 200 for comparisons
- **Recent First**: Order by `updatedAt: 'desc'` for most relevant matches
- **Duplicate Avoidance**: Skip already compared pairs to prevent redundant work

## 🔄 Background Processing System

### BullMQ Queue Configuration
```typescript
// Queue: 'duplicate-detection'
defaultJobOptions: {
  removeOnComplete: 5,
  removeOnFail: 3,
  attempts: 2,
  backoff: { type: 'exponential', delay: 3000 }
}
```

### Job Types Handled by DuplicatesProcessor

**1. detect-duplicates**
- Individual note duplicate detection
- Auto-creates reports for high confidence matches (>= 0.85)
- Progress tracking with job updates

**2. batch-duplicate-check**
- Process multiple notes with rate limiting
- 500ms delay every 10 notes to prevent system overload
- Comprehensive results with success/failure tracking

**3. auto-merge-high-confidence**
- Automatically merges duplicates with >= 0.95 similarity
- Limited to 20 reports per run to prevent overwhelming
- Updates all related reports to 'MERGED' status

**4. cleanup-dismissed-reports**
- Removes dismissed reports older than specified days
- Helps maintain database performance

### Error Handling & Resilience
- **Graceful Degradation**: Individual comparison failures don't stop entire process
- **Progress Reporting**: Regular progress updates (every 25%)
- **Comprehensive Logging**: Success/failure tracking with detailed error messages
- **Retry Strategy**: Exponential backoff for transient failures

## 🧪 Testing Examples

**Detect duplicates for specific note:**
```bash
curl -X GET "http://localhost:3001/api/duplicates/detect?noteId=NOTE_ID&threshold=0.8" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create duplicate report:**
```bash
curl -X POST http://localhost:3001/api/duplicates/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalNoteId": "cm4note123",
    "duplicateNoteId": "cm4note456",
    "similarity": 0.87,
    "type": "CONTENT"
  }'
```

**Merge notes:**
```bash
curl -X POST http://localhost:3001/api/duplicates/merge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalNoteId": "cm4note123", 
    "duplicateNoteId": "cm4note456"
  }'
```

**Queue detection job:**
```bash
curl -X POST http://localhost:3001/api/duplicates/queue-detection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"noteId": "cm4note123"}'
```

---

**Next:** [Relations Discovery API](./03-relations.md)
