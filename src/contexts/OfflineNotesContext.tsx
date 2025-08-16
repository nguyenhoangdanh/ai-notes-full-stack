import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { offlineStorage, OfflineNote, OfflineWorkspace } from '@/lib/offline-storage'
import { syncService, SyncStatus } from '@/lib/sync-service'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface OfflineNotesContextType {
  // Notes
  notes: OfflineNote[]
  currentNote: OfflineNote | null
  
  // Workspaces
  workspaces: OfflineWorkspace[]
  currentWorkspace: OfflineWorkspace | null
  
  // Loading states
  isLoading: boolean
  
  // Sync status
  syncStatus: SyncStatus
  
  // Note operations
  createNote: (title: string, content?: string) => Promise<OfflineNote>
  updateNote: (id: string, updates: Partial<OfflineNote>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  duplicateNote: (id: string) => Promise<OfflineNote>
  
  // Note selection
  selectNote: (note: OfflineNote | null) => void
  
  // Workspace operations
  createWorkspace: (name: string) => Promise<OfflineWorkspace>
  selectWorkspace: (workspace: OfflineWorkspace) => void
  
  // Search
  searchNotes: (query: string) => Promise<OfflineNote[]>
  
  // Sync operations
  forceSync: () => Promise<void>
  resolveConflict: (noteId: string, resolution: 'local' | 'server' | 'merge') => Promise<void>
  
  // Export/Import
  exportNotes: () => Promise<string>
  importNotes: (data: string) => Promise<void>
}

const OfflineNotesContext = createContext<OfflineNotesContextType | undefined>(undefined)

export function OfflineNotesProvider({ children }: { children: React.ReactNode }) {
  // For now, use a mock user ID. In production, this would come from AuthContext
  const userId = 'mock-user-1'
  const [notes, setNotes] = useState<OfflineNote[]>([])
  const [workspaces, setWorkspaces] = useState<OfflineWorkspace[]>([])
  const [currentNote, setCurrentNote] = useState<OfflineNote | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<OfflineWorkspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: 0,
    failedOperations: 0
  })

  // Initialize data on mount
  useEffect(() => {
    initializeData()
  }, [userId])

  // Setup sync listener
  useEffect(() => {
    const unsubscribe = syncService.addSyncListener(setSyncStatus)
    return unsubscribe
  }, [])

  const initializeData = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      
      // Load workspaces
      const userWorkspaces = await offlineStorage.getWorkspaces(userId)
      setWorkspaces(userWorkspaces)
      
      // Set default workspace
      let defaultWorkspace = await offlineStorage.getDefaultWorkspace(userId)
      if (!defaultWorkspace && userWorkspaces.length === 0) {
        defaultWorkspace = await createDefaultWorkspace(userId)
      } else if (!defaultWorkspace) {
        defaultWorkspace = userWorkspaces[0]
      }
      setCurrentWorkspace(defaultWorkspace)
      
      // Load notes for current workspace
      if (defaultWorkspace) {
        const workspaceNotes = await offlineStorage.getNotes(defaultWorkspace.id)
        setNotes(workspaceNotes)
      }
      
      // Initialize sync status
      const status = await syncService.getSyncStatus()
      setSyncStatus(status)
      
    } catch (error) {
      console.error('Failed to initialize data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultWorkspace = async (userId: string): Promise<OfflineWorkspace> => {
    const workspace: OfflineWorkspace = {
      id: uuidv4(),
      name: 'My Notes',
      ownerId: userId,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    }
    
    await offlineStorage.saveWorkspace(workspace)
    await offlineStorage.addToSyncQueue('create', 'workspace', workspace.id, workspace)
    
    return workspace
  }

  // Note Operations
  const createNote = useCallback(async (title: string, content = ''): Promise<OfflineNote> => {
    if (!userId || !currentWorkspace) {
      throw new Error('User or workspace not available')
    }

    const note: OfflineNote = {
      id: uuidv4(),
      title: title || 'Untitled',
      content,
      tags: [],
      workspaceId: currentWorkspace.id,
      ownerId: userId,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    }

    try {
      await offlineStorage.saveNote(note)
      await offlineStorage.addToSyncQueue('create', 'note', note.id, note)
      
      setNotes(prev => [note, ...prev])
      
      toast.success('Note created')
      return note
    } catch (error) {
      console.error('Failed to create note:', error)
      toast.error('Failed to create note')
      throw error
    }
  }, [userId, currentWorkspace])

  const updateNote = useCallback(async (id: string, updates: Partial<OfflineNote>): Promise<void> => {
    try {
      const existingNote = await offlineStorage.getNote(id)
      if (!existingNote) {
        throw new Error('Note not found')
      }

      const updatedNote: OfflineNote = {
        ...existingNote,
        ...updates,
        updatedAt: new Date(),
        syncStatus: 'pending'
      }

      await offlineStorage.saveNote(updatedNote)
      await offlineStorage.addToSyncQueue('update', 'note', id, updatedNote)
      
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
      
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote)
      }
      
    } catch (error) {
      console.error('Failed to update note:', error)
      toast.error('Failed to update note')
      throw error
    }
  }, [currentNote])

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      await offlineStorage.deleteNote(id)
      await offlineStorage.addToSyncQueue('delete', 'note', id, { id })
      
      setNotes(prev => prev.filter(note => note.id !== id))
      
      if (currentNote?.id === id) {
        setCurrentNote(null)
      }
      
      toast.success('Note deleted')
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note')
      throw error
    }
  }, [currentNote])

  const duplicateNote = useCallback(async (id: string): Promise<OfflineNote> => {
    const originalNote = await offlineStorage.getNote(id)
    if (!originalNote) {
      throw new Error('Note not found')
    }

    const duplicatedNote = await createNote(
      `${originalNote.title} (Copy)`,
      originalNote.content
    )

    return duplicatedNote
  }, [createNote])

  // Workspace Operations
  const createWorkspace = useCallback(async (name: string): Promise<OfflineWorkspace> => {
    if (!userId) {
      throw new Error('User not available')
    }

    const workspace: OfflineWorkspace = {
      id: uuidv4(),
      name,
      ownerId: userId,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    }

    try {
      await offlineStorage.saveWorkspace(workspace)
      await offlineStorage.addToSyncQueue('create', 'workspace', workspace.id, workspace)
      
      setWorkspaces(prev => [...prev, workspace])
      
      toast.success('Workspace created')
      return workspace
    } catch (error) {
      console.error('Failed to create workspace:', error)
      toast.error('Failed to create workspace')
      throw error
    }
  }, [userId])

  const selectWorkspace = useCallback(async (workspace: OfflineWorkspace) => {
    setCurrentWorkspace(workspace)
    setCurrentNote(null)
    
    try {
      const workspaceNotes = await offlineStorage.getNotes(workspace.id)
      setNotes(workspaceNotes)
    } catch (error) {
      console.error('Failed to load workspace notes:', error)
      toast.error('Failed to load workspace notes')
    }
  }, [])

  // Search
  const searchNotes = useCallback(async (query: string): Promise<OfflineNote[]> => {
    try {
      const results = await offlineStorage.searchNotes(query, currentWorkspace?.id)
      return results
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }, [currentWorkspace])

  // Note Selection
  const selectNote = useCallback((note: OfflineNote | null) => {
    setCurrentNote(note)
  }, [])

  // Sync Operations
  const forceSync = useCallback(async (): Promise<void> => {
    try {
      await syncService.forcSync()
      toast.success('Sync completed')
      
      // Reload data after sync
      await initializeData()
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Sync failed')
    }
  }, [])

  const resolveConflict = useCallback(async (noteId: string, resolution: 'local' | 'server' | 'merge'): Promise<void> => {
    try {
      await syncService.resolveConflict(noteId, resolution)
      toast.success('Conflict resolved')
      
      // Reload the note
      const updatedNote = await offlineStorage.getNote(noteId)
      if (updatedNote) {
        setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note))
        if (currentNote?.id === noteId) {
          setCurrentNote(updatedNote)
        }
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      toast.error('Failed to resolve conflict')
    }
  }, [currentNote])

  // Export/Import
  const exportNotes = useCallback(async (): Promise<string> => {
    try {
      const data = await offlineStorage.exportData()
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }, [])

  const importNotes = useCallback(async (data: string): Promise<void> => {
    try {
      const parsedData = JSON.parse(data)
      
      // Import notes
      for (const note of parsedData.notes || []) {
        if (note.ownerId === user?.id) {
          note.syncStatus = 'pending'
          await offlineStorage.saveNote(note)
          await offlineStorage.addToSyncQueue('create', 'note', note.id, note)
        }
      }
      
      // Reload data
      await initializeData()
      toast.success('Notes imported successfully')
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import notes')
      throw error
    }
  }, [user])

  const value: OfflineNotesContextType = {
    notes,
    currentNote,
    workspaces,
    currentWorkspace,
    isLoading,
    syncStatus,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    selectNote,
    createWorkspace,
    selectWorkspace,
    searchNotes,
    forceSync,
    resolveConflict,
    exportNotes,
    importNotes
  }

  return (
    <OfflineNotesContext.Provider value={value}>
      {children}
    </OfflineNotesContext.Provider>
  )
}

export function useOfflineNotes() {
  const context = useContext(OfflineNotesContext)
  if (context === undefined) {
    throw new Error('useOfflineNotes must be used within an OfflineNotesProvider')
  }
  return context
}