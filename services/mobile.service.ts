import { apiClient } from '../lib/api-client'
import type {
  VoiceNote,
  CreateVoiceNoteDto,
  LocationNote,
  CreateLocationNoteDto,
  SyncOperationDto,
  ConflictResolutionDto,
  OfflineSync,
  ExportHistory,
  AdvancedCreateExportDto as CreateExportDto,
} from '../types'

export const mobileService = {
  // Voice notes
  async getVoiceNotes(): Promise<VoiceNote[]> {
    return apiClient.get<VoiceNote[]>('/mobile/voice-notes')
  },

  async createVoiceNote(data: CreateVoiceNoteDto, audioFile: File): Promise<VoiceNote> {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('metadata', JSON.stringify(data))
    
    return apiClient.post<VoiceNote>('/mobile/voice-notes', { body: formData })
  },

  async getVoiceNoteTranscription(voiceNoteId: string): Promise<{ transcription?: string; status: string }> {
    return apiClient.get(`/mobile/voice-notes/${voiceNoteId}/transcription`)
  },

  async deleteVoiceNote(voiceNoteId: string): Promise<void> {
    return apiClient.delete<void>(`/mobile/voice-notes/${voiceNoteId}`)
  },

  // Location notes
  async addLocationToNote(noteId: string, data: CreateLocationNoteDto): Promise<LocationNote> {
    return apiClient.post<LocationNote>(`/mobile/location/notes/${noteId}`, { body: data })
  },

  async getNoteLocation(noteId: string): Promise<LocationNote> {
    return apiClient.get<LocationNote>(`/mobile/location/notes/${noteId}`)
  },

  async removeLocationFromNote(noteId: string): Promise<void> {
    return apiClient.delete<void>(`/mobile/location/notes/${noteId}`)
  },

  // Offline sync
  async getPendingSyncOperations(): Promise<OfflineSync[]> {
    return apiClient.get<OfflineSync[]>('/mobile/sync/pending')
  },

  async submitSyncOperations(operations: SyncOperationDto): Promise<{ processed: number; conflicts: any[] }> {
    return apiClient.post('/mobile/sync/operations', { body: operations })
  },

  async resolveSyncConflicts(resolutions: ConflictResolutionDto[]): Promise<{ resolved: number }> {
    return apiClient.post('/mobile/sync/resolve-conflicts', { body: { resolutions } })
  },

  // Export functionality
  async getExportHistory(): Promise<ExportHistory[]> {
    return apiClient.get<ExportHistory[]>('/export/history')
  },

  async createExport(data: CreateExportDto): Promise<ExportHistory> {
    return apiClient.post<ExportHistory>('/export/notes', { body: data })
  },

  async downloadExport(exportId: string): Promise<Blob> {
    return apiClient.get<Blob>(`/export/${exportId}/download`)
  },

  async deleteExport(exportId: string): Promise<void> {
    return apiClient.delete<void>(`/export/${exportId}`)
  },
}