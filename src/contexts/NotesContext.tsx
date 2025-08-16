import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category?: string
  createdAt: string
  updatedAt: string
  embeddings?: number[]
}

interface NotesContextType {
  notes: Note[]
  isLoading: boolean
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  searchNotes: (query: string) => Note[]
  getRelatedNotes: (noteId: string) => Note[]
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useKV<Note[]>('user-notes', [])
  const [isLoading, setIsLoading] = useKV('notes-loading', false)

  const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    setIsLoading(true)
    try {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Simulate AI categorization
      if (noteData.content.toLowerCase().includes('meeting') || noteData.title.toLowerCase().includes('meeting')) {
        newNote.category = 'meetings'
      } else if (noteData.content.toLowerCase().includes('idea') || noteData.title.toLowerCase().includes('idea')) {
        newNote.category = 'ideas'
      } else if (noteData.content.toLowerCase().includes('task') || noteData.content.toLowerCase().includes('todo')) {
        newNote.category = 'tasks'
      } else {
        newNote.category = 'general'
      }

      setNotes(currentNotes => [...currentNotes, newNote])
      return newNote
    } finally {
      setIsLoading(false)
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setIsLoading(true)
    try {
      setNotes(currentNotes =>
        currentNotes.map(note =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    setIsLoading(true)
    try {
      setNotes(currentNotes => currentNotes.filter(note => note.id !== id))
    } finally {
      setIsLoading(false)
    }
  }

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes

    const searchTerm = query.toLowerCase()
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      note.category?.toLowerCase().includes(searchTerm)
    )
  }

  const getRelatedNotes = (noteId: string): Note[] => {
    const currentNote = notes.find(note => note.id === noteId)
    if (!currentNote) return []

    return notes
      .filter(note => note.id !== noteId)
      .filter(note => 
        note.category === currentNote.category ||
        note.tags.some(tag => currentNote.tags.includes(tag))
      )
      .slice(0, 3)
  }

  return (
    <NotesContext.Provider value={{
      notes,
      isLoading,
      createNote,
      updateNote,
      deleteNote,
      searchNotes,
      getRelatedNotes
    }}>
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