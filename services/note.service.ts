/**
 * Notes API Service
 */

import { apiClient } from '../lib/api-client';
import { demoModeService } from './demo.service';
import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  SearchNotesDto, 
  NoteWithAnalytics,
  NoteVersion,
  ProcessRAGResponse,
  SearchResult
} from '../types/note.types';

export const noteService = {
  /**
   * Get all notes for user
   */
  async getAll(workspaceId?: string, limit?: number): Promise<Note[]> {
    if (demoModeService.isDemoMode()) {
      const notes = demoModeService.getDemoNotes();
      return limit ? notes.slice(0, limit) : notes;
    }
    return apiClient.get<Note[]>('/notes', { 
      query: { workspaceId, limit } 
    });
  },

  /**
   * Search notes by query
   */
  async search(params: SearchNotesDto): Promise<SearchResult[]> {
    if (demoModeService.isDemoMode()) {
      const notes = demoModeService.searchDemoNotes(params.q || '');
      return notes.map(note => ({
        note,
        relevanceScore: 1.0,
        snippet: note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''),
        matchedChunks: []
      }));
    }
    return apiClient.get<SearchResult[]>('/notes/search', { query: params });
  },

  /**
   * Get note by ID
   */
  async getById(id: string): Promise<Note> {
    if (demoModeService.isDemoMode()) {
      const notes = demoModeService.getDemoNotes();
      const note = notes.find(n => n.id === id);
      if (!note) {
        throw new Error('Note not found');
      }
      return note;
    }
    return apiClient.get<Note>(`/notes/${id}`);
  },

  /**
   * Get note with analytics
   */
  async getWithAnalytics(id: string): Promise<NoteWithAnalytics> {
    if (demoModeService.isDemoMode()) {
      const note = await this.getById(id);
      return {
        ...note,
        analytics: {
          id: 'demo-analytics-' + id,
          noteId: id,
          viewCount: Math.floor(Math.random() * 50) + 1,
          editCount: Math.floor(Math.random() * 10) + 1,
          shareCount: Math.floor(Math.random() * 3),
          lastViewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastEdited: note.updatedAt,
          readingTime: Math.floor(note.content.length / 200), // Rough estimate
          wordCount: note.content.split(' ').length,
          updatedAt: new Date().toISOString()
        }
      };
    }
    return apiClient.get<NoteWithAnalytics>(`/notes/${id}/analytics`);
  },

  /**
   * Create new note
   */
  async create(data: CreateNoteDto): Promise<Note> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.createDemoNote(data);
    }
    return apiClient.post<Note>('/notes', { body: data });
  },

  /**
   * Update note
   */
  async update(id: string, data: UpdateNoteDto): Promise<Note> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.updateDemoNote(id, data);
    }
    return apiClient.patch<Note>(`/notes/${id}`, { body: data });
  },

  /**
   * Delete note
   */
  async delete(id: string): Promise<void> {
    if (demoModeService.isDemoMode()) {
      return demoModeService.deleteDemoNote(id);
    }
    return apiClient.delete<void>(`/notes/${id}`);
  },

  /**
   * Process note for RAG (vector embeddings)
   */
  async processForRAG(id: string): Promise<ProcessRAGResponse> {
    return apiClient.post<ProcessRAGResponse>(`/notes/${id}/process-rag`);
  },

  /**
   * Get note versions
   */
  async getVersions(id: string): Promise<NoteVersion[]> {
    return apiClient.get<NoteVersion[]>(`/notes/${id}/versions`);
  },

  /**
   * Restore note version
   */
  async restoreVersion(id: string, version: number): Promise<Note> {
    return apiClient.post<Note>(`/notes/${id}/restore/${version}`);
  },

  /**
   * Get all notes (alias for getAll)
   */
  async getNotes(workspaceId?: string, limit?: number): Promise<Note[]> {
    return this.getAll(workspaceId, limit);
  },

  /**
   * Get note by ID (alias for getById)
   */
  async getNote(id: string): Promise<Note> {
    return this.getById(id);
  },

  /**
   * Search notes (alias for search)
   */
  async searchNotes(params: SearchNotesDto): Promise<SearchResult[]> {
    return this.search(params);
  },

  /**
   * Get note versions (alias for getVersions)
   */
  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return this.getVersions(noteId);
  },

  /**
   * Get version by ID
   */
  async getVersion(versionId: string): Promise<NoteVersion> {
    return apiClient.get<NoteVersion>(`/notes/versions/${versionId}`);
  },

  /**
   * Create note (alias for create)
   */
  async createNote(data: CreateNoteDto): Promise<Note> {
    return this.create(data);
  },

  /**
   * Update note (alias for update)
   */
  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    return this.update(id, data);
  },

  /**
   * Delete note (alias for delete)
   */
  async deleteNote(id: string): Promise<void> {
    return this.delete(id);
  },

  /**
   * Create note version
   */
  async createVersion(noteId: string, changeLog?: string): Promise<NoteVersion> {
    return apiClient.post<NoteVersion>(`/notes/${noteId}/versions`, {
      body: { changeLog }
    });
  },

  /**
   * Get note collaborators
   */
  async getCollaborators(noteId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/notes/${noteId}/collaborators`);
  },

  /**
   * Invite collaborator
   */
  async inviteCollaborator(noteId: string, email: string, permission: string): Promise<any> {
    return apiClient.post(`/notes/${noteId}/collaborators`, {
      body: { email, permission }
    });
  },

  /**
   * Update collaborator permission
   */
  async updateCollaboratorPermission(collaborationId: string, permission: string): Promise<any> {
    return apiClient.patch(`/notes/collaborators/${collaborationId}`, {
      body: { permission }
    });
  },

  /**
   * Remove collaborator
   */
  async removeCollaborator(collaborationId: string): Promise<void> {
    return apiClient.delete(`/notes/collaborators/${collaborationId}`);
  },

  /**
   * Get share links for note
   */
  async getShareLinks(noteId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/notes/${noteId}/share-links`);
  },

  /**
   * Create share link
   */
  async createShareLink(noteId: string, options: any): Promise<any> {
    return apiClient.post(`/notes/${noteId}/share-links`, {
      body: options
    });
  },

  /**
   * Get note attachments
   */
  async getAttachments(noteId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/notes/${noteId}/attachments`);
  },

  /**
   * Upload attachment
   */
  async uploadAttachment(noteId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`/notes/${noteId}/attachments`, {
      body: formData
    });
  }
};