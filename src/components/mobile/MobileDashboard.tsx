import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Home,
  FileText,
  Mic,
  Menu,
  Edit3,
  Trash,
  Copy
} from 'lucide-react'
import { useOfflineNotes } from '@/contexts/OfflineNotesContext'
import { MobileNoteEditor } from './MobileNoteEditor'
import { VoiceNoteRecorder } from './VoiceNoteRecorder'
import { MobileSearchSheet } from './MobileSearchSheet'
import { MobileSettingsSheet } from './MobileSettingsSheet'
import { toast } from 'sonner'

type MobileView = 'notes' | 'editor' | 'voice' | 'search' | 'settings'

export function MobileDashboard() {
  const {
    notes,
    currentNote,
    currentWorkspace,
    isLoading,
    syncStatus,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    selectNote,
    forceSync
  } = useOfflineNotes()

  const [currentView, setCurrentView] = useState<MobileView>('notes')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredNotes, setFilteredNotes] = useState(notes)

  // Filter notes based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredNotes(filtered)
    } else {
      setFilteredNotes(notes)
    }
  }, [notes, searchQuery])

  // Handle new note creation
  const handleCreateNote = async () => {
    try {
      const note = await createNote('New Note')
      selectNote(note)
      setCurrentView('editor')
    } catch (error) {
      toast.error('Failed to create note')
    }
  }

  // Handle note deletion
  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await deleteNote(noteId)
      if (currentNote?.id === noteId) {
        setCurrentView('notes')
      }
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }

  // Handle note duplication
  const handleDuplicateNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await duplicateNote(noteId)
      toast.success('Note duplicated')
    } catch (error) {
      toast.error('Failed to duplicate note')
    }
  }

  // Handle sync
  const handleSync = async () => {
    if (!syncStatus.isOnline) {
      toast.error('No internet connection')
      return
    }
    
    try {
      await forceSync()
    } catch (error) {
      toast.error('Sync failed')
    }
  }

  // Notes List View
  const NotesListView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">AI Notes</h1>
            {currentWorkspace && (
              <p className="text-sm text-muted-foreground">{currentWorkspace.name}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sync Status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncStatus.isSyncing || !syncStatus.isOnline}
              className="h-8 w-8 p-0"
            >
              {syncStatus.isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : syncStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </Button>
            
            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('settings')}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sync Status Info */}
        {(syncStatus.pendingOperations > 0 || syncStatus.failedOperations > 0) && (
          <div className="flex gap-2">
            {syncStatus.pendingOperations > 0 && (
              <Badge variant="secondary" className="text-xs">
                {syncStatus.pendingOperations} pending
              </Badge>
            )}
            {syncStatus.failedOperations > 0 && (
              <Badge variant="destructive" className="text-xs">
                {syncStatus.failedOperations} failed
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first note to get started
            </p>
            <Button onClick={handleCreateNote}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onSelect={() => {
                  selectNote(note)
                  setCurrentView('editor')
                }}
                onDelete={(e) => handleDeleteNote(note.id, e)}
                onDuplicate={(e) => handleDuplicateNote(note.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Note Card Component
  const NoteCard = ({ note, onSelect, onDelete, onDuplicate }: {
    note: any
    onSelect: () => void
    onDelete: (e: React.MouseEvent) => void
    onDuplicate: (e: React.MouseEvent) => void
  }) => (
    <Card 
      className="p-4 cursor-pointer active:scale-95 transition-transform"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium line-clamp-1 flex-1">{note.title}</h3>
        <div className="flex items-center gap-1 ml-2">
          {note.syncStatus === 'pending' && (
            <div className="h-2 w-2 bg-amber-500 rounded-full" />
          )}
          {note.syncStatus === 'conflict' && (
            <div className="h-2 w-2 bg-red-500 rounded-full" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {note.content && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {note.content.slice(0, 100)}...
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  )

  // Bottom Navigation
  const BottomNav = () => (
    <div className="sticky bottom-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2">
        <Button
          variant={currentView === 'notes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('notes')}
          className="flex-col h-auto py-2 px-3"
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Notes</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('search')}
          className="flex-col h-auto py-2 px-3"
        >
          <Search className="h-5 w-5 mb-1" />
          <span className="text-xs">Search</span>
        </Button>
        
        <Button
          size="sm"
          onClick={handleCreateNote}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
        
        <Button
          variant={currentView === 'voice' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('voice')}
          className="flex-col h-auto py-2 px-3"
        >
          <Mic className="h-5 w-5 mb-1" />
          <span className="text-xs">Voice</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('settings')}
          className="flex-col h-auto py-2 px-3"
        >
          <Menu className="h-5 w-5 mb-1" />
          <span className="text-xs">More</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          {currentView === 'notes' && <NotesListView />}
          {currentView === 'editor' && (
            <MobileNoteEditor
              note={currentNote}
              onBack={() => setCurrentView('notes')}
              onUpdate={updateNote}
            />
          )}
          {currentView === 'voice' && (
            <VoiceNoteRecorder
              onBack={() => setCurrentView('notes')}
            />
          )}
          {currentView === 'search' && (
            <MobileSearchSheet
              isOpen={currentView === 'search'}
              onClose={() => setCurrentView('notes')}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
          {currentView === 'settings' && (
            <MobileSettingsSheet
              isOpen={currentView === 'settings'}
              onClose={() => setCurrentView('notes')}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      <BottomNav />
    </div>
  )
}