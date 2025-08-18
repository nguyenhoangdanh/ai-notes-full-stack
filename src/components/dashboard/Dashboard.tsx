import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useNotes } from '../../contexts/NotesContext'
import { Sidebar } from './Sidebar'
import { NotesList } from './NotesList'
import { NoteEditor } from './NoteEditor'
import { SearchBar } from './SearchBar'
import { EmptyState } from './EmptyState'
import { BulkActionsBar } from './BulkActionsBar'
import { AIAssistantToggle } from '../ai/AIAssistantToggle'
import { InstallPWAButton } from '../common/InstallPWAButton'
import { Button } from '../ui/button'
import { Plus, Sidebar as SidebarIcon } from 'lucide-react'
import { useIsMobile } from '../../hooks/use-mobile'

export function Dashboard() {
  const { user } = useAuth()
  const { createNote } = useNotes()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useIsMobile()

  const handleCreateNote = async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      content: '',
      tags: []
    })
    setSelectedNoteId(newNote.id)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <div className={`${isMobile ? 'fixed inset-0 z-50' : 'relative'} w-80 border-r border-border bg-card`}>
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <SidebarIcon className="h-5 w-5" />
                </Button>
              )}
              
              {!isMobile && (
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search your notes..."
                />
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCreateNote}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Notes List */}
          <div className={`${selectedNoteId ? 'hidden lg:block' : 'flex-1'} lg:w-80 border-r border-border bg-background`}>
            <NotesList 
              searchQuery={searchQuery}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
            />
          </div>

          {/* Note Editor */}
          {selectedNoteId && (
            <div className="flex-1">
              <NoteEditor 
                noteId={selectedNoteId}
                onClose={() => setSelectedNoteId(null)}
              />
            </div>
          )}

          {/* Empty State */}
          {!selectedNoteId && (
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-24 h-24 mx-auto bg-secondary rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Start writing your first note
                </h3>
                <p className="text-muted-foreground">
                  Create a new note to begin capturing your thoughts and ideas. Our AI will help organize and make them searchable.
                </p>
                <Button onClick={handleCreateNote} className="mt-4">
                  Create your first note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Toggle */}
      <AIAssistantToggle selectedNoteId={selectedNoteId} />
    </div>
  )
}
