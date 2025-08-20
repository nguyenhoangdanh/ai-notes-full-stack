# Step 1: Complete Hook & Service Inventory

## Hook & Service Inventory Report

### Hook Inventory

#### Core Hooks

| Hook File | Functions | Parameters | Return Type | Query/Mutation Keys | Services | Types | Components Using |
|-----------|-----------|------------|-------------|---------------------|----------|-------|------------------|
| **use-auth.ts** | | | | | | | |
| useAuth | login, register, logout, verifyToken | LoginDto, RegisterDto | AuthResponseDto | auth.profile, auth.verify | authService | AuthResponseDto, LoginDto, RegisterDto | app/layout.tsx |
| useAuthProfile | N/A | N/A | UseQueryResult<User> | auth.profile | authService.getProfile | User | Multiple components |
| useUserSettings | N/A | N/A | UseQueryResult<Settings> | auth.settings | authService.getSettings | Settings | Settings pages |
| useUsage | N/A | N/A | UseQueryResult<Usage> | auth.usage | authService.getUsage | Usage | Dashboard |

| **use-notes.ts** | | | | | | | |
| useNotes | workspaceId?, limit? | string?, number? | UseQueryResult<Note[]> | notes.list | noteService.getAll | Note | Dashboard, Notes list |
| useNote | id | string | UseQueryResult<Note> | notes.detail | noteService.getNote | Note | Note detail pages |
| useCreateNote | N/A | CreateNoteDto | UseMutationResult<Note> | ['notes'] | noteService.createNote | CreateNoteDto, Note | Note creation |
| useUpdateNote | N/A | {id: string, data: UpdateNoteDto} | UseMutationResult<Note> | notes.detail | noteService.updateNote | UpdateNoteDto, Note | Note editing |
| useDeleteNote | N/A | string | UseMutationResult<void> | ['notes'] | noteService.deleteNote | void | Note actions |
| useSearchNotes | params | SearchNotesDto | UseQueryResult<SearchResult[]> | notes.search | noteService.search | SearchNotesDto, SearchResult | Search components |

| **use-ai.ts** | | | | | | | |
| useStreamChat | N/A | ChatRequest | UseMutationResult<{stream, citations}> | ['ai', 'chat'] | aiService.streamChat | ChatRequest | AI chat interface |
| useCompleteChat | N/A | ChatRequest | UseMutationResult<{response: string}> | ['ai', 'chat'] | aiService.completeChat | ChatRequest | AI chat |
| useGenerateSuggestion | N/A | ContentSuggestionRequest | UseMutationResult<{suggestion}> | ['ai', 'suggestions'] | aiService.getSuggestions | ContentSuggestionRequest | Content editing |
| useSemanticSearch | N/A | SemanticSearchDto | UseMutationResult<SemanticSearchResult[]> | ['ai', 'search'] | aiService.semanticSearch | SemanticSearchDto, SemanticSearchResult | Search |

| **use-smart.ts** | | | | | | | |
| useCategories | includeAuto? | boolean? | UseQueryResult<Category[]> | categories.list | categoriesService.getAll | Category | Categories pages |
| useCategory | id | string | UseQueryResult<Category> | categories.detail | categoriesService.getById | Category | Category detail |
| useCategoryNotes | categoryId | string | UseQueryResult<Note[]> | categories.detail.notes | ⚠️ NO BACKEND ENDPOINT | Note | Category detail page |
| useNoteSummary | noteId | string | UseQueryResult<Summary> | summaries.note | summariesService.getNoteSummary | Summary | Note detail |
| useRelatedNotes | noteId | string | UseQueryResult<RelatedNote[]> | relations.related | relationsService.getRelatedNotes | RelatedNote | Relations components |
| useNoteGraph | noteId | string | UseQueryResult<NoteGraph> | relations.graph | relationsService.getNoteGraph | NoteGraph | Relations graph |
| useDuplicateDetection | N/A | N/A | UseMutationResult<DuplicateDetectionReport[]> | duplicates.detect | duplicatesService.detectDuplicates | DuplicateDetectionReport | Duplicates page |

### Service Inventory

| Service File | Methods | Endpoints | Request Types | Response Types | Notes |
|--------------|---------|-----------|---------------|----------------|--------|
| **auth.service.ts** | | | | | |
| login | POST /auth/login | LoginDto | AuthResponseDto | ✅ Complete |
| register | POST /auth/register | RegisterDto | AuthResponseDto | ✅ Complete |
| getProfile | GET /auth/me | void | User | ✅ Complete |
| verify | GET /auth/verify | void | {valid: boolean, user?: User} | ✅ Complete |
| googleLogin | GET /auth/google | void | void | ✅ Complete |

| **note.service.ts** | | | | | |
| getAll | GET /notes | {workspaceId?, limit?} | Note[] | ✅ Complete |
| getById | GET /notes/:id | void | Note | ✅ Complete |
| create | POST /notes | CreateNoteDto | Note | ✅ Complete |
| update | PATCH /notes/:id | UpdateNoteDto | Note | ✅ Complete |
| delete | DELETE /notes/:id | void | void | ✅ Complete |
| search | GET /notes/search | SearchNotesDto | SearchResult[] | ✅ Complete |
| processRAG | POST /notes/:id/process-rag | void | {message: string} | ✅ Complete |

| **ai.service.ts** | | | | | |
| streamChat | POST /chat/stream | ChatQueryDto | ReadableStream | ✅ Complete |
| completeChat | POST /chat/complete | ChatQueryDto | {response: string} | ✅ Complete |
| getSuggestions | POST /chat/suggest | GenerateSuggestionDto | {suggestion: string} | ✅ Complete |
| semanticSearch | POST /vectors/semantic-search | SemanticSearchDto | SemanticSearchResult[] | ✅ Complete |

| **smart.service.ts** | | | | | |
| categoriesService.getAll | GET /categories | {includeAuto?} | Category[] | ✅ Complete |
| categoriesService.getById | GET /categories/:id | void | Category | ✅ Complete |
| categoriesService.create | POST /categories | CreateCategoryDto | Category | ✅ Complete |
| categoriesService.getNoteCategories | GET /categories/notes/:noteId | void | Category[] | ✅ Complete |
| summariesService.getNoteSummary | GET /summaries/notes/:noteId | void | Summary | ✅ Complete |
| relationsService.getRelatedNotes | GET /relations/notes/:noteId/related | void | RelatedNote[] | ✅ Complete |
| relationsService.getNoteGraph | GET /relations/notes/:noteId/graph | void | NoteGraph | ✅ Complete |
| duplicatesService.detectDuplicates | GET /duplicates/detect | void | DuplicateDetectionReport[] | ✅ Complete |

### Types Inventory

| Type File | Main Types | Domain | Usage |
|-----------|------------|--------|--------|
| **auth.types.ts** | AuthResponseDto, LoginDto, RegisterDto, User | Authentication | Auth hooks, login/register forms |
| **note.types.ts** | Note, CreateNoteDto, UpdateNoteDto, SearchNotesDto, SearchResult | Notes Management | Note CRUD, search functionality |
| **ai.types.ts** | ChatRequest, ChatQueryDto, ContentSuggestionRequest, SemanticSearchDto, SemanticSearchResult | AI Features | AI chat, suggestions, semantic search |
| **smart.types.ts** | Category, CreateCategoryDto, Summary, RelatedNote, NoteGraph, DuplicateDetectionReport | Smart Features | Auto-categorization, summaries, relations, duplicates |
| **collaboration.types.ts** | Collaboration, Permission, ShareLink, NoteVersion | Collaboration | Sharing, versioning, collaboration |
| **productivity.types.ts** | ProductivityTask, PomodoroSession, CalendarEvent | Productivity | Tasks, pomodoro, calendar |
| **mobile.types.ts** | VoiceNote, LocationNote | Mobile Features | Voice notes, location-based notes |

### Critical Issues Found

#### 🚨 Missing Backend Endpoints
1. **GET /notes/by-category/:categoryId** - Required for `useCategoryNotes` hook used in category detail page
2. **Multiple productivity endpoints** - Service methods don't match actual backend API

#### 🚨 TypeScript Compliance Issues
1. **Parameter destructuring patterns** - Many hooks use incorrect destructuring syntax causing build failures
2. **Query key function calls** - Missing parentheses on query key functions
3. **Missing type imports** - Several hooks missing proper type imports
4. **Service method mismatches** - Hook methods don't match actual service method names

#### 🚨 Hook Export Issues
1. **Commented exports** - Main hooks/index.ts has most exports commented out
2. **Naming mismatches** - Components importing hooks with different names than exported
3. **Missing hook implementations** - Some hooks referenced but not implemented

### Pages Using Hooks (Incomplete Analysis)

| Page | Components | Hooks Used | Status |
|------|------------|------------|--------|
| app/categories/[id]/page.tsx | Category detail | useCategory, useCategoryNotes ❌ | ❌ Build failing |
| app/relations/page.tsx | Relations graph | useRelatedNotes, useRelationsStats | ⚠️ Hook naming issues |
| app/notes/page.tsx | Notes dashboard | useNotes, useCreateNote | ✅ Should work |
| app/ai/page.tsx | AI chat | useStreamChat, useCompleteChat | ✅ Should work |

### Recommendations for Step 2

1. **Fix Critical Build Issues First**
   - Implement missing `useCategoryNotes` hook with proper backend endpoint
   - Fix all TypeScript destructuring patterns
   - Uncomment and fix hook exports

2. **Complete Comprehensive Page Analysis**
   - Map every page to its components and hooks
   - Identify missing hook integrations
   - Check for proper error/loading states

3. **Verify Service-Hook Alignment**
   - Ensure all hook methods match service methods
   - Fix query key structures
   - Add missing optimistic updates

### Next Steps
1. Fix immediate build issues to enable development
2. Complete pages and components mapping
3. Create hook utilization matrix
4. Plan systematic refactoring approach