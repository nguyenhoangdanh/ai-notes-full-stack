# Categories Management API

Smart categorization system with AI-powered auto-categorization for notes.

## 📋 Overview

The categories system provides intelligent note organization with both manual and automatic categorization. Uses keyword matching and natural language processing to suggest and assign categories.

### Features
- ✅ Manual category creation and management
- ✅ AI-powered category suggestions
- ✅ Auto-categorization based on content analysis
- ✅ Keyword-based matching system
- ✅ Background processing with queue system
- ✅ Note-category relationship management

## 🔐 Endpoints

### GET /categories

Get all categories for the authenticated user with optional filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `includeAuto` (string, optional, default: 'true') - Include auto-generated categories

**Success Response (200):**
```json
[
  {
    "id": "cm4cat123",
    "name": "Technology",
    "description": "Tech-related notes",
    "color": "#3B82F6",
    "icon": "💻",
    "keywords": ["javascript", "react", "nodejs"],
    "ownerId": "cm4user123",
    "isAuto": false,
    "confidence": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "noteCategories": [
      {
        "note": {
          "id": "cm4note123",
          "title": "React Basics"
        }
      }
    ],
    "_count": {
      "noteCategories": 3
    }
  }
]
```

---

### POST /categories

Create a new category with validation and uniqueness checks.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Machine Learning",
  "description": "AI and ML related notes",
  "color": "#FF6B6B",
  "icon": "🧠",
  "keywords": ["ai", "ml", "neural", "algorithm"]
}
```

**Validation Rules:**
- `name`: Required string (@IsString)
- `description`: Optional string (@IsOptional @IsString)
- `color`: Optional string (@IsOptional @IsString)
- `icon`: Optional string (@IsOptional @IsString)
- `keywords`: Required array of strings (@IsArray @IsString({ each: true }))
- `isAuto`: Optional boolean (@IsOptional @IsBoolean)

**Success Response (201):**
```json
{
  "id": "cm4cat456",
  "name": "Machine Learning",
  "description": "AI and ML related notes",
  "color": "#FF6B6B", 
  "icon": "🧠",
  "keywords": ["ai", "ml", "neural", "algorithm"],
  "ownerId": "cm4user123",
  "isAuto": false,
  "confidence": null,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "noteCategories": [],
  "_count": {
    "noteCategories": 0
  }
}
```

**Error Response (409):**
```json
{
  "message": "Category with name 'Machine Learning' already exists for this user",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### GET /categories/:id

Get category details with associated notes.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string) - Category ID

**Success Response (200):**
```json
{
  "id": "cm4cat123",
  "name": "Technology",
  "description": "Tech-related notes",
  "color": "#3B82F6",
  "icon": "💻",
  "keywords": ["javascript", "react", "nodejs"],
  "ownerId": "cm4user123",
  "isAuto": false,
  "confidence": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "noteCategories": [
    {
      "note": {
        "id": "cm4note123",
        "title": "React Development Guide",
        "content": "# React Development\n\nComprehensive guide..."
      }
    }
  ]
}
```

**Error Response (404):**
```json
{
  "message": "Category not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### PATCH /categories/:id

Update category information using PartialType(CreateCategoryDto).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `id` (string) - Category ID

**Request Body:** (All fields optional)
```json
{
  "name": "Advanced Technology",
  "description": "Advanced tech concepts",
  "keywords": ["advanced", "javascript", "react", "nodejs", "typescript"]
}
```

**Success Response (200):**
```json
{
  "id": "cm4cat123",
  "name": "Advanced Technology",
  "description": "Advanced tech concepts",
  "color": "#3B82F6",
  "icon": "💻",
  "keywords": ["advanced", "javascript", "react", "nodejs", "typescript"],
  "ownerId": "cm4user123",
  "isAuto": false,
  "confidence": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z",
  "_count": {
    "noteCategories": 3
  }
}
```

---

### DELETE /categories/:id

Remove category and all note associations.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string) - Category ID

**Success Response (204):**
No content returned.

**Implementation Details:**
- First removes all `noteCategory` associations via `deleteMany()`
- Then deletes the category record
- Cascading delete handled at application level

---

### POST /categories/suggest

Generate AI-powered category suggestions based on note content.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "React is a JavaScript library for building user interfaces. It uses components and hooks for state management."
}
```

**Success Response (200):**
```json
[
  {
    "name": "Technology",
    "confidence": 0.85,
    "matchingKeywords": ["javascript", "react"],
    "exists": true,
    "existingCategoryId": "cm4cat123"
  },
  {
    "name": "Learning",
    "confidence": 0.72,
    "matchingKeywords": ["library", "components"],
    "exists": false
  }
]
```

**Suggestion Algorithm:**
- Checks user's existing categories first using keyword matching
- Falls back to built-in category suggestions if no matches
- Uses natural language processing (compromise.js) for topic extraction
- Combines existing and AI-generated suggestions, sorted by confidence

---

### POST /categories/auto-categorize/:noteId

Automatically categorize a note using AI analysis.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Parameters:**
- `noteId` (string) - Note ID to categorize

**Request Body:**
```json
{
  "threshold": 0.7
}
```

**Validation Rules:**
- `threshold`: Optional number, 0-1 range (@IsOptional @Type(() => Number) @IsNumber @Min(0) @Max(1))

**Success Response (200):**
```json
[
  {
    "name": "Technology",
    "confidence": 0.85,
    "matchingKeywords": ["javascript", "react"],
    "exists": true,
    "existingCategoryId": "cm4cat123",
    "assigned": true
  },
  {
    "name": "Learning", 
    "confidence": 0.65,
    "matchingKeywords": ["library"],
    "exists": false,
    "assigned": false,
    "reason": "Confidence below threshold"
  }
]
```

**Assignment Logic:**
- Categories with `confidence >= threshold` are assigned
- Creates new categories only if `confidence >= 0.8`
- Existing categories assigned via `noteCategory` relation
- Prevents duplicate assignments with unique constraint

---

### GET /categories/notes/:noteId

Get all categories assigned to a specific note.

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
    "noteId": "cm4note123",
    "categoryId": "cm4cat123",
    "confidence": null,
    "isAuto": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "category": {
      "id": "cm4cat123",
      "name": "Technology",
      "description": "Tech-related notes",
      "color": "#3B82F6",
      "icon": "💻",
      "keywords": ["javascript", "react"],
      "ownerId": "cm4user123",
      "isAuto": false,
      "confidence": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
]
```

---

### POST /categories/notes/:noteId/assign/:categoryId

Manually assign a category to a note.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `noteId` (string) - Note ID  
- `categoryId` (string) - Category ID

**Success Response (201):**
```json
{
  "noteId": "cm4note123",
  "categoryId": "cm4cat123", 
  "confidence": null,
  "isAuto": false,
  "createdAt": "2024-01-15T12:00:00.000Z",
  "category": {
    "id": "cm4cat123",
    "name": "Technology",
    "description": "Tech-related notes",
    "color": "#3B82F6",
    "icon": "💻",
    "keywords": ["javascript", "react"],
    "ownerId": "cm4user123",
    "isAuto": false,
    "confidence": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// 400 - Already Assigned (handled by application logic)
{
  "message": "Note is already assigned to this category",
  "statusCode": 400
}

// 404 - Note Not Found
{
  "message": "Note not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### DELETE /categories/notes/:noteId/assign/:categoryId

Remove category assignment from note.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `noteId` (string) - Note ID
- `categoryId` (string) - Category ID

**Success Response (204):**
No content returned.

**Implementation:**
- Uses Prisma `delete()` with compound key `noteId_categoryId`
- Automatic verification of note ownership via join condition

## 🔧 Smart Categorization Engine

### Natural Language Processing
The system uses multiple NLP libraries for content analysis:

**Text Preprocessing:**
```typescript
// Remove markdown, extract topics using compromise.js
const doc = compromise(content);
const nouns = doc.nouns().out('array');
const topics = doc.topics().out('array');
```

**Keyword Matching with natural.js:**
```typescript
// Tokenization and stemming
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const tokens = tokenizer.tokenize(content.toLowerCase());
const stemmedTokens = tokens.map(token => stemmer.stem(token));
```

### Confidence Calculation Algorithm
```typescript
// Multi-factor scoring system
let score = 0;
for (const keyword of keywords) {
  // Exact phrase match (weight: 2.0)
  if (contentLower.includes(keywordLower)) {
    score += 2.0;
  }
  // Stemmed word match (weight: 1.0)  
  else if (stemmedKeyword.some(stem => stemmedTokens.includes(stem))) {
    score += 1.0;
  }
  // Fuzzy match using Jaro-Winkler (weight: variable)
  else {
    const bestMatch = Math.max(...tokens.map(token => 
      natural.JaroWinklerDistance(token, keywordLower, { dj: 0.8 })
    ));
    if (bestMatch > 0.8) score += bestMatch;
  }
}

// Normalize and boost for multiple keyword matches
const confidence = Math.min(score / (keywords.length * 2.0), 1.0);
const keywordMatchRatio = keywordMatches / keywords.length;
return confidence * (0.7 + (keywordMatchRatio * 0.3));
```

### Built-in Category Suggestions
```typescript
const categoryTemplates = {
  technology: {
    keywords: ['code', 'programming', 'development', 'software', 'api'],
    confidence: 0.8
  },
  business: {
    keywords: ['meeting', 'project', 'business', 'client', 'deadline'],
    confidence: 0.8
  },
  learning: {
    keywords: ['learn', 'study', 'course', 'tutorial', 'book'],
    confidence: 0.8
  }
  // ... more templates
};
```

## 🔄 Background Processing System

### BullMQ Queue Integration
```typescript
// Queue jobs processed by CategoriesProcessor
export class CategoriesProcessor extends WorkerHost {
  async process(job: Job) {
    switch (job.name) {
      case 'auto-categorize-note':
        return this.handleAutoCategorizeNote(job);
      case 'batch-categorize':
        return this.handleBatchCategorize(job);
      case 'update-category-keywords':
        return this.handleUpdateCategoryKeywords(job);
    }
  }
}
```

**Queue Configuration:**
- Name: `'smart-categorization'`
- Delay: 2000ms for note processing completion
- Retry: 3 attempts with exponential backoff
- Job types: `'auto-categorize-note'`, `'batch-categorize'`, `'update-category-keywords'`

### Automatic Triggers
- **Note Creation**: `queueAutoCategorization()` called after note save
- **Note Update**: Re-categorization if significant content changes detected
- **Manual Trigger**: Direct API call to `/auto-categorize/:noteId`

## 🧪 Testing Examples

**Create category:**
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "description": "Frontend and backend development",
    "keywords": ["html", "css", "javascript", "react", "nodejs"],
    "color": "#10B981",
    "icon": "🌐"
  }'
```

**Get category suggestions:**
```bash
curl -X POST http://localhost:3001/api/categories/suggest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "React hooks useEffect and useState are fundamental concepts for managing component state and side effects in functional components."
  }'
```

**Auto-categorize note:**
```bash
curl -X POST http://localhost:3001/api/categories/auto-categorize/NOTE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"threshold": 0.7}'
```

**Assign category to note:**
```bash
curl -X POST http://localhost:3001/api/categories/notes/NOTE_ID/assign/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Next:** [Duplicates Detection API](./02-duplicates.md)
