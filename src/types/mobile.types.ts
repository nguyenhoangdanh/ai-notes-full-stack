import { BaseEntity } from './common.types'

// Mobile-specific features
export interface VoiceNote extends BaseEntity {
  noteId?: string
  userId: string
  filename: string
  filepath: string
  duration: number // in seconds
  transcription?: string
  language?: string
  quality?: number // Transcription quality score
  status: TranscriptionStatus
  processedAt?: string
}

export enum TranscriptionStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface LocationNote extends BaseEntity {
  noteId: string
  userId: string
  latitude: number
  longitude: number
  address?: string
  placeName?: string
  accuracy?: number // GPS accuracy in meters
}

export interface OfflineSync extends BaseEntity {
  userId: string
  deviceId: string
  noteId: string
  action: SyncAction
  data: Record<string, any>
  timestamp: string
  synced: boolean
  syncedAt?: string
  conflictId?: string
}

export enum SyncAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

// DTOs for mobile features
export interface CreateVoiceNoteDto {
  noteId?: string
  filename: string
  filepath: string
  duration: number
  language?: string
}

export interface CreateLocationNoteDto {
  noteId: string
  latitude: number
  longitude: number
  address?: string
  placeName?: string
  accuracy?: number
}

export interface SyncOperationDto {
  deviceId: string
  operations: {
    noteId: string
    action: SyncAction
    data: Record<string, any>
    timestamp: string
  }[]
}

export interface ConflictResolutionDto {
  conflictId: string
  resolution: 'local' | 'remote' | 'merge'
  mergedData?: Record<string, any>
}

// Export features
export interface ExportHistory extends BaseEntity {
  userId: string
  type: ExportType
  format: ExportFormat
  noteIds: string[]
  filename: string
  fileSize?: number
  settings?: Record<string, any>
  status: ExportStatus
  downloadUrl?: string
  expiresAt?: string
  completedAt?: string
}

export enum ExportType {
  SINGLE_NOTE = 'SINGLE_NOTE',
  MULTIPLE_NOTES = 'MULTIPLE_NOTES',
  WORKSPACE = 'WORKSPACE',
  FULL_BACKUP = 'FULL_BACKUP'
}

export enum ExportFormat {
  MARKDOWN = 'MARKDOWN',
  PDF = 'PDF',
  EPUB = 'EPUB',
  HTML = 'HTML',
  DOCX = 'DOCX',
  NOTION = 'NOTION',
  OBSIDIAN = 'OBSIDIAN'
}

export enum ExportStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface CreateExportDto {
  type: ExportType
  format: ExportFormat
  noteIds?: string[]
  workspaceId?: string
  settings?: Record<string, any>
}