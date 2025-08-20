/**
 * Note Types
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  workspaceId: string;
  ownerId: string;
  isDeleted: boolean;
  starred?: boolean;
  isShared?: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags: string[];
  workspaceId: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  tags?: string[];
  workspaceId?: string;
  starred?: boolean;
}

export interface SearchNotesDto {
  q: string;
  limit?: number;
}

export interface NoteWithAnalytics extends Note {
  analytics?: NoteAnalytics;
}

export interface NoteAnalytics {
  id: string;
  noteId: string;
  viewCount: number;
  editCount: number;
  shareCount: number;
  lastViewed?: string;
  lastEdited?: string;
  readingTime?: number;
  wordCount: number;
  updatedAt: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  content: string;
  changeLog?: string;
  createdBy: string;
  createdAt: string;
}

export interface Vector {
  id: string;
  noteId: string;
  chunkId: string;
  chunkContent: string;
  chunkIndex: number;
  heading?: string;
  embedding: number[];
  ownerId: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  tags: string[];
  starred?: boolean;
  isShared?: boolean;
  category?: string;
  updatedAt: string;
  note: Note;
  relevanceScore: number;
  snippet: string;
  matchedChunks: string[];
}

export interface ProcessRAGResponse {
  message: string;
}

// Additional note types needed for collaboration and sharing
export interface NoteWithRelations extends Note {
  collaborations?: Collaboration[];
  shareLinks?: ShareLink[];
  attachments?: Attachment[];
  versions?: NoteVersion[];
}

export interface Collaboration {
  id: string;
  noteId: string;
  userId: string;
  permission: 'READ' | 'WRITE' | 'ADMIN';
  invitedBy: string;
  createdAt: string;
}

export interface ShareLink {
  id: string;
  noteId: string;
  token: string;
  isPublic: boolean;
  expiresAt?: string;
  allowComments: boolean;
  requireAuth: boolean;
  maxViews?: number;
  passwordHash?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  noteId: string;
  filename: string;
  filepath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}