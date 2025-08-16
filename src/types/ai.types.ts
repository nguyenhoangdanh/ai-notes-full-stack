import { BaseEntity } from './common.types'
import { Note } from './note.types'

// AI conversation types
export interface AIConversation extends BaseEntity {
  userId: string
  noteId?: string
  title: string
  messages: ChatMessage[]
  context: string[] // Related note IDs
  totalTokens: number
  note?: Note
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  citations?: Citation[]
}

export interface Citation {
  noteId: string
  title: string
  excerpt: string
  relevance: number
  chunkId?: string
}

// Chat request/response DTOs
export interface ChatRequest {
  query: string
  model?: string
  maxTokens?: number
  context?: string[]
}

export interface ChatResponse {
  response: string
  citations: Citation[]
  tokensUsed: number
  model: string
}

// AI suggestion types
export enum SuggestionType {
  TAG = 'TAG',
  TITLE = 'TITLE', 
  SUMMARY = 'SUMMARY',
  LINK = 'LINK',
  IMPROVEMENT = 'IMPROVEMENT'
}

export interface AISuggestion extends BaseEntity {
  noteId: string
  type: SuggestionType
  suggestion: string
  confidence: number
  isAccepted?: boolean
}

// Content improvement suggestions
export type ContentSuggestionType = 
  | 'improve' 
  | 'expand' 
  | 'summarize' 
  | 'restructure' 
  | 'examples' 
  | 'grammar' 
  | 'translate'

export interface ContentSuggestionRequest {
  content: string
  selectedText?: string
  suggestionType: ContentSuggestionType
  targetLanguage?: string
}

export interface ContentSuggestionResponse {
  suggestion: string
  type: string
  confidence?: number
  originalText?: string
}

// Apply suggestion types
export type ApplyType = 'replace' | 'append' | 'insert'

export interface ApplySuggestionRequest {
  noteId: string
  originalContent: string
  suggestion: string
  selectedText?: string
  applyType: ApplyType
  position?: number
}

export interface ApplySuggestionResponse {
  content: string
  changes: {
    type: ApplyType
    position?: number
    originalText?: string
    newText: string
  }
}

// Smart features
export interface DuplicateReport extends BaseEntity {
  originalNoteId: string
  duplicateNoteId: string
  similarity: number
  type: DuplicateType
  status: DuplicateStatus
  ownerId: string
  resolvedAt?: string
  originalNote?: Note
  duplicateNote?: Note
}

export enum DuplicateType {
  CONTENT = 'CONTENT',
  TITLE = 'TITLE',
  SEMANTIC = 'SEMANTIC'
}

export enum DuplicateStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  MERGED = 'MERGED'
}

export interface RelatedNote extends BaseEntity {
  sourceNoteId: string
  targetNoteId: string
  relevance: number
  type: RelationType
  sourceNote?: Note
  targetNote?: Note
}

export enum RelationType {
  SEMANTIC = 'SEMANTIC',
  CONTEXTUAL = 'CONTEXTUAL',
  TEMPORAL = 'TEMPORAL',
  REFERENCE = 'REFERENCE'
}

// RAG and semantic search
export interface SemanticSearchRequest {
  query: string
  limit?: number
  minRelevance?: number
  includeContent?: boolean
  noteIds?: string[]
}

export interface SemanticSearchResult {
  note: Note
  relevance: number
  chunks: {
    chunkId: string
    content: string
    relevance: number
    heading?: string
  }[]
}