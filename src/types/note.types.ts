import { BaseEntity } from './common.types'

// Note entity
export interface Note extends BaseEntity {
  title: string
  content: string
  tags: string[]
  workspaceId: string
  ownerId: string
  isDeleted: boolean
}

// Extended note with relations
export interface NoteWithRelations extends Note {
  workspace?: {
    id: string
    name: string
  }
  owner?: {
    id: string
    name?: string
    email: string
  }
  collaborations?: Collaboration[]
  shareLinks?: ShareLink[]
  analytics?: NoteAnalytics
  autoSummary?: AutoSummary
  attachments?: Attachment[]
  categories?: NoteCategory[]
}

// Note DTOs
export interface CreateNoteDto {
  title: string
  content: string
  tags: string[]
  workspaceId: string
}

export interface UpdateNoteDto {
  title?: string
  content?: string
  tags?: string[]
  workspaceId?: string
}

export interface SearchNotesDto {
  q: string
  limit?: number
  workspaceId?: string
  tags?: string[]
}

// Search result for notes
export interface SearchResult {
  note: Note
  relevance: number
  highlights: string[]
  matchType: 'title' | 'content' | 'tags' | 'semantic'
}

// Vector embeddings for RAG
export interface Vector extends BaseEntity {
  noteId: string
  chunkId: string
  chunkContent: string
  chunkIndex: number
  heading?: string
  embedding: number[]
  ownerId: string
}

// Note analytics
export interface NoteAnalytics extends BaseEntity {
  noteId: string
  viewCount: number
  editCount: number
  shareCount: number
  lastViewed?: string
  lastEdited?: string
  readingTime?: number // in minutes
  wordCount: number
}

// Collaboration types
export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN'
}

export interface Collaboration extends BaseEntity {
  noteId: string
  userId: string
  permission: Permission
  invitedBy: string
  user?: {
    id: string
    name?: string
    email: string
    image?: string
  }
  inviter?: {
    id: string
    name?: string
    email: string
  }
}

// Share links
export interface ShareLink extends BaseEntity {
  noteId: string
  token: string
  isPublic: boolean
  expiresAt?: string
  allowComments: boolean
  requireAuth: boolean
  maxViews?: number
  passwordHash?: string
  settings?: Record<string, any>
  shareViews?: ShareView[]
}

export interface ShareView extends BaseEntity {
  shareLinkId: string
  viewerIp: string
  viewerAgent?: string
  referrer?: string
  viewerId?: string
  isUnique: boolean
  metadata?: Record<string, any>
  viewedAt: string
}

// Note versions
export interface NoteVersion extends BaseEntity {
  noteId: string
  version: number
  title: string
  content: string
  changeLog?: string
  createdBy: string
  user?: {
    id: string
    name?: string
    email: string
  }
}

// Auto summaries
export interface AutoSummary extends BaseEntity {
  noteId: string
  summary: string
  keyPoints: string[]
  wordCount: number
  ownerId: string
  model: string
}

// Attachments
export interface Attachment extends BaseEntity {
  noteId: string
  filename: string
  filepath: string
  fileType: string
  fileSize: number
  uploadedBy: string
  ocrResult?: OCRResult
}

export interface OCRResult extends BaseEntity {
  attachmentId: string
  text: string
  confidence: number
  language?: string
  boundingBoxes?: Record<string, any>
}

// Categories and tags
export interface Category extends BaseEntity {
  name: string
  description?: string
  color?: string
  icon?: string
  keywords: string[]
  ownerId: string
  isAuto: boolean
  confidence?: number
}

export interface NoteCategory {
  noteId: string
  categoryId: string
  confidence?: number
  isAuto: boolean
  createdAt: string
  category?: Category
}

export interface Tag extends BaseEntity {
  name: string
  color?: string
  description?: string
  ownerId: string
}

export interface NoteTag {
  noteId: string
  tagId: string
  tag?: Tag
}