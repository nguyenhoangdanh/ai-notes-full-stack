import { getApiClient } from '../lib/api-client'
import type {
  Note,
  NoteWithRelations,
  CreateNoteDto,
  UpdateNoteDto,
  SearchNotesDto,
  SearchResult,
  NoteVersion,
  Collaboration,
  Permission,
  ShareLink,
  NoteAnalytics,
  Attachment,
  OCRResult,
} from '../types'

export const noteService = {
  // Basic CRUD operations
  async getNotes(workspaceId?: string, limit?: number): Promise<Note[]> {
    return getApiClient().get<Note[]>('/notes', {
      query: { workspaceId, limit }
    })
  },

  async getNote(id: string): Promise<NoteWithRelations> {
    return getApiClient().get<NoteWithRelations>(`/notes/${id}`)
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    return getApiClient().post<Note>('/notes', { body: data })
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    return getApiClient().patch<Note>(`/notes/${id}`, { body: data })
  },

  async deleteNote(id: string): Promise<void> {
    return getApiClient().delete<void>(`/notes/${id}`)
  },

  // Search functionality
  async searchNotes(params: SearchNotesDto): Promise<SearchResult[]> {
    return getApiClient().get<SearchResult[]>('/notes/search', { query: params })
  },

  // RAG processing
  async processForRAG(id: string): Promise<{ message: string }> {
    return getApiClient().post<{ message: string }>(`/notes/${id}/process-rag`)
  },

  // Version control
  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return getApiClient().get<NoteVersion[]>(`/versions/notes/${noteId}`)
  },

  async createVersion(noteId: string, changeLog?: string): Promise<NoteVersion> {
    return getApiClient().post<NoteVersion>(`/versions/notes/${noteId}`, {
      body: { changeLog }
    })
  },

  async getVersion(versionId: string): Promise<NoteVersion> {
    return getApiClient().get<NoteVersion>(`/versions/${versionId}`)
  },

  async restoreVersion(versionId: string): Promise<Note> {
    return getApiClient().post<Note>(`/versions/${versionId}/restore`)
  },

  // Collaboration
  async getCollaborators(noteId: string): Promise<Collaboration[]> {
    return getApiClient().get<Collaboration[]>(`/collaboration/notes/${noteId}`)
  },

  async inviteCollaborator(noteId: string, email: string, permission: Permission): Promise<Collaboration> {
    return getApiClient().post<Collaboration>(`/collaboration/notes/${noteId}/invite`, {
      body: { email, permission }
    })
  },

  async updateCollaboratorPermission(collaborationId: string, permission: Permission): Promise<Collaboration> {
    return getApiClient().patch<Collaboration>(`/collaboration/${collaborationId}`, {
      body: { permission }
    })
  },

  async removeCollaborator(collaborationId: string): Promise<void> {
    return getApiClient().delete<void>(`/collaboration/${collaborationId}`)
  },

  // Sharing
  async getShareLinks(noteId: string): Promise<ShareLink[]> {
    return getApiClient().get<ShareLink[]>(`/share/notes/${noteId}/links`)
  },

  async createShareLink(noteId: string, options: {
    isPublic?: boolean
    expiresAt?: string
    allowComments?: boolean
    requireAuth?: boolean
    maxViews?: number
    password?: string
  }): Promise<ShareLink> {
    return getApiClient().post<ShareLink>(`/share/notes/${noteId}/links`, {
      body: options
    })
  },

  async updateShareLink(linkId: string, options: Partial<ShareLink>): Promise<ShareLink> {
    return getApiClient().patch<ShareLink>(`/share/links/${linkId}`, {
      body: options
    })
  },

  async deleteShareLink(linkId: string): Promise<void> {
    return getApiClient().delete<void>(`/share/links/${linkId}`)
  },

  async getSharedNote(token: string, password?: string): Promise<Note> {
    return getApiClient().get<Note>(`/share/${token}`, {
      headers: password ? { 'X-Share-Password': password } : undefined
    })
  },

  // Analytics
  async getNoteAnalytics(noteId: string): Promise<NoteAnalytics> {
    return getApiClient().get<NoteAnalytics>(`/analytics/notes/${noteId}`)
  },

  // Attachments
  async getAttachments(noteId: string): Promise<Attachment[]> {
    return getApiClient().get<Attachment[]>(`/attachments/notes/${noteId}`)
  },

  async uploadAttachment(noteId: string, file: File): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    
    return getApiClient().post<Attachment>(`/attachments/notes/${noteId}`, {
      body: formData
    })
  },

  async downloadAttachment(attachmentId: string): Promise<Blob> {
    return getApiClient().get<Blob>(`/attachments/${attachmentId}`)
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    return getApiClient().delete<void>(`/attachments/${attachmentId}`)
  },

  async getOCRResult(attachmentId: string): Promise<OCRResult> {
    return getApiClient().get<OCRResult>(`/attachments/${attachmentId}/ocr`)
  },
}