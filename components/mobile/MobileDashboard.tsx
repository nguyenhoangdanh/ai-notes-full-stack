'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
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
  Copy,
  ArrowLeft,
  Filter,
  MoreVertical,
  Star,
  Clock,
  Folder
} from 'lucide-react'
import { useOfflineNotes } from '../../contexts/OfflineNotesContext'
import { OfflineNote } from '../../lib/offline-storage'
import { MobileNoteEditor } from './MobileNoteEditor'
import { VoiceNoteRecorder } from './VoiceNoteRecorder'
import { MobileSearchSheet } from './MobileSearchSheet'
import { MobileSettingsSheet } from './MobileSettingsSheet'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

type MobileView = 'notes' | 'editor' | 'voice' | 'search' | 'settings' | 'folders'
type FilterType = 'all' | 'recent' | 'starred' | 'drafts'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
  createdAt: string
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error'
  starred?: boolean
  folder?: string
}

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
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [pullToRefresh, setPullToRefresh] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Memoized filtered notes for performance
  const filteredNotes = useMemo(() => {
    let filtered = notes

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply type filter
    switch (filterType) {
      case 'recent':
        filtered = filtered.filter(note => {
          const dayAgo = new Date()
          dayAgo.setDate(dayAgo.getDate() - 1)
          return note.updatedAt > dayAgo
        })
        break
      case 'starred':
        filtered = filtered.filter(note => note.starred)
        break
      case 'drafts':
        filtered = filtered.filter(note => !note.content || note.content.length < 50)
        break
    }

    // Sort by updated date
    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }, [notes, searchQuery, filterType])

  // Optimized handlers
  const handleCreateNote = useCallback(async () => {
    try {
      const note = await createNote('New Note')
      selectNote(note)
      setCurrentView('editor')
    } catch (error) {
      toast.error('Failed to create note')
    }
  }, [createNote, selectNote])

  const handleDeleteNote = useCallback(async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await deleteNote(noteId)
      if (currentNote?.id === noteId) {
        setCurrentView('notes')
      }
      toast.success('Note deleted')
    } catch (error) {
      toast.error('Failed to delete note')
    }
  }, [deleteNote, currentNote])

  const handleDuplicateNote = useCallback(async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await duplicateNote(noteId)
      toast.success('Note duplicated')
    } catch (error) {
      toast.error('Failed to duplicate note')
    }
  }, [duplicateNote])

  const handleSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      toast.error('No internet connection')
      return
    }
    
    try {
      await forceSync()
      toast.success('Sync completed')
    } catch (error) {
      toast.error('Sync failed')
    }
  }, [syncStatus.isOnline, forceSync])

  // Pull to refresh
  const handlePullToRefresh = useCallback(async () => {
    setPullToRefresh(true)
    await handleSync()
    setTimeout(() => setPullToRefresh(false), 500)
  }, [handleSync])

  // Scroll handler for dynamic header
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Notes List View with enhanced mobile UX
  const NotesListView = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background/98 to-background">
      {/* Dynamic Header */}
      <div className={cn(
        "sticky top-0 z-10 border-b transition-all duration-300",
        scrollY > 50 
          ? "glass-effect-strong border-border/80 shadow-lg" 
          : "glass-effect border-border/40 shadow-sm"
      )}>
        <div className="p-4 space-y-4 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gradient truncate">AI Notes</h1>
              {currentWorkspace && (
                <p className="text-sm text-muted-foreground font-medium truncate">{currentWorkspace.name}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Sync Status */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={syncStatus.isSyncing || !syncStatus.isOnline}
                className="h-10 w-10 p-0 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              >
                {syncStatus.isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-accent" />
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
                className="h-10 w-10 p-0 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="pr-12 glass-effect border-border/40"
              leftIcon={<Search className="h-4 w-4" />}
              clearable
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {(['all', 'recent', 'starred', 'drafts'] as FilterType[]).map((filter) => (
              <Button
                key={filter}
                variant={filterType === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(filter)}
                className={cn(
                  "whitespace-nowrap rounded-xl capitalize transition-all duration-200",
                  filterType === filter 
                    ? "bg-accent text-accent-foreground shadow-md" 
                    : "hover:bg-accent/10"
                )}
              >
                {filter === 'all' && <Home className="h-3 w-3 mr-1" />}
                {filter === 'recent' && <Clock className="h-3 w-3 mr-1" />}
                {filter === 'starred' && <Star className="h-3 w-3 mr-1" />}
                {filter === 'drafts' && <Edit3 className="h-3 w-3 mr-1" />}
                {filter}
              </Button>
            ))}
          </div>

          {/* Status Indicators */}
          {(syncStatus.pendingOperations > 0 || syncStatus.failedOperations > 0) && (
            <div className="flex gap-2">
              {syncStatus.pendingOperations > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                  {syncStatus.pendingOperations} pending
                </Badge>
              )}
              {syncStatus.failedOperations > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  {syncStatus.failedOperations} failed
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {pullToRefresh && (
        <div className="flex items-center justify-center py-4 bg-accent/10">
          <RefreshCw className="h-5 w-5 animate-spin text-accent mr-2" />
          <span className="text-sm font-medium text-accent">Syncing...</span>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-auto scroll-smooth">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-accent/60 animate-pulse"></div>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="p-6 bg-gradient-to-br from-accent/10 to-accent-secondary/10 rounded-3xl mb-6 shadow-lg">
              <FileText className="h-16 w-16 text-accent mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gradient">
              {searchQuery ? 'No results found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm">
              {searchQuery 
                ? 'Try adjusting your search terms or create a new note'
                : 'Create your first note to get started with AI-powered note-taking'
              }
            </p>
            <Button 
              onClick={handleCreateNote} 
              size="lg" 
              className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2" />
              {searchQuery ? 'Create Note' : 'Create Your First Note'}
            </Button>
          </div>
        ) : (
          <div className="p-4 pb-24 space-y-3">
            <AnimatePresence>
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <NoteCard
                    note={note}
                    onSelect={() => {
                      selectNote(note)
                      setCurrentView('editor')
                    }}
                    onDelete={(e) => handleDeleteNote(note.id, e)}
                    onDuplicate={(e) => handleDuplicateNote(note.id, e)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )

  // Enhanced Note Card Component
  const NoteCard = ({ note, onSelect, onDelete, onDuplicate }: {
    note: OfflineNote
    onSelect: () => void
    onDelete: (e: React.MouseEvent) => void
    onDuplicate: (e: React.MouseEvent) => void
  }) => (
    <Card
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98 glass-effect group border-border/40 hover:border-accent/30"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
              {note.title}
            </h3>
            {note.starred && <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />}
            {note.syncStatus === 'pending' && (
              <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            {note.syncStatus === 'conflict' && (
              <div className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0" />
            )}
          </div>
          
          {note.content && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {note.content.length > 100 ? `${note.content.slice(0, 100)}...` : note.content}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 w-8 p-0 hover:scale-110 rounded-lg hover:bg-accent/10"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 hover:scale-110 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          {note.updatedAt.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {note.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {note.tags.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 bg-accent/10 border-accent/20">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-muted/50">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  )

  // Enhanced Bottom Navigation with haptic feedback
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-effect-strong border-t border-border/60 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around py-3 px-2 max-w-lg mx-auto">
        <Button
          variant={currentView === 'notes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('notes')}
          className="flex-col h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-16"
        >
          <Home className={cn("h-5 w-5 mb-1", currentView === 'notes' && "text-accent-contrast")} />
          <span className={cn("text-xs font-medium", currentView === 'notes' && "text-accent-contrast")}>Notes</span>
        </Button>
        
        <Button
          variant={currentView === 'search' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('search')}
          className="flex-col h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-16"
        >
          <Search className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Search</span>
        </Button>
        
        <Button
          size="sm"
          onClick={handleCreateNote}
          className="h-14 w-14 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 bg-gradient-to-r from-accent to-accent-secondary relative overflow-hidden"
        >
          <Plus className="h-7 w-7 text-accent-contrast relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </Button>
        
        <Button
          variant={currentView === 'voice' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('voice')}
          className="flex-col h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-16"
        >
          <Mic className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Voice</span>
        </Button>
        
        <Button
          variant={currentView === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('settings')}
          className="flex-col h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-16"
        >
          <Menu className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">More</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background via-background/98 to-background overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
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
