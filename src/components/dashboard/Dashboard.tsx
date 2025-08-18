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
  const { createNote, deleteNote, notes } = useNotes()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
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

  const handleBulkDelete = async (noteIds: string[]) => {
    for (const id of noteIds) {
      await deleteNote(id)
    }
    setSelectedNoteIds([])
    if (selectedNoteId && noteIds.includes(selectedNoteId)) {
      setSelectedNoteId(null)
    }
  }

  const handleBulkExport = async (noteIds: string[]) => {
    // This would integrate with export hooks when available
    console.log('Exporting notes:', noteIds)
  }

  const handleBulkShare = async (noteIds: string[]) => {
    // This would integrate with sharing hooks when available
    console.log('Sharing notes:', noteIds)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <div className={`${
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out'
            : 'relative w-80 flex-shrink-0'
        } border-r border-border bg-card`}>
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <SidebarIcon className="h-5 w-5" />
                </Button>
              )}

              {!isMobile && (
                <div className="flex-1 max-w-md">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search your notes..."
                  />
                </div>
              )}

              {isMobile && (
                <h1 className="text-lg font-semibold text-foreground truncate">
                  AI Notes
                </h1>
              )}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                onClick={handleCreateNote}
                size={isMobile ? "sm" : "default"}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
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
            <div className="hidden lg:flex flex-1 items-center justify-center p-8">
              <EmptyState
                type={notes.length === 0 ? 'notes' : 'search'}
                onAction={handleCreateNote}
                actionLabel="Create Note"
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Toggle */}
      <AIAssistantToggle selectedNoteId={selectedNoteId} />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedNoteIds.length}
        selectedNoteIds={selectedNoteIds}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onShare={handleBulkShare}
        onClear={() => setSelectedNoteIds([])}
      />

      {/* PWA Install Prompt */}
      <InstallPWAButton />
    </div>
  )
}
