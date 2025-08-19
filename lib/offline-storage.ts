import Dexie, { Table } from 'dexie'

// Types for offline storage
export interface OfflineNote {
  id: string
  title: string
  content: string
  tags: string[]
  workspaceId: string
  ownerId: string
  isDeleted: boolean
  starred?: boolean
  createdAt: Date
  updatedAt: Date
  lastSyncedAt?: Date
  syncStatus: 'synced' | 'pending' | 'conflict'
  localChanges?: any
}

export interface OfflineWorkspace {
  id: string
  name: string
  ownerId: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  lastSyncedAt?: Date
  syncStatus: 'synced' | 'pending'
}

export interface SyncOperation {
  id: string
  operation: 'create' | 'update' | 'delete'
  entityType: 'note' | 'workspace' | 'attachment'
  entityId: string
  data: any
  timestamp: Date
  retryCount: number
  error?: string
}

export interface CachedAttachment {
  id: string
  noteId: string
  filename: string
  fileType: string
  fileSize: number
  blob: Blob
  uploadedAt: Date
  syncStatus: 'synced' | 'pending'
}

export interface VoiceRecording {
  id: string
  noteId?: string
  filename: string
  blob: Blob
  duration: number
  transcription?: string
  createdAt: Date
  syncStatus: 'synced' | 'pending'
}

export interface AppSettings {
  id: string
  userId: string
  model: string
  maxTokens: number
  autoReembed: boolean
  offlineMode: boolean
  syncOnWifi: boolean
  voiceLanguage: string
  theme: 'light' | 'dark' | 'system'
  updatedAt: Date
}

// IndexedDB Schema
class AINotesDB extends Dexie {
  notes!: Table<OfflineNote>
  workspaces!: Table<OfflineWorkspace>
  syncQueue!: Table<SyncOperation>
  attachments!: Table<CachedAttachment>
  voiceRecordings!: Table<VoiceRecording>
  settings!: Table<AppSettings>

  constructor() {
    super('AINotesDB')
    
    this.version(1).stores({
      notes: 'id, title, workspaceId, ownerId, createdAt, updatedAt, syncStatus',
      workspaces: 'id, ownerId, isDefault, syncStatus',
      syncQueue: 'id, operation, entityType, entityId, timestamp, retryCount',
      attachments: 'id, noteId, syncStatus',
      voiceRecordings: 'id, noteId, createdAt, syncStatus',
      settings: 'id, userId'
    })
  }
}

export const db = new AINotesDB()

// Storage Service
export class OfflineStorageService {
  private static instance: OfflineStorageService
  
  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService()
    }
    return OfflineStorageService.instance
  }

  // Notes Operations
  async saveNote(note: OfflineNote): Promise<void> {
    await db.notes.put(note)
  }

  async getNote(id: string): Promise<OfflineNote | undefined> {
    return await db.notes.get(id)
  }

  async getNotes(workspaceId?: string): Promise<OfflineNote[]> {
    let collection = db.notes.where('isDeleted').equals(0)
    
    if (workspaceId) {
      collection = collection.and(note => note.workspaceId === workspaceId)
    }
    
    return await collection.toArray()
  }

  async deleteNote(id: string): Promise<void> {
    const note = await this.getNote(id)
    if (note) {
      note.isDeleted = true
      note.updatedAt = new Date()
      note.syncStatus = 'pending'
      await this.saveNote(note)
      await this.addToSyncQueue('update', 'note', id, note)
    }
  }

  async searchNotes(query: string, workspaceId?: string): Promise<OfflineNote[]> {
    const notes = await this.getNotes(workspaceId)
    const lowerQuery = query.toLowerCase()
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // Workspaces Operations
  async saveWorkspace(workspace: OfflineWorkspace): Promise<void> {
    await db.workspaces.put(workspace)
  }

  async getWorkspaces(ownerId: string): Promise<OfflineWorkspace[]> {
    return await db.workspaces.where('ownerId').equals(ownerId).toArray()
  }

  async getDefaultWorkspace(ownerId: string): Promise<OfflineWorkspace | undefined> {
    return await db.workspaces.where({ ownerId, isDefault: true }).first()
  }

  // Sync Queue Operations
  async addToSyncQueue(operation: SyncOperation['operation'], entityType: SyncOperation['entityType'], entityId: string, data: any): Promise<void> {
    const syncOp: SyncOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      entityType,
      entityId,
      data,
      timestamp: new Date(),
      retryCount: 0
    }
    
    await db.syncQueue.add(syncOp)
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    return await db.syncQueue.orderBy('timestamp').toArray()
  }

  async removeSyncOperation(id: string): Promise<void> {
    await db.syncQueue.delete(id)
  }

  async incrementRetryCount(id: string, error?: string): Promise<void> {
    const operation = await db.syncQueue.get(id)
    if (operation) {
      operation.retryCount++
      operation.error = error
      await db.syncQueue.put(operation)
    }
  }

  // Attachments Operations
  async saveAttachment(attachment: CachedAttachment): Promise<void> {
    await db.attachments.put(attachment)
  }

  async getAttachments(noteId: string): Promise<CachedAttachment[]> {
    return await db.attachments.where('noteId').equals(noteId).toArray()
  }

  // Voice Recordings Operations
  async saveVoiceRecording(recording: VoiceRecording): Promise<void> {
    await db.voiceRecordings.put(recording)
  }

  async getVoiceRecordings(noteId?: string): Promise<VoiceRecording[]> {
    if (noteId) {
      return await db.voiceRecordings.where('noteId').equals(noteId).toArray()
    }
    return await db.voiceRecordings.toArray()
  }

  async deleteVoiceRecording(id: string): Promise<void> {
    await db.voiceRecordings.delete(id)
  }

  // Settings Operations
  async saveSettings(settings: AppSettings): Promise<void> {
    await db.settings.put(settings)
  }

  async getSettings(userId: string): Promise<AppSettings | undefined> {
    return await db.settings.where('userId').equals(userId).first()
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    await db.delete()
    await db.open()
  }

  async getStorageUsage(): Promise<{ notes: number; attachments: number; total: number }> {
    const noteCount = await db.notes.count()
    const attachmentCount = await db.attachments.count()
    
    return {
      notes: noteCount,
      attachments: attachmentCount,
      total: noteCount + attachmentCount
    }
  }

  async exportData(): Promise<any> {
    const notes = await db.notes.toArray()
    const workspaces = await db.workspaces.toArray()
    const settings = await db.settings.toArray()
    
    return {
      notes,
      workspaces,
      settings,
      exportedAt: new Date().toISOString()
    }
  }
}

export const offlineStorage = OfflineStorageService.getInstance()