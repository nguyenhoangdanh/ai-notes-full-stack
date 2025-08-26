import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { offlineStorage, OfflineNote, OfflineWorkspace } from '@/lib/offline-storage'
import { syncService, SyncStatus } from '@/lib/sync-service'
import { useAuthStore } from './auth.store'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface OfflineNotesState {
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
  
  // Actions
  setNotes: (notes: OfflineNote[]) => void
  setCurrentNote: (note: OfflineNote | null) => void
  setWorkspaces: (workspaces: OfflineWorkspace[]) => void
  setCurrentWorkspace: (workspace: OfflineWorkspace | null) => void
  setLoading: (loading: boolean) => void
  setSyncStatus: (status: SyncStatus) => void
  
  // Note operations
  createNote: (title: string, content?: string) => Promise<OfflineNote>
  updateNote: (id: string, updates: Partial<OfflineNote>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  duplicateNote: (id: string) => Promise<OfflineNote>
  
  // Workspace operations
  createWorkspace: (name: string) => Promise<OfflineWorkspace>
  
  // Search
  searchNotes: (query: string) => Promise<OfflineNote[]>
  
  // Sync operations
  forceSync: () => Promise<void>
  resolveConflict: (noteId: string, resolution: 'local' | 'server' | 'merge') => Promise<void>
  
  // Export/Import
  exportNotes: () => Promise<string>
  importNotes: (data: string) => Promise<void>
  
  // Initialization
  initialize: () => Promise<void>
}

export const useOfflineNotesStore = create<OfflineNotesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        notes: [],
        currentNote: null,
        workspaces: [],
        currentWorkspace: null,
        isLoading: false,
        syncStatus: {
          isOnline: navigator?.onLine ?? true,
          // isOnline: window.navigator?.onLine ?? true,
          isSyncing: false,
          pendingOperations: 0,
          failedOperations: 0
        },

        // Basic setters
        setNotes: (notes: OfflineNote[]) => set({ notes }),
        setCurrentNote: (note: OfflineNote | null) => set({ currentNote: note }),
        setWorkspaces: (workspaces: OfflineWorkspace[]) => set({ workspaces }),
        setCurrentWorkspace: (workspace: OfflineWorkspace | null) => set({ currentWorkspace: workspace }),
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        setSyncStatus: (status: SyncStatus) => set({ syncStatus: status }),

        // Note operations
        createNote: async (title: string, content: string = ''): Promise<OfflineNote> => {
          const { currentWorkspace } = get()
          
          const newNote: OfflineNote = {
            id: uuidv4(),
            title,
            content,
            workspaceId: currentWorkspace?.id || 'default',
            ownerId: 'current-user', // TODO: Get from auth store
            tags: [],
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending'
          }

          try {
            await offlineStorage.saveNote(newNote)
            set((state) => ({
              notes: [...state.notes, newNote],
              currentNote: newNote
            }))
            
            // Trigger sync if online
            if (navigator.onLine) {
              get().forceSync()
            }
            
            toast.success('Note created')
            return newNote
          } catch (error) {
            console.error('Failed to create note:', error)
            toast.error('Failed to create note')
            throw error
          }
        },

        updateNote: async (id: string, updates: Partial<OfflineNote>): Promise<void> => {
          try {
            const existingNote = await offlineStorage.getNote(id)
            if (!existingNote) {
              throw new Error('Note not found')
            }

            const updatedNote: OfflineNote = {
              ...existingNote,
              ...updates,
              id,
              updatedAt: new Date(),
              syncStatus: 'pending'
            }

            await offlineStorage.saveNote(updatedNote)
            
            set((state) => ({
              notes: state.notes.map(note => 
                note.id === id ? { ...note, ...updatedNote } : note
              ),
              currentNote: state.currentNote?.id === id 
                ? { ...state.currentNote, ...updatedNote }
                : state.currentNote
            }))

            // Trigger sync if online
            if (navigator.onLine) {
              get().forceSync()
            }
          } catch (error) {
            console.error('Failed to update note:', error)
            toast.error('Failed to update note')
            throw error
          }
        },

        deleteNote: async (id: string): Promise<void> => {
          try {
            await offlineStorage.deleteNote(id)
            
            set((state) => ({
              notes: state.notes.filter(note => note.id !== id),
              currentNote: state.currentNote?.id === id ? null : state.currentNote
            }))

            // Trigger sync if online
            if (navigator.onLine) {
              get().forceSync()
            }
            
            toast.success('Note deleted')
          } catch (error) {
            console.error('Failed to delete note:', error)
            toast.error('Failed to delete note')
            throw error
          }
        },

        duplicateNote: async (id: string): Promise<OfflineNote> => {
          const { notes } = get()
          const originalNote = notes.find(note => note.id === id)
          
          if (!originalNote) {
            throw new Error('Note not found')
          }

          const duplicatedNote: OfflineNote = {
            ...originalNote,
            id: uuidv4(),
            title: `${originalNote.title} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending'
          }

          try {
            await offlineStorage.saveNote(duplicatedNote)
            set((state) => ({
              notes: [...state.notes, duplicatedNote],
              currentNote: duplicatedNote
            }))
            
            toast.success('Note duplicated')
            return duplicatedNote
          } catch (error) {
            console.error('Failed to duplicate note:', error)
            toast.error('Failed to duplicate note')
            throw error
          }
        },

        createWorkspace: async (name: string): Promise<OfflineWorkspace> => {
          const newWorkspace: OfflineWorkspace = {
            id: uuidv4(),
            name,
            ownerId: 'current-user', // TODO: Get from auth store
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending'
          }

          try {
            await offlineStorage.saveWorkspace(newWorkspace)
            set((state) => ({
              workspaces: [...state.workspaces, newWorkspace],
              currentWorkspace: newWorkspace
            }))
            
            toast.success('Workspace created')
            return newWorkspace
          } catch (error) {
            console.error('Failed to create workspace:', error)
            toast.error('Failed to create workspace')
            throw error
          }
        },

        searchNotes: async (query: string): Promise<OfflineNote[]> => {
          const { notes } = get()
          
          if (!query.trim()) {
            return notes
          }

          const searchTerm = query.toLowerCase()
          return notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          )
        },

        forceSync: async (): Promise<void> => {
          const { isAuthenticated } = useAuthStore.getState()
          
          if (!isAuthenticated || !navigator.onLine) {
            return
          }

          try {
            set({ 
              syncStatus: {
                isOnline: true,
                isSyncing: true,
                pendingOperations: 0,
                failedOperations: 0
              }
            })
            await syncService.forcSync()
            
            // Reload data after sync
            const notes = await offlineStorage.getNotes()
            const workspaces = await offlineStorage.getWorkspaces('current-user')
            
            set({ 
              notes, 
              workspaces, 
              syncStatus: {
                isOnline: true,
                isSyncing: false,
                lastSyncTime: new Date(),
                pendingOperations: 0,
                failedOperations: 0
              }
            })
            
            toast.success('Sync completed')
          } catch (error) {
            console.error('Sync failed:', error)
            set({ 
              syncStatus: {
                isOnline: navigator?.onLine ?? true,
                // isOnline: window.navigator?.onLine ?? true,
                isSyncing: false,
                pendingOperations: 0,
                failedOperations: 1
              }
            })
            toast.error('Sync failed')
          }
        },

        resolveConflict: async (noteId: string, resolution: 'local' | 'server' | 'merge'): Promise<void> => {
          try {
            await syncService.resolveConflict(noteId, resolution)
            
            // Reload notes after conflict resolution
            const notes = await offlineStorage.getNotes()
            set({ notes })
            
            toast.success('Conflict resolved')
          } catch (error) {
            console.error('Failed to resolve conflict:', error)
            toast.error('Failed to resolve conflict')
            throw error
          }
        },

        exportNotes: async (): Promise<string> => {
          const { notes, workspaces } = get()
          
          const exportData = {
            notes,
            workspaces,
            exportedAt: new Date().toISOString(),
            version: '1.0'
          }
          
          return JSON.stringify(exportData, null, 2)
        },

        importNotes: async (data: string): Promise<void> => {
          try {
            const importData = JSON.parse(data)
            
            if (!importData.notes || !Array.isArray(importData.notes)) {
              throw new Error('Invalid import data format')
            }

            // Import notes
            for (const note of importData.notes) {
              await offlineStorage.saveNote({
                ...note,
                id: uuidv4(), // Generate new IDs to avoid conflicts
                ownerId: 'current-user',
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                syncStatus: 'pending'
              })
            }

            // Import workspaces if available
            if (importData.workspaces && Array.isArray(importData.workspaces)) {
              for (const workspace of importData.workspaces) {
                await offlineStorage.saveWorkspace({
                  ...workspace,
                  id: uuidv4(),
                  ownerId: 'current-user',
                  isDefault: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  syncStatus: 'pending'
                })
              }
            }

            // Reload data
            get().initialize()
            
            toast.success(`Imported ${importData.notes.length} notes`)
          } catch (error) {
            console.error('Import failed:', error)
            toast.error('Import failed')
            throw error
          }
        },

        initialize: async (): Promise<void> => {
          try {
            set({ isLoading: true })
            
            const [notes, workspaces] = await Promise.all([
              offlineStorage.getNotes(),
              offlineStorage.getWorkspaces('current-user')
            ])
            
            set({
              notes,
              workspaces,
              currentWorkspace: workspaces[0] || null,
              isLoading: false
            })
          } catch (error) {
            console.error('Failed to initialize offline notes:', error)
            set({ isLoading: false })
          }
        }
      }),
      {
        name: 'offline-notes-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          currentWorkspace: state.currentWorkspace,
          // Don't persist notes and workspaces as they're handled by offlineStorage
        })
      }
    ),
    { name: 'offline-notes-store' }
  )
)

// Convenient hook that provides the same interface as the original context
export const useOfflineNotes = () => {
  const store = useOfflineNotesStore()
  
  return {
    ...store,
    selectNote: store.setCurrentNote,
    selectWorkspace: store.setCurrentWorkspace
  }
}