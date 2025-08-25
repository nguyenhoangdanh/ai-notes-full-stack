/**
 * Notes API Service
 */

import { apiClient } from '../lib/api-client';
import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  SearchNotesDto,
  SearchResult
} from '../types/note.types';

export const noteService = {
  /**
   * Get all notes for user
   */
  async getAll(workspaceId?: string, limit?: number): Promise<Note[]> {
    return await apiClient.get<Note[]>('/notes', { 
      query: { workspaceId, limit } 
    });
  },

  /**
   * Search notes by query
   */
  async search(params: SearchNotesDto): Promise<SearchResult[]> {
    return await apiClient.get<SearchResult[]>('/notes/search', { query: params });
  },

  /**
   * Get note by ID
   */
  async getById(id: string): Promise<Note> {
    return await apiClient.get<Note>(`/notes/${id}`);
  },

  /**
   * Create new note
   */
  async create(data: CreateNoteDto): Promise<Note> {
    return await apiClient.post<Note>('/notes', { body: data });
  },

  /**
   * Update note
   */
  async update(id: string, data: UpdateNoteDto): Promise<Note> {
    return await apiClient.patch<Note>(`/notes/${id}`, { body: data });
  },

  /**
   * Delete note
   */
  async delete(id: string): Promise<void> {
    return await apiClient.delete<void>(`/notes/${id}`);
  },

  /**
   * Process note for RAG (vector embeddings)
   */
  async processRAG(id: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`/notes/${id}/process-rag`);
  },

  // Aliases for compatibility
  async getNotes(workspaceId?: string, limit?: number): Promise<Note[]> {
    return this.getAll(workspaceId, limit);
  },

  async getNote(id: string): Promise<Note> {
    return this.getById(id);
  },

  async searchNotes(params: SearchNotesDto): Promise<SearchResult[]> {
    return this.search(params);
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    return this.create(data);
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    return this.update(id, data);
  },

  async deleteNote(id: string): Promise<void> {
    return this.delete(id);
  },

  async processForRAG(id: string): Promise<{ message: string }> {
    return this.processRAG(id);
  },

  /**
   * Get note versions/history
   */
  async getNoteVersions(noteId: string): Promise<any[]> {
    const response = await apiClient.get<any>(`/versions/notes/${noteId}/history`);
    return response.versions || [];
  },

  /**
   * Get specific version
   */
  async getVersion(versionId: string): Promise<any> {
    const response = await apiClient.get<any>(`/versions/${versionId}`);
    return response.version;
  },

  /**
   * Create note version
   */
  async createVersion(noteId: string, data?: { changeLog?: string; changeType?: string }): Promise<any> {
    return await apiClient.post<any>(`/versions/notes/${noteId}/create`, { body: data });
  },

  /**
   * Restore note version
   */
  async restoreVersion(versionId: string): Promise<any> {
    return await apiClient.post<any>(`/versions/${versionId}/restore`);
  },

  /**
   * Get note collaborators
   */
  async getCollaborators(noteId: string): Promise<any[]> {
    return await apiClient.get<any[]>(`/collaboration/notes/${noteId}`);
  },

  /**
   * Get note share links
   */
  async getShareLinks(noteId: string): Promise<any[]> {
    return await apiClient.get<any[]>(`/share/notes/${noteId}/links`);
  },

  /**
   * Get note attachments
   */
  async getAttachments(noteId: string): Promise<any[]> {
    return await apiClient.get<any[]>(`/attachments/notes/${noteId}`);
  },

  /**
   * Invite collaborator
   */
  async inviteCollaborator(noteId: string, email: string, permission: string): Promise<any> {
    return await apiClient.post<any>(`/collaboration/notes/${noteId}/invite`, { 
      body: { email, permission } 
    });
  },

  /**
   * Update collaborator permission
   */
  async updateCollaboratorPermission(collaborationId: string, permission: string): Promise<any> {
    return await apiClient.patch<any>(`/collaboration/${collaborationId}/permission`, { 
      body: { permission } 
    });
  },

  /**
   * Remove collaborator
   */
  async removeCollaborator(collaborationId: string): Promise<void> {
    return await apiClient.delete<void>(`/collaboration/${collaborationId}`);
  },

  /**
   * Create share link
   */
  async createShareLink(noteId: string, options: any): Promise<any> {
    return await apiClient.post<any>(`/share/notes/${noteId}/create`, { body: options });
  },

  /**
   * Upload attachment
   */
  async uploadAttachment(noteId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post<any>(`/attachments/notes/${noteId}/upload`, { body: formData });
  }
};