# AI Chat API

Intelligent chat interface with RAG (Retrieval-Augmented Generation) over your notes.

## 📋 Overview

The AI chat system provides conversational access to your notes using advanced RAG techniques. It searches through your content semantically and provides contextual answers with proper citations.

### Features
- ✅ Real-time streaming chat responses
- ✅ RAG-powered answers from your notes  
- ✅ Multiple AI provider support (OpenAI, Google Gemini, Groq)
- ✅ Automatic context building and citation tracking
- ✅ Content suggestions and improvements
- ✅ Suggestion application system

## 🔐 Endpoints

### POST /chat/stream

Stream AI response for real-time chat experience with your notes as context.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "What did I write about machine learning?",
  "model": "gemini-1.5-flash",
  "maxTokens": 4000
}
```

**Validation Rules:**
- `query`: Required string, non-empty (validated by interface, explicit validation in controller)
- `model`: Optional string (interface definition, not used in current implementation)
- `maxTokens`: Optional number (interface definition, not used in current implementation)

**Response Headers:**
```
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Expose-Headers: X-Citations
X-Citations: [{"title":"Note Title","heading":"Section"}]
```

**Response Body:**
Streaming text response, sent chunk by chunk for real-time display.

**Error Responses:**
```json
// 400 - Validation Error
{
  "message": "Query is required and must be a non-empty string",
  "statusCode": 400
}

// 500 - Processing Error  
{
  "error": "Internal server error",
  "message": "Failed to process chat request"
}
```

---

### POST /chat/complete

Get complete AI response (non-streaming) for simpler implementations.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "Summarize my machine learning notes",
  "model": "gemini-1.5-flash",
  "maxTokens": 4000
}
```

**Success Response (200):**
```json
{
  "response": "Based on your notes, machine learning is a field of artificial intelligence that focuses on algorithms that can learn from data...",
  "citations": [
    {
      "title": "ML Fundamentals",
      "heading": "Introduction"
    },
    {
      "title": "Neural Networks Deep Dive", 
      "heading": "Supervised Learning Algorithms"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "message": "Failed to process chat request",
  "statusCode": 500
}
```

---

### POST /chat/suggest

Generate AI-powered suggestions for improving note content.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Your note content here...",
  "selectedText": "specific text to improve",
  "suggestionType": "improve", 
  "targetLanguage": "English"
}
```

**Suggestion Types:**
- `improve` - Enhance writing style and clarity
- `expand` - Add more detail and examples
- `summarize` - Create concise summary
- `restructure` - Reorganize for better flow
- `examples` - Add practical examples  
- `grammar` - Fix grammar and spelling
- `translate` - Translate to target language

**Validation Rules:**
- `content`: Required string - full note content
- `selectedText`: Optional string - specific text to process
- `suggestionType`: Required enum - type of suggestion to generate
- `targetLanguage`: Optional string - for translation suggestions

**Success Response (200):**
```json
{
  "originalText": "Text that was processed...",
  "suggestion": "Improved version of the text with enhanced clarity, better structure, and more engaging language...",
  "type": "improve",
  "hasSelection": true
}
```

**Error Response (500):**
```json
{
  "message": "Failed to generate suggestion",
  "statusCode": 500
}
```

---

### POST /chat/apply-suggestion

Apply AI suggestion to note content with various insertion methods.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "noteId": "cm4note123",
  "originalContent": "Full note content...",
  "suggestion": "AI generated suggestion...",
  "selectedText": "text to replace", 
  "applyType": "replace",
  "position": 150
}
```

**Apply Types:**
- `replace` - Replace selected text or entire content
- `append` - Add to end of note with double line break
- `insert` - Insert at specific position with line breaks

**Validation Rules:**
- `noteId`: Required string - target note ID
- `originalContent`: Required string - current note content
- `suggestion`: Required string - AI-generated suggestion
- `selectedText`: Optional string - text to replace (for replace type)
- `applyType`: Required enum - how to apply suggestion
- `position`: Optional number - insertion position (for insert type)

**Success Response (200):**
```json
{
  "newContent": "Content with suggestion applied...",
  "applied": true,
  "type": "replace"
}
```

**Error Response (500):**
```json
{
  "message": "Failed to apply suggestion", 
  "statusCode": 500
}
```

## 🔧 Implementation Details

### Authentication & Authorization
- All endpoints protected by `JwtAuthGuard`
- User extracted from JWT via `@CurrentUser()` decorator
- All operations scoped to authenticated user

### AI Provider Configuration & Selection Logic

**Provider Priority (based on configured API keys):**
1. **Google Gemini** - Primary choice if `GOOGLE_GEMINI_API_KEY` configured
2. **OpenAI** - Used if `OPENAI_API_KEY` configured
3. **Fallback** - Error message if no providers available

**API Key Validation:**
```typescript
// Constructor logic
if (this.geminiApiKey) {
  console.log('✅ Google Gemini API key configured (Free tier available)');
} else if (this.openaiApiKey) {
  console.log('✅ OpenAI API key configured');
} else {
  console.log('⚠️ No AI API key configured');
}
```

### Model Selection & Fallback Strategy

**Automatic Model Switching:**
- If user requests GPT model but no OpenAI key → Switch to `gemini-1.5-flash`
- OpenAI quota exceeded → Automatic Gemini fallback with retry
- API errors → Graceful degradation with informative messages

**Available Models:**
- `gemini-1.5-flash` (Google Gemini, Free)
- `gpt-3.5-turbo` (OpenAI, Paid)
- `gpt-4` (OpenAI, Paid)

### Streaming Implementation

**Gemini Streaming (Simulated):**
```typescript
// Gemini doesn't support real streaming, so we simulate it
const stream = {
  async *[Symbol.asyncIterator]() {
    const words = fullText.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ');
      yield { choices: [{ delta: { content: chunk } }] };
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
};
```

**Groq Real Streaming:**
```typescript
// True streaming via Server-Sent Events
const stream = {
  async *[Symbol.asyncIterator]() {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      // Parse SSE format: "data: {...}"
    }
  }
};
```

**OpenAI Native Streaming:**
```typescript
// Uses OpenAI SDK built-in streaming
const stream = await openai.chat.completions.create({
  model: model,
  messages: [{ role: 'user', content: prompt }],
  stream: true,
});
```

### RAG Context Building

**Process Flow:**
1. Get user settings for model and token limits
2. Call `vectorsService.buildChatContext()` with 70% token allocation
3. Build structured prompt with system instructions
4. Execute AI call with appropriate provider
5. Return stream with citations in headers

**System Prompt (Vietnamese):**
```
Bạn là trợ lý AI thông minh cho ứng dụng ghi chú cá nhân AI Notes.

🎯 NHIỆM VỤ CHÍNH:
- Trả lời câu hỏi dựa CHÍNH XÁC trên nội dung ghi chú được cung cấp
- Tìm kiếm và tổng hợp thông tin từ nhiều ghi chú nếu cần
- Cung cấp trích dẫn rõ ràng từ các ghi chú gốc

📋 QUY TẮC QUAN TRỌNG:
1. CHỈ sử dụng thông tin có trong phần "Context from your notes"
2. Nếu không tìm thấy thông tin, nói: "Tôi không tìm thấy thông tin này trong ghi chú của bạn."
3. Luôn trích dẫn nguồn: tên ghi chú và tiêu đề phần
4. KHÔNG bao giờ tự suy diễn hay tạo thông tin không có
```

### Suggestion System

**Specialized Prompts per Type:**
```typescript
const suggestions = {
  improve: "Vai trò: Bạn là editor chuyên nghiệp. Nhiệm vụ: Cải thiện văn phong...",
  expand: "Vai trò: Bạn là chuyên gia nội dung. Nhiệm vụ: Mở rộng đoạn text...",
  summarize: "Vai trò: Bạn là chuyên gia tóm tắt. Nhiệm vụ: Tóm tắt đoạn text...",
  // ... other types
};
```

**Direct AI Calls (Non-streaming):**
- Uses direct HTTP calls instead of streaming
- Lower temperature (0.3) for more consistent results
- Dedicated methods for each provider: `directGeminiCall()`, `directGroqCall()`, `directOpenAICall()`

### Suggestion Application Logic

**Apply Types Implementation:**
```typescript
switch (data.applyType) {
  case 'replace':
    if (data.selectedText) {
      newContent = newContent.replace(data.selectedText, data.suggestion);
    } else {
      newContent = data.suggestion;
    }
    break;
  
  case 'append':
    newContent = newContent + '\n\n' + data.suggestion;
    break;
  
  case 'insert':
    const position = data.position || newContent.length;
    newContent = newContent.slice(0, position) + '\n\n' + data.suggestion + '\n\n' + newContent.slice(position);
    break;
}
```

### Error Handling & Fallbacks

**Quota Exceeded Handling:**
```typescript
if (error.code === 'insufficient_quota' || error.status === 429) {
  console.log('OpenAI quota exceeded, trying free alternatives...');
  if (this.geminiApiKey) {
    return await this.completeWithGemini(fullPrompt, 'gemini-1.5-flash', citations);
  }
}
```

**Fallback Stream Creation:**
```typescript
private createFallbackStream(message: string, citations: any[]) {
  const stream = {
    async *[Symbol.asyncIterator]() {
      const words = message.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        yield { choices: [{ delta: { content: chunk } }] };
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };
  return { stream, citations };
}
```

### Service Dependencies
- **VectorsModule**: For RAG context building and semantic search
- **SettingsModule**: For user AI model preferences and token limits
- **ConfigService**: For API key management
- **OpenAI SDK**: For OpenAI API calls

## 🧪 Testing Examples

**Stream chat:**
```bash
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my notes about AI?"}' \
  --no-buffer
```

**Complete response:**
```bash
curl -X POST http://localhost:3001/api/chat/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize my machine learning notes",
    "model": "gemini-1.5-flash"
  }'
```

**Generate suggestion:**
```bash
curl -X POST http://localhost:3001/api/chat/suggest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my note content that needs improvement.",
    "suggestionType": "improve"
  }'
```

**Apply suggestion:**
```bash
curl -X POST http://localhost:3001/api/chat/apply-suggestion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "noteId": "cm4note123",
    "originalContent": "Original content...",
    "suggestion": "Improved content...", 
    "applyType": "replace"
  }'
```

---

**Next:** [Settings & Usage API](./07-settings.md)
