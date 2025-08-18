import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useNotes as useNotesQuery, useCreateNote, useUpdateNote, useDeleteNote, useSearchNotes } from '../hooks'
import { Note } from '../types'

// Re-export Note type for backward compatibility
export type { Note }

interface NotesContextType {
  notes: Note[]
  isLoading: boolean
  createNote: (note: { title: string; content: string; tags?: string[]; category?: string }) => Promise<Note>
  updateNote: (id: string, updates: { title?: string; content?: string; tags?: string[]; category?: string }) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  searchNotes: (query: string) => Note[]
  getRelatedNotes: (noteId: string) => Note[]
  getNote: (id: string) => Note | undefined
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const { data: notes = [], isLoading } = useNotesQuery()
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()

  const createNote = async (noteData: { title: string; content: string; tags?: string[] }): Promise<Note> => {
    const result = await createNoteMutation.mutateAsync({
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      workspaceId: 'default' // Use default workspace for now
    })
    return result
  }

  const updateNote = async (id: string, updates: { title?: string; content?: string; tags?: string[] }) => {
    await updateNoteMutation.mutateAsync({ id, data: updates })
  }

  const deleteNote = async (id: string) => {
    await deleteNoteMutation.mutateAsync(id)
  }

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes

    const searchTerm = query.toLowerCase()
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  const getRelatedNotes = (noteId: string): Note[] => {
    const currentNote = notes.find(note => note.id === noteId)
    if (!currentNote) return []

    return notes
      .filter(note => note.id !== noteId)
      .filter(note => 
        note.tags?.some(tag => currentNote.tags?.includes(tag))
      )
      .slice(0, 3)
  }

  const getNote = (id: string): Note | undefined => {
    return notes.find(note => note.id === id)
  }

  const contextValue = useMemo(() => ({
    notes,
    isLoading: isLoading || createNoteMutation.isPending || updateNoteMutation.isPending || deleteNoteMutation.isPending,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getRelatedNotes,
    getNote
  }), [notes, isLoading, createNoteMutation, updateNoteMutation, deleteNoteMutation])

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}