'use client'

import { useState, useCallback, useMemo } from 'react'
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
import { SyncStatusIndicator } from '../dev/SyncStatusIndicator'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, MetricCard } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Plus, 
  Sidebar as SidebarIcon,
  Search,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Zap,
  BarChart3,
  Grid3X3,
  List,
  Filter,
  Settings,
  Sparkles
} from 'lucide-react'
import { useIsMobile } from '../../hooks/use-mobile'
import { cn } from '../../lib/utils'

interface DashboardStats {
  totalNotes: number
  totalWorkspaces: number
  recentActivity: number
  aiSuggestions: number
}

export function Dashboard() {
  const { user } = useAuth()
  const { createNote, deleteNote, notes } = useNotes()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'starred' | 'shared'>('all')
  const isMobile = useIsMobile()

  // Superhuman stats calculation
  const stats: DashboardStats = useMemo(() => ({
    totalNotes: notes.length,
    totalWorkspaces: 3,
    recentActivity: 12,
    aiSuggestions: 5,
  }), [notes.length])

  const handleCreateNote = useCallback(async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      content: '',
      tags: []
    })
    setSelectedNoteId(newNote.id)
  }, [createNote])

  const handleBulkDelete = useCallback(async (noteIds: string[]) => {
    for (const id of noteIds) {
      await deleteNote(id)
    }
    setSelectedNoteIds([])
    if (selectedNoteId && noteIds.includes(selectedNoteId)) {
      setSelectedNoteId(null)
    }
  }, [deleteNote, selectedNoteId])

  const handleBulkExport = useCallback(async (noteIds: string[]) => {
    console.log('Exporting notes:', noteIds)
  }, [])

  const handleBulkShare = useCallback(async (noteIds: string[]) => {
    console.log('Sharing notes:', noteIds)
  }, [])

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Superhuman background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-primary/2" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-5" />

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl animate-superhuman-fade-in lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <div className={cn(
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-80 superhuman-transition'
            : 'relative w-80 flex-shrink-0',
          'border-r border-border/30 superhuman-glass backdrop-blur-xl'
        )}>
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Superhuman Header */}
        <header className="flex-shrink-0 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                  className="rounded-full superhuman-hover"
                >
                  <SidebarIcon className="h-4 w-4" />
                </Button>
              )}

              <div className="flex-1 max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search notes..."
                  className="superhuman-glass border-border/30"
                />
              </div>

              {!isMobile && (
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  <div className="flex bg-muted/30 rounded-full p-1 border border-border/30">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon-xs"
                      onClick={() => setViewMode('grid')}
                      className="rounded-full"
                      aria-label="Grid view"
                    >
                      <Grid3X3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon-xs"
                      onClick={() => setViewMode('list')}
                      className="rounded-full"
                      aria-label="List view"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 superhuman-glass border-border/30 rounded-full"
                  >
                    <Filter className="h-3 w-3" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                onClick={handleCreateNote}
                size={isMobile ? "sm" : "default"}
                className="gap-2 rounded-full superhuman-gradient superhuman-glow"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Button>

              {!isMobile && (
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full superhuman-glass border-border/30 superhuman-hover"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 superhuman-scrollbar">
          {/* Superhuman Welcome */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Here's what's happening with your notes today.
            </p>
          </div>

          {/* Superhuman Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Notes"
              value={stats.totalNotes}
              change={{ value: "+12%", trend: "up" }}
              icon={<BookOpen className="h-4 w-4" />}
              color="primary"
              className="superhuman-hover"
            />
            <MetricCard
              label="Workspaces"
              value={stats.totalWorkspaces}
              change={{ value: "+2", trend: "up" }}
              icon={<Users className="h-4 w-4" />}
              color="emerald"
              className="superhuman-hover"
            />
            <MetricCard
              label="AI Suggestions"
              value={stats.aiSuggestions}
              change={{ value: "New", trend: "neutral" }}
              icon={<Zap className="h-4 w-4" />}
              color="amber"
              className="superhuman-hover"
            />
            <MetricCard
              label="Activity"
              value={stats.recentActivity}
              change={{ value: "7 days", trend: "neutral" }}
              icon={<TrendingUp className="h-4 w-4" />}
              color="primary"
              className="superhuman-hover"
            />
          </div>

          {/* Quick Actions */}
          <Card variant="glass" className="superhuman-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started quickly with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 superhuman-glass border-border/30 hover:border-primary/30 superhuman-transition rounded-xl"
                  onClick={handleCreateNote}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="font-medium">Create Note</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Start writing immediately
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 superhuman-glass border-border/30 hover:border-primary/30 superhuman-transition rounded-xl"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="font-medium">Advanced Search</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Find notes quickly
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 superhuman-glass border-border/30 hover:border-primary/30 superhuman-transition rounded-xl"
                >
                  <div className="flex items-center gap-2 w-full">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="font-medium">View Analytics</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Track your progress
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card variant="glass" className="superhuman-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest notes and updates
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="superhuman-glass border-border/30 rounded-full">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 superhuman-transition cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs rounded-full">
                      Note
                    </Badge>
                  </div>
                ))}
                
                {notes.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No recent activity</p>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={handleCreateNote}
                    >
                      Create your first note
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note Editor Overlay */}
        {selectedNoteId && (
          <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
            <div className={cn(
              "h-full overflow-hidden",
              isMobile ? "bg-background" : "lg:absolute lg:inset-0"
            )}>
              <NoteEditor
                noteId={selectedNoteId}
                onClose={() => setSelectedNoteId(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Components */}
      <AIAssistantToggle selectedNoteId={selectedNoteId} />
      <BulkActionsBar
        selectedCount={selectedNoteIds.length}
        selectedNoteIds={selectedNoteIds}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onShare={handleBulkShare}
        onClear={() => setSelectedNoteIds([])}
      />
      <InstallPWAButton />
      {process.env.NODE_ENV === 'development' && <SyncStatusIndicator />}
    </div>
  )
}
