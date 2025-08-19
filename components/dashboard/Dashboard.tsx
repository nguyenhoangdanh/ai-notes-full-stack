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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
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
  Calendar,
  Filter,
  Grid3X3,
  List,
  Settings
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

  // Calculate dashboard stats
  const stats: DashboardStats = useMemo(() => ({
    totalNotes: notes.length,
    totalWorkspaces: 3, // Mock data
    recentActivity: 12, // Mock data
    aiSuggestions: 5, // Mock data
  }), [notes.length])

  // Handle creating new note
  const handleCreateNote = useCallback(async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      content: '',
      tags: []
    })
    setSelectedNoteId(newNote.id)
  }, [createNote])

  // Handle bulk operations
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

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      description: '+12 this week',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Workspaces',
      value: stats.totalWorkspaces,
      description: '2 active projects',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      title: 'AI Suggestions',
      value: stats.aiSuggestions,
      description: 'Ready to review',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      badge: 'New'
    },
    {
      title: 'Activity',
      value: stats.recentActivity,
      description: 'Last 7 days',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    }
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background/98 to-accent/3 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <div className={cn(
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out'
            : 'relative w-80 flex-shrink-0',
          'border-r border-border/60 glass-effect'
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
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border/60 glass-effect-strong px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                  className="h-10 w-10 p-0 hover:bg-accent/10 rounded-xl"
                >
                  <SidebarIcon className="h-5 w-5" />
                </Button>
              )}

              <div className="flex-1 max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search your notes..."
                  className="glass-effect border-border/40"
                />
              </div>

              {!isMobile && (
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  <div className="flex bg-muted/50 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                      aria-label="Grid view"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Filter dropdown */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 glass-effect border-border/40"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                onClick={handleCreateNote}
                size={isMobile ? "sm" : "default"}
                className="gap-2 bg-gradient-to-r from-accent to-accent-secondary hover:from-accent/90 hover:to-accent-secondary/90 text-white shadow-colored"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Button>

              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 glass-effect border-border/40"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your notes today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
              <Card key={stat.title} className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-105",
                "glass-effect border-border/40",
                "group cursor-pointer"
              )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    stat.bgColor
                  )}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </div>
                    {stat.badge && (
                      <Badge variant="secondary" className="text-xs bg-accent/20 text-accent-foreground">
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="glass-effect border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
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
                  className="h-auto p-4 flex flex-col items-start gap-2 glass-effect border-border/40 hover:border-accent/30 transition-all duration-200"
                  onClick={handleCreateNote}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Plus className="h-4 w-4 text-accent" />
                    <span className="font-medium">Create Note</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Start writing immediately
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 glass-effect border-border/40 hover:border-accent/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Search className="h-4 w-4 text-accent" />
                    <span className="font-medium">Advanced Search</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Find notes quickly
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 glass-effect border-border/40 hover:border-accent/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 w-full">
                    <BarChart3 className="h-4 w-4 text-accent" />
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
          <Card className="glass-effect border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest notes and updates
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="glass-effect border-border/40">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.slice(0, 3).map((note, index) => (
                  <div key={note.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors duration-200 cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Note
                    </Badge>
                  </div>
                ))}
                
                {notes.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
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

        {/* Content Area for Notes */}
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

      {/* Development: Sync Status Indicator */}
      {process.env.NODE_ENV === 'development' && <SyncStatusIndicator />}
    </div>
  )
}
