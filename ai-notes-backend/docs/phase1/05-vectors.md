# Vector Search & RAG API

Semantic search and Retrieval-Augmented Generation system for intelligent note discovery.

## 📋 Overview

The vector system powers semantic search and AI chat capabilities by converting note content into vector embeddings. Provides intelligent note discovery even when exact keywords don't match.

### Features
- ✅ Semantic search using vector embeddings
- ✅ RAG context building for AI chat
- ✅ Automatic text chunking and embedding
- ✅ Fallback to enhanced text search when embeddings unavailable
- ✅ Context optimization for AI conversations

## 🔐 Endpoints

### POST /vectors/semantic-search

Perform semantic search across user's notes using vector embeddings or enhanced text search.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "machine learning concepts and algorithms",
  "limit": 5
}
```

**Validation Rules:**
- `query`: Required string (validated by interface definition)
- `limit`: Optional number, default 5 (validated by interface definition)

**Success Response (200):**
```json
[
  {
    "id": "cm4vector123",
    "noteId": "cm4note123", 
    "chunkId": "cm4note123_chunk_1",
    "chunkContent": "Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data...",
    "chunkIndex": 1,
    "heading": "Introduction to ML",
    "embedding": [0.1, 0.2, -0.3, ...],
    "ownerId": "cm4user123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "noteTitle": "AI Research Notes",
    "similarity": 0.87
  },
  {
    "id": "cm4vector456", 
    "noteId": "cm4note456",
    "chunkId": "cm4note456_chunk_3", 
    "chunkContent": "Neural networks are computing systems inspired by biological neural networks...",
    "chunkIndex": 3,
    "heading": "Neural Network Basics",
    "embedding": [0.2, -0.1, 0.4, ...],
    "ownerId": "cm4user123",
    "createdAt": "2024-01-14T14:15:00.000Z",
    "noteTitle": "Deep Learning Fundamentals",
    "similarity": 0.82
  }
]
```

**Response Fields:**
- `similarity`: Float 0-1, relevance score (higher = more relevant) 
- `chunkContent`: Text chunk that matched the search
- `chunkIndex`: Position of chunk within the note
- `heading`: Markdown heading this chunk belongs to (optional)
- `noteTitle`: Title of the source note from included relation
- `embedding`: Vector embedding array (empty array [] if embeddings disabled)

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## 🔧 Implementation Details

### Authentication & Authorization
- Protected by `JwtAuthGuard`
- User extracted from JWT via `@CurrentUser()` decorator
- All searches automatically scoped by `ownerId: userId`

### Search Strategy Implementation
The service implements a sophisticated fallback system:

**1. OpenAI Configuration Check:**
- Validates API key format (must start with 'sk-' and not contain 'dummy')
- Initializes OpenAI client with 30s timeout and 2 retries
- Sets `useEmbeddings` flag based on configuration validity

**2. Search Execution:**
- Always uses enhanced text search (`fallbackTextSearch()`) for reliability
- Vector embeddings available when OpenAI properly configured
- Automatic fallback prevents service disruption

### Enhanced Text Search Algorithm

**Query Processing:**
- Splits query into keywords (filters words > 2 characters)
- Searches both `chunkContent` and related note titles
- Uses case-insensitive matching with Prisma `mode: 'insensitive'`

**Search Conditions (OR logic):**
- Exact phrase match in chunk content (highest priority)
- Query match in note title
- Individual keyword matches in content
- Fetches `limit * 2` results for better filtering

**Relevance Scoring:**
```typescript
// Scoring algorithm in code
let score = 0;
if (content.includes(query.toLowerCase())) score += 10; // Exact phrase
if (title.includes(query.toLowerCase())) score += 8;    // Title match
keywords.forEach(keyword => {
  if (content.includes(keyword)) score += 2;            // Content keyword
  if (title.includes(keyword)) score += 3;             // Title keyword
});
if (chunkContent.length < 500) score += 1;             // Short chunk bonus
// Normalized to 0-1: similarity = Math.min(score / 10, 1.0)
```

### Vector Processing System

**Chunking Strategy:**
- Maximum 400 tokens per chunk with 30-token overlap
- Intelligent splitting at sentence boundaries when possible
- Preserves markdown heading context for each chunk
- Filters chunks shorter than 20 characters

**Embedding Generation:**
- Model: `text-embedding-3-small` (1536 dimensions)
- Batch processing for multiple chunks
- Automatic retry with embedding disable on failure
- Graceful degradation to text-only storage

**Error Handling:**
- OpenAI failures automatically disable embeddings
- Chunks stored with empty embedding arrays for text search
- Console logging for debugging and monitoring
- Never throws errors that disrupt main note operations

### RAG Context Building

**Process Flow:**
1. Execute semantic search to find relevant chunks (limit 10)
2. Build context string with token counting
3. Add section markers: `--- NoteTitle > Heading ---`
4. Track citations for source attribution
5. Respect token limits (default 3000 tokens, ~70% of model capacity)

**Context Structure:**
```
--- Note Title > Section Heading ---
Relevant chunk content...

--- Another Note > Different Section ---  
More relevant content...
```

**Citation Tracking:**
```json
{
  "context": "Built context string...",
  "citations": [
    {
      "title": "Note Title",
      "heading": "Section Heading"
    }
  ]
}
```

### Database Operations
- **Storage**: Vectors stored in PostgreSQL with `Float[]` type
- **Cleanup**: `deleteByNote()` removes all vectors when note deleted/updated
- **Relationships**: Vector includes note relation for title access
- **Indexing**: Vectors ordered by `createdAt: 'desc'` for recency

### Usage Tracking Integration
- Method `updateUsage()` tracks embedding and chat tokens
- Only updates when actual tokens consumed (avoids zero-usage records)
- Handles both new records and existing usage updates
- Graceful error handling to avoid disrupting main operations

## 🧪 Testing Examples

**Semantic search:**
```bash
curl -X POST http://localhost:3001/api/vectors/semantic-search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "artificial intelligence and machine learning",
    "limit": 5
  }'
```

**Response with text search fallback:**
```json
[
  {
    "id": "cm4vector789",
    "noteId": "cm4note789",
    "chunkId": "cm4note789_chunk_0", 
    "chunkContent": "Artificial intelligence (AI) is transforming how we approach machine learning problems...",
    "chunkIndex": 0,
    "heading": null,
    "embedding": [],
    "ownerId": "cm4user123", 
    "createdAt": "2024-01-15T10:30:00.000Z",
    "noteTitle": "AI Overview",
    "similarity": 0.95
  }
]
```

## 🔄 Service Integration

### NotesService Integration
- **Automatic Processing**: `processNoteForRAG()` called on note create/update
- **Background Execution**: Processing happens asynchronously with error handling
- **Content Change Detection**: Re-processing triggered for significant content changes
- **Cleanup**: Vectors removed on note deletion via `deleteByNote()`

### ChatService Integration
- **Context Building**: `buildChatContext()` provides relevant note content
- **Token Management**: Respects model context limits for optimal AI responses
- **Citation Support**: Returns source attribution for transparency
- **Relevance Filtering**: Only includes chunks above 0.1 similarity threshold

### Configuration Dependencies
- **OpenAI API Key**: Required for embedding generation
- **Database**: PostgreSQL with vector storage support
- **Environment**: Configurable timeouts and retry limits

## 📊 Performance Characteristics

### Search Performance
- **Text Search**: Fast PostgreSQL queries with indexed text matching
- **Vector Search**: When available, provides semantic understanding
- **Result Ranking**: Combined similarity scores with recency weighting
- **Memory Efficiency**: Streaming processing for large result sets

### Scalability Considerations
- **Connection Pooling**: Leverages Prisma connection management
- **Batch Processing**: Efficient embedding generation for multiple chunks
- **Graceful Degradation**: Service remains functional without OpenAI
- **Token Optimization**: Smart context building respects model limits

### Error Recovery
- **Provider Fallbacks**: Automatic switching to text search on embedding failures
- **Retry Logic**: Limited retries prevent timeout cascades
- **Silent Failures**: Background processing errors don't disrupt user operations
- **Status Logging**: Comprehensive console output for system monitoring

---

**Next:** [AI Chat API](./06-chat.md)
