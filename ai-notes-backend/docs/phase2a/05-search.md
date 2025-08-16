# Enhanced Search API

Advanced search system with filtering, analytics, and intelligent ranking.

## 📋 Overview

The enhanced search system provides powerful search capabilities with advanced filtering, search history, analytics, and intelligent ranking algorithms to help users find their content efficiently.

### Features
- ✅ Advanced search with multiple filters
- ✅ Search history and analytics
- ✅ Popular queries tracking
- ✅ Saved searches functionality
- ✅ Search suggestions and autocomplete
- ✅ Intelligent ranking algorithms

## 🔐 Endpoints

### POST /search/advanced

Perform advanced search with comprehensive filtering options.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "machine learning algorithms",
  "workspaceId": "cm4workspace123",
  "tags": ["ai", "ml"],
  "dateRange": { "from": "2024-01-01", "to": "2024-01-31" },
  "hasAttachments": true,
  "wordCountRange": { "min": 100, "max": 2000 },
  "categories": ["Technology", "Research"],
  "lastModifiedDays": 30,
  "sortBy": "relevance",
  "sortOrder": "desc",
  "limit": 20
}
```

**Validation Rules (AdvancedSearchDto):**
- query: required string
- workspaceId: optional string
- tags: optional array of strings
- dateRange: optional object { from: ISO string, to: ISO string }
- hasAttachments: optional boolean
- wordCountRange: optional object { min: number, max: number }
- categories: optional array of strings
- lastModifiedDays: optional number
- sortBy: optional enum ['relevance','created','updated','title','size']
- sortOrder: optional enum ['asc','desc']
- limit: optional number (default 20)

**Success Response (200):**
```json
{
  "success": true,
  "query": "machine learning algorithms",
  "results": [
    {
      "id": "cm4note123",
      "title": "Machine Learning Fundamentals",
      "content": "Machine learning is a subset of artificial intelligence...",
      "excerpt": "Machine learning algorithms can be categorized into supervised, unsupervised, and reinforcement learning approaches...",
      "score": 95.7,
      "highlights": ["**Machine learning** algorithms"],
      "reasons": ["Exact match in title", "Recently updated"],
      "workspace": { "id": "cm4workspace123", "name": "AI Research" },
      "tags": ["ai", "ml", "algorithms"],
      "categories": [{ "name": "Technology", "color": "#3B82F6" }],
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-15T14:20:00.000Z",
      "wordCount": 1250,
      "hasAttachments": true
    }
  ],
  "total": 15,
  "facets": {
    "workspaces": [{ "id": "cm4workspace123", "name": "AI Research", "count": 12 }],
    "tags": [{ "name": "ai", "count": 8 }],
    "categories": [{ "name": "Technology", "color": "#3B82F6", "count": 10 }],
    "dateRanges": { "last7Days": 3, "last30Days": 8, "last90Days": 2, "older": 2 },
    "total": 15
  }
}
```

**Error Response (200):**
```json
{
  "success": false,
  "message": "Failed to perform advanced search",
  "error": "Error message"
}
```

---

### GET /search/history

Get user's search history.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- limit (number, optional, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "history": [
    {
      "id": "cm4search123",
      "userId": "cm4user123",
      "query": "react hooks tutorial",
      "filters": { "tags": ["react"], "workspaceId": "cm4workspace123" },
      "resultCount": 0,
      "searchedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Response (200):**
```json
{
  "success": false,
  "history": [],
  "error": "Error message"
}
```

---

### GET /search/popular

Get popular search queries for the user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- limit (number, optional, default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "searches": [
    { "query": "react hooks", "count": 12 },
    { "query": "javascript promises", "count": 8 }
  ]
}
```

**Error Response (200):**
```json
{
  "success": false,
  "searches": [],
  "error": "Error message"
}
```

---

### GET /search/suggestions

Get search suggestions based on query prefix.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- q (string, required)
- limit (number, optional, default: 5)

**Success Response (200):**
```json
{
  "success": true,
  "suggestions": [
    { "text": "react hooks tutorial", "type": "history" },
    { "text": "react", "type": "tag" }
  ],
  "query": "react"
}
```

**Validation/Error Response (200):**
```json
{
  "success": false,
  "suggestions": [],
  "message": "Query parameter is required"
}
```

---

### POST /search/save

Save a search query for reuse.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "AI Research Notes",
  "query": "machine learning",
  "filters": {
    "tags": ["ai", "ml"],
    "categories": ["Technology"]
  }
}
```

**Validation Rules:**
- name: required string
- query: required string
- filters: optional object

**Success Response (201):**
```json
{
  "success": true,
  "savedSearch": {
    "id": "cm4saved123",
    "userId": "cm4user123",
    "name": "AI Research Notes",
    "query": "machine learning",
    "filters": { "tags": ["ai", "ml"], "categories": ["Technology"] },
    "isDefault": false,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Search saved successfully"
}
```

**Error Response (201):**
```json
{
  "success": false,
  "message": "Failed to save search",
  "error": "Error message"
}
```

---

### GET /search/saved

Get user's saved searches.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "savedSearches": [
    {
      "id": "cm4saved123",
      "userId": "cm4user123",
      "name": "AI Research Notes",
      "query": "machine learning",
      "filters": { "tags": ["ai", "ml"] },
      "isDefault": false,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Response (200):**
```json
{
  "success": false,
  "savedSearches": [],
  "error": "Error message"
}
```

---

### DELETE /search/saved/:id

Delete a saved search.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- id (string) - Saved search ID

**Success Response (204):**
No content returned.

---

### GET /search/analytics

Get search analytics and insights for the user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "analytics": {
    "totalSearches": 156,
    "uniqueQueries": 89,
    "avgResultsPerSearch": 8.5,
    "totalSavedSearches": 12,
    "searchesByDay": {
      "2024-01-15": 8,
      "2024-01-14": 6
    },
    "topQueries": [
      { "query": "react hooks", "count": 12 }
    ],
    "searchTrends": {
      "last7Days": 18,
      "last30Days": 42
    }
  }
}
```

**Error Response (200):**
```json
{
  "success": false,
  "analytics": null,
  "error": "Error message"
}
```

---

### POST /search/quick

Simplified search endpoint for quick queries.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "react",
  "limit": 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "query": "react",
  "results": [
    {
      "id": "cm4note123",
      "title": "React Development Guide",
      "excerpt": "React is a JavaScript library for building user interfaces...",
      "score": 92.5,
      "highlights": ["**React** development"],
      "workspace": { "id": "cm4workspace123", "name": "Development Notes" },
      "updatedAt": "2024-01-15T14:20:00.000Z"
    }
  ],
  "total": 1
}
```

**Error Response (200):**
```json
{
  "success": false,
  "message": "Failed to perform quick search",
  "error": "Error message"
}
```
