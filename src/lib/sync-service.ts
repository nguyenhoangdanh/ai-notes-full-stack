import { offlineStorage, OfflineNote, OfflineWorkspace, SyncOperation } from './offline-storage'

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime?: Date
  pendingOperations: number
  failedOperations: number
}

export class SyncService {
  private static instance: SyncService
  private syncInProgress = false
  private syncListeners: Set<(status: SyncStatus) => void> = new Set()
  private retryTimeout?: number
  private backendAvailable = false

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnlineStatus(true))
    window.addEventListener('offline', () => this.handleOnlineStatus(false))

    // Check backend availability and start sync if available
    this.checkBackendAvailability().then(available => {
      this.backendAvailable = available
      if (available && navigator.onLine) {
        this.startBackgroundSync()
      }
    })
  }

  // Sync Status Management
  addSyncListener(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getSyncStatus()
    this.syncListeners.forEach(listener => listener(status))
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const syncQueue = await offlineStorage.getSyncQueue()
    const pendingOps = syncQueue.filter(op => op.retryCount < 3)
    const failedOps = syncQueue.filter(op => op.retryCount >= 3)

    return {
      isOnline: navigator.onLine,
      isSyncing: this.syncInProgress,
      lastSyncTime: this.getLastSyncTime(),
      pendingOperations: pendingOps.length,
      failedOperations: failedOps.length
    }
  }

  private getLastSyncTime(): Date | undefined {
    const lastSync = localStorage.getItem('ai-notes-last-sync')
    return lastSync ? new Date(lastSync) : undefined
  }

  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const apiBase = this.getApiBase()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`${apiBase}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.info('Backend not available, running in offline mode:', error)
      return false
    }
  }

  private setLastSyncTime(): void {
    localStorage.setItem('ai-notes-last-sync', new Date().toISOString())
  }

  // Online/Offline Handling
  private handleOnlineStatus(isOnline: boolean): void {
    if (isOnline && !this.syncInProgress) {
      this.startBackgroundSync()
    }
    this.notifyListeners()
  }

  // Background Sync
  private async startBackgroundSync(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return

    // Check if backend is available before attempting sync
    if (!this.backendAvailable) {
      this.backendAvailable = await this.checkBackendAvailability()
      if (!this.backendAvailable) {
        console.info('Backend not available, skipping sync')
        return
      }
    }

    this.syncInProgress = true
    await this.notifyListeners()

    try {
      await this.processSyncQueue()
      await this.syncDataFromServer()
      this.setLastSyncTime()
    } catch (error) {
      console.error('Background sync failed:', error)
      // Mark backend as unavailable on persistent failures
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        this.backendAvailable = false
      }
      this.scheduleRetry()
    } finally {
      this.syncInProgress = false
      await this.notifyListeners()
    }
  }

  // Manual Sync
  async forcSync(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline')
    }

    await this.startBackgroundSync()
  }

  // Process Sync Queue
  private async processSyncQueue(): Promise<void> {
    const syncQueue = await offlineStorage.getSyncQueue()
    const pendingOps = syncQueue.filter(op => op.retryCount < 3)

    for (const operation of pendingOps) {
      try {
        await this.executeOperation(operation)
        await offlineStorage.removeSyncOperation(operation.id)
      } catch (error) {
        console.error(`Sync operation failed:`, error)
        await offlineStorage.incrementRetryCount(operation.id, error?.toString())
      }
    }
  }

  // Execute Individual Operations
  private async executeOperation(operation: SyncOperation): Promise<void> {
    const apiBase = this.getApiBase()

    switch (operation.operation) {
      case 'create':
        await this.handleCreate(apiBase, operation)
        break
      case 'update':
        await this.handleUpdate(apiBase, operation)
        break
      case 'delete':
        await this.handleDelete(apiBase, operation)
        break
    }
  }

  private async handleCreate(apiBase: string, operation: SyncOperation): Promise<void> {
    const endpoint = this.getEndpoint(operation.entityType)
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(operation.data)
    })

    if (!response.ok) {
      throw new Error(`Create failed: ${response.statusText}`)
    }

    const serverData = await response.json()
    await this.updateLocalEntity(operation.entityType, operation.entityId, serverData)
  }

  private async handleUpdate(apiBase: string, operation: SyncOperation): Promise<void> {
    const endpoint = this.getEndpoint(operation.entityType)
    const response = await fetch(`${apiBase}${endpoint}/${operation.entityId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(operation.data)
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Entity doesn't exist on server, create it
        await this.handleCreate(apiBase, operation)
        return
      }
      throw new Error(`Update failed: ${response.statusText}`)
    }

    const serverData = await response.json()
    await this.updateLocalEntity(operation.entityType, operation.entityId, serverData)
  }

  private async handleDelete(apiBase: string, operation: SyncOperation): Promise<void> {
    const endpoint = this.getEndpoint(operation.entityType)
    const response = await fetch(`${apiBase}${endpoint}/${operation.entityId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Delete failed: ${response.statusText}`)
    }

    // Remove from local storage
    if (operation.entityType === 'note') {
      await offlineStorage.deleteNote(operation.entityId)
    }
  }

  // Sync Data from Server
  private async syncDataFromServer(): Promise<void> {
    await Promise.all([
      this.syncNotesFromServer(),
      this.syncWorkspacesFromServer()
    ])
  }

  private async syncNotesFromServer(): Promise<void> {
    try {
      const apiBase = this.getApiBase()
      const response = await fetch(`${apiBase}/notes`, {
        headers: this.getHeaders()
      })

      if (!response.ok) return

      const serverNotes = await response.json()
      
      for (const serverNote of serverNotes) {
        const localNote = await offlineStorage.getNote(serverNote.id)
        
        if (!localNote || new Date(serverNote.updatedAt) > new Date(localNote.updatedAt)) {
          const offlineNote: OfflineNote = {
            ...serverNote,
            syncStatus: 'synced',
            lastSyncedAt: new Date()
          }
          await offlineStorage.saveNote(offlineNote)
        }
      }
    } catch (error) {
      console.error('Failed to sync notes from server:', error)
    }
  }

  private async syncWorkspacesFromServer(): Promise<void> {
    try {
      const apiBase = this.getApiBase()
      const response = await fetch(`${apiBase}/workspaces`, {
        headers: this.getHeaders()
      })

      if (!response.ok) return

      const serverWorkspaces = await response.json()
      
      for (const serverWorkspace of serverWorkspaces) {
        const offlineWorkspace: OfflineWorkspace = {
          ...serverWorkspace,
          syncStatus: 'synced',
          lastSyncedAt: new Date()
        }
        await offlineStorage.saveWorkspace(offlineWorkspace)
      }
    } catch (error) {
      console.error('Failed to sync workspaces from server:', error)
    }
  }

  // Conflict Resolution
  async resolveConflict(noteId: string, resolution: 'local' | 'server' | 'merge'): Promise<void> {
    const localNote = await offlineStorage.getNote(noteId)
    if (!localNote) return

    if (resolution === 'local') {
      // Keep local version, mark for sync
      localNote.syncStatus = 'pending'
      await offlineStorage.saveNote(localNote)
      await offlineStorage.addToSyncQueue('update', 'note', noteId, localNote)
    } else if (resolution === 'server') {
      // Fetch server version
      try {
        const apiBase = this.getApiBase()
        const response = await fetch(`${apiBase}/notes/${noteId}`, {
          headers: this.getHeaders()
        })
        
        if (response.ok) {
          const serverNote = await response.json()
          const updatedNote: OfflineNote = {
            ...serverNote,
            syncStatus: 'synced',
            lastSyncedAt: new Date()
          }
          await offlineStorage.saveNote(updatedNote)
        }
      } catch (error) {
        console.error('Failed to fetch server version:', error)
      }
    } else if (resolution === 'merge') {
      // Implement merge logic (for now, just keep local)
      localNote.syncStatus = 'pending'
      await offlineStorage.saveNote(localNote)
      await offlineStorage.addToSyncQueue('update', 'note', noteId, localNote)
    }
  }

  // Utility Methods
  private getApiBase(): string {
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || 'http://localhost:3001'
  }

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('ai-notes-token') || localStorage.getItem('auth-token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private getEndpoint(entityType: string): string {
    switch (entityType) {
      case 'note': return '/notes'
      case 'workspace': return '/workspaces'
      case 'attachment': return '/attachments'
      default: throw new Error(`Unknown entity type: ${entityType}`)
    }
  }

  private async updateLocalEntity(entityType: string, entityId: string, serverData: any): Promise<void> {
    if (entityType === 'note') {
      const updatedNote: OfflineNote = {
        ...serverData,
        syncStatus: 'synced',
        lastSyncedAt: new Date()
      }
      await offlineStorage.saveNote(updatedNote)
    } else if (entityType === 'workspace') {
      const updatedWorkspace: OfflineWorkspace = {
        ...serverData,
        syncStatus: 'synced',
        lastSyncedAt: new Date()
      }
      await offlineStorage.saveWorkspace(updatedWorkspace)
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
    
    // Exponential backoff: 30s, 1m, 2m, 5m, then every 5m
    const retryDelay = Math.min(30000 * Math.pow(2, this.getRetryCount()), 300000)
    
    this.retryTimeout = setTimeout(() => {
      if (navigator.onLine) {
        this.startBackgroundSync()
      }
    }, retryDelay)
  }

  private getRetryCount(): number {
    const lastRetry = localStorage.getItem('ai-notes-retry-count')
    return lastRetry ? parseInt(lastRetry, 10) : 0
  }
}

export const syncService = SyncService.getInstance()
