# Settings & Usage API

User preferences management and usage tracking system.

## 📋 Overview

The settings system manages user preferences for AI models, token limits, and other application configurations. It also tracks API usage for monitoring and billing purposes.

### Features
- ✅ User preference management
- ✅ AI model selection and configuration
- ✅ Usage tracking for different API calls
- ✅ Auto-reembedding settings
- ✅ Default settings creation for new users

## 🔐 Endpoints

### GET /settings

Get current user's settings and preferences.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "id": "cm4settings123",
  "ownerId": "cm4user123",
  "model": "gemini-1.5-flash",
  "maxTokens": 4000,
  "autoReembed": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response Fields:**
- `model`: AI model to use for chat responses
- `maxTokens`: Maximum tokens for AI responses
- `autoReembed`: Automatically process notes for RAG when updated

**Available Models:**
- `gemini-1.5-flash` (Free, Google AI) - **Default**
- `llama3-8b-8192` (Free, Groq)
- `mixtral-8x7b-32768` (Free, Groq)
- `gemma-7b-it` (Free, Groq)
- `gpt-3.5-turbo` (Paid, OpenAI)
- `gpt-4` (Paid, OpenAI)

**Response if no settings found (200):**
```json
null
```

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### PATCH /settings

Update user settings and preferences.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "model": "gpt-4",
  "maxTokens": 8000,
  "autoReembed": false
}
```

**Validation Rules:**
- `model`: Optional string (validated by interface definition)
- `maxTokens`: Optional number (validated by interface definition)
- `autoReembed`: Optional boolean (validated by interface definition)

**Success Response (200):**
```json
{
  "id": "cm4settings123",
  "ownerId": "cm4user123",
  "model": "gpt-4",
  "maxTokens": 8000,
  "autoReembed": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### GET /settings/usage

Get API usage statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `days` (string, optional, default: "30") - Number of days to retrieve (parsed as integer)

**Success Response (200):**
```json
[
  {
    "id": "cm4usage123",
    "ownerId": "cm4user123",
    "date": "2024-01-15",
    "embeddingTokens": 1250,
    "chatTokens": 3500,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T18:45:00.000Z"
  },
  {
    "id": "cm4usage124",
    "ownerId": "cm4user123",
    "date": "2024-01-14",
    "embeddingTokens": 800,
    "chatTokens": 2200,
    "createdAt": "2024-01-14T09:15:00.000Z",
    "updatedAt": "2024-01-14T16:30:00.000Z"
  }
]
```

**Response Fields:**
- `date`: Date in YYYY-MM-DD format (string)
- `embeddingTokens`: Tokens used for vector embeddings (integer, default: 0)
- `chatTokens`: Tokens used for AI chat responses (integer, default: 0)

**Error Response (401):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## 🔧 Implementation Details

### Authentication & Authorization
- All endpoints protected by `JwtAuthGuard`
- User extracted from JWT via `@CurrentUser()` decorator
- All operations automatically scoped to authenticated user

### Settings Management
**Service Methods:**
- `findByUserId()`: Returns user settings or null if not found
- `upsert()`: Creates new settings or updates existing ones
- Uses Prisma `upsert` operation for atomic create/update

**Default Settings Creation:**
- Automatically created during user registration in `UsersService.create()`
- Default values: `model: 'gemini-1.5-flash'`, `maxTokens: 4000`, `autoReembed: true`

**Upsert Behavior:**
```typescript
// If settings exist: update with provided data
// If settings don't exist: create with provided data + defaults
return this.prisma.settings.upsert({
  where: { ownerId: userId },
  update: data,
  create: {
    ownerId: userId,
    model: data.model || 'gemini-1.5-flash',
    maxTokens: data.maxTokens || 4000,
    autoReembed: data.autoReembed ?? true,
  },
});
```

### Usage Tracking System
**Query Logic:**
- Calculates start date by subtracting specified days from current date
- Filters usage records by `ownerId` and date range
- Orders results by date descending (newest first)
- Date format: YYYY-MM-DD string format

**Usage Record Structure:**
- `ownerId_date` unique constraint prevents duplicate daily records
- `embeddingTokens`: Tracks vector embedding API usage
- `chatTokens`: Tracks AI chat API usage
- Records created/updated via `VectorsService.updateUsage()`

### Database Operations
- **Settings Table**: One-to-one relationship with User via `ownerId`
- **Usage Table**: One-to-many relationship with User, unique constraint on `(ownerId, date)`
- **Token Tracking**: Only creates usage records when tokens > 0 to avoid empty records

### Integration with Other Services
- **ChatService**: Updates usage when processing AI requests
- **VectorsService**: Updates usage for embedding generation
- **UsersService**: Creates default settings during user creation

## 🧪 Testing Examples

**Get settings:**
```bash
curl -X GET http://localhost:3001/api/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update settings:**
```bash
curl -X PATCH http://localhost:3001/api/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "maxTokens": 8000,
    "autoReembed": false
  }'
```

**Get usage stats (last 7 days):**
```bash
curl -X GET "http://localhost:3001/api/settings/usage?days=7" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get usage stats (default 30 days):**
```bash
curl -X GET http://localhost:3001/api/settings/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Usage Tracking Details

### Automatic Usage Recording
Usage is tracked automatically when:
- **Vector Embeddings**: Generated during note RAG processing
- **AI Chat**: Tokens consumed in chat conversations
- **Background Processing**: Automatic note processing

### Data Retention
- Usage records are kept indefinitely for analytics
- Date-based querying allows flexible reporting periods
- Unique constraint prevents duplicate daily records

### Cost Estimation Logic
Usage data can be used to estimate API costs:
```typescript
// Example cost calculation (OpenAI pricing)
const estimateCost = (usage: Usage[]) => {
  const totalTokens = usage.reduce((sum, day) => 
    sum + day.embeddingTokens + day.chatTokens, 0
  );
  
  // Rough estimate: $0.002 per 1K tokens
  return (totalTokens / 1000) * 0.002;
};
```

## 🔄 Service Integration

### Settings in AI Chat
```typescript
// ChatService uses settings for model selection
const settings = await this.settingsService.findByUserId(userId);
let model = settings?.model || 'gemini-1.5-flash';
const maxTokens = settings?.maxTokens || 4000;
```

### Usage Tracking in Vector Service
```typescript
// VectorsService tracks usage when generating embeddings
public async updateUsage(userId: string, date: string, embeddingTokens: number, chatTokens: number) {
  // Only track usage if we actually used tokens
  if (embeddingTokens === 0 && chatTokens === 0) return;
  
  // Use upsert to handle existing/new records
  const existing = await this.prisma.usage.findUnique({
    where: { ownerId_date: { ownerId: userId, date } }
  });
  
  if (existing) {
    await this.prisma.usage.update({
      where: { id: existing.id },
      data: {
        embeddingTokens: existing.embeddingTokens + embeddingTokens,
        chatTokens: existing.chatTokens + chatTokens,
      },
    });
  } else {
    await this.prisma.usage.create({
      data: { ownerId: userId, date, embeddingTokens, chatTokens },
    });
  }
}
```

---

**🎉 Phase 1: Core Foundation COMPLETE!**

All Phase 1 modules are now documented:
1. ✅ **Authentication API** - Registration, login, OAuth, JWT
2. ✅ **Users API** - Profile management  
3. ✅ **Workspaces API** - Organization system
4. ✅ **Notes API** - Core CRUD operations
5. ✅ **Vectors API** - Semantic search & RAG
6. ✅ **Chat API** - AI conversations
7. ✅ **Settings API** - Preferences & usage tracking

**Next Phase:** [Phase 2A Smart Features Documentation](../phase2a/01-categories.md)
