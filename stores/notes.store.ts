import { Note } from '@/types'
import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

interface NotesUIState {
  // Current selection
  selectedNoteId: string | null
  selectedWorkspaceId: string | null
  
  // Search and filters
  searchQuery: string
  searchResults: string[] // Note IDs
  isSearching: boolean
  
  // View state
  showSidebar: boolean
  editorMode: 'edit' | 'preview' | 'split'
  showTags: boolean
  
  // Sorting and display
  sortBy: 'title' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  viewMode: 'list' | 'grid' | 'cards'
  
  // Editor state
  isEditing: boolean
  isDirty: boolean
  
  // Actions
  setSelectedNote: (id: string | null) => void
  setSelectedWorkspace: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: string[]) => void
  setSearching: (searching: boolean) => void
  setShowSidebar: (show: boolean) => void
  setEditorMode: (mode: 'edit' | 'preview' | 'split') => void
  setShowTags: (show: boolean) => void
  setSortBy: (sortBy: 'title' | 'createdAt' | 'updatedAt') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setViewMode: (mode: 'list' | 'grid' | 'cards') => void
  setEditing: (editing: boolean) => void
  setDirty: (dirty: boolean) => void
  
  // Complex actions
  clearSearch: () => void
  resetView: () => void
}

const initialState = {
  selectedNoteId: null,
  selectedWorkspaceId: null,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  showSidebar: true,
  editorMode: 'edit' as const,
  showTags: true,
  sortBy: 'updatedAt' as const,
  sortOrder: 'desc' as const,
  viewMode: 'list' as const,
  isEditing: false,
  isDirty: false,
}

export const useNotesStore = create<NotesUIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Simple setters
        setSelectedNote: (id: string | null) => set({ selectedNoteId: id }),
        setSelectedWorkspace: (id: string | null) => set({ selectedWorkspaceId: id }),
        setSearchQuery: (query: string) => set({ searchQuery: query }),
        setSearchResults: (results: string[]) => set({ searchResults: results }),
        setSearching: (searching: boolean) => set({ isSearching: searching }),
        setShowSidebar: (show: boolean) => set({ showSidebar: show }),
        setEditorMode: (mode: 'edit' | 'preview' | 'split') => set({ editorMode: mode }),
        setShowTags: (show: boolean) => set({ showTags: show }),
        setSortBy: (sortBy: 'title' | 'createdAt' | 'updatedAt') => set({ sortBy }),
        setSortOrder: (order: 'asc' | 'desc') => set({ sortOrder: order }),
        setViewMode: (mode: 'list' | 'grid' | 'cards') => set({ viewMode: mode }),
        setEditing: (editing: boolean) => set({ isEditing: editing }),
        setDirty: (dirty: boolean) => set({ isDirty: dirty }),

        // Complex actions
        clearSearch: () => set({ 
          searchQuery: '', 
          searchResults: [], 
          isSearching: false 
        }),
        
        resetView: () => set(initialState),
      }),
      {
        name: 'notes-ui-v1',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist user preferences, not transient state
          showSidebar: state.showSidebar,
          editorMode: state.editorMode,
          showTags: state.showTags,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          viewMode: state.viewMode,
        })
      }
    ),
    { name: 'notes-store' }
  )
)

// Utility functions that work with server data from React Query
// These can be used directly in components alongside the store
export const notesUtils = {
  searchNotes: (notes: Note[], query: string) => {
    if (!query.trim()) return notes
    
    const searchTerm = query.toLowerCase()
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
    )
  },

  getRelatedNotes: (notes: any[], noteId: string) => {
    const currentNote = notes.find(note => note.id === noteId)
    if (!currentNote) return []

    return notes
      .filter(note => note.id !== noteId)
      .filter(note => 
        note.tags?.some((tag: string) => currentNote.tags?.includes(tag))
      )
      .slice(0, 3)
  },

  getNote: (notes: any[], id: string) => {
    return notes.find(note => note.id === id)
  },

  sortNotes: (notes: any[], sortBy: 'title' | 'createdAt' | 'updatedAt', sortOrder: 'asc' | 'desc') => {
    return [...notes].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy !== 'title') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }
}