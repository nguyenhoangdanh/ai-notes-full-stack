import { getApiClient } from '../lib/api-client'
import type {
  VoiceNote,
  CreateVoiceNoteDto,
  LocationNote,
  CreateLocationNoteDto,
  SyncOperationDto,
  ConflictResolutionDto,
  OfflineSync,
  ExportHistory,
  CreateExportDto,
} from '../types'

export const mobileService = {
  // Voice notes
  async getVoiceNotes(): Promise<VoiceNote[]> {
    return getApiClient().get<VoiceNote[]>('/mobile/voice-notes')
  },

  async createVoiceNote(data: CreateVoiceNoteDto, audioFile: File): Promise<VoiceNote> {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('metadata', JSON.stringify(data))
    
    return getApiClient().post<VoiceNote>('/mobile/voice-notes', { body: formData })
  },

  async getVoiceNoteTranscription(voiceNoteId: string): Promise<{ transcription?: string; status: string }> {
    return getApiClient().get(`/mobile/voice-notes/${voiceNoteId}/transcription`)
  },

  async deleteVoiceNote(voiceNoteId: string): Promise<void> {
    return getApiClient().delete<void>(`/mobile/voice-notes/${voiceNoteId}`)
  },

  // Location notes
  async addLocationToNote(noteId: string, data: CreateLocationNoteDto): Promise<LocationNote> {
    return getApiClient().post<LocationNote>(`/mobile/location/notes/${noteId}`, { body: data })
  },

  async getNoteLocation(noteId: string): Promise<LocationNote> {
    return getApiClient().get<LocationNote>(`/mobile/location/notes/${noteId}`)
  },

  async removeLocationFromNote(noteId: string): Promise<void> {
    return getApiClient().delete<void>(`/mobile/location/notes/${noteId}`)
  },

  // Offline sync
  async getPendingSyncOperations(): Promise<OfflineSync[]> {
    return getApiClient().get<OfflineSync[]>('/mobile/sync/pending')
  },

  async submitSyncOperations(operations: SyncOperationDto): Promise<{ processed: number; conflicts: any[] }> {
    return getApiClient().post('/mobile/sync/operations', { body: operations })
  },

  async resolveSyncConflicts(resolutions: ConflictResolutionDto[]): Promise<{ resolved: number }> {
    return getApiClient().post('/mobile/sync/resolve-conflicts', { body: { resolutions } })
  },

  // Export functionality
  async getExportHistory(): Promise<ExportHistory[]> {
    return getApiClient().get<ExportHistory[]>('/export/history')
  },

  async createExport(data: CreateExportDto): Promise<ExportHistory> {
    return getApiClient().post<ExportHistory>('/export/notes', { body: data })
  },

  async downloadExport(exportId: string): Promise<Blob> {
    return getApiClient().get<Blob>(`/export/${exportId}/download`)
  },

  async deleteExport(exportId: string): Promise<void> {
    return getApiClient().delete<void>(`/export/${exportId}`)
  },
}