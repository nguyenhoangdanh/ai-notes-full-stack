'use client'

import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useNotes } from '../../contexts/NotesContext'
import { NotesList } from './NotesList'
import { NoteEditor } from './NoteEditor'
import { SearchBar } from './SearchBar'
import { EmptyState } from './EmptyState'
import { BulkActionsBar } from './BulkActionsBar'
import { AIAssistantToggle } from '../ai/AIAssistantToggle'
import { InstallPWAButton } from '../common/InstallPWAButton'
import { SyncStatusIndicator } from '../dev/SyncStatusIndicator'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, MetricCard, FeatureCard } from '../ui/card'
import { Badge, StatusBadge, TrendBadge } from '../ui/badge'
import { 
  Plus, 
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
  Sparkles,
  Target,
  Calendar,
  Archive,
  Star,
  Lightbulb,
  BrainCircuit,
  Workflow
} from 'lucide-react'
import { useIsMobile } from '../../hooks/use-mobile'
import { cn } from '../../lib/utils'

interface DashboardStats {
  totalNotes: number
  totalWorkspaces: number
  recentActivity: number
  aiSuggestions: number
  weeklyGrowth: number
  completedTasks: number
}

export function Dashboard() {
  const { user } = useAuth()
  const { createNote, deleteNote, notes } = useNotes()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'starred' | 'shared'>('all')
  const isMobile = useIsMobile()

  // Enhanced stats calculation with marketing metrics
  const stats: DashboardStats = useMemo(() => ({
    totalNotes: notes.length,
    totalWorkspaces: 3,
    recentActivity: 12,
    aiSuggestions: 5,
    weeklyGrowth: 23,
    completedTasks: 8,
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
    <div className="min-h-screen bg-bg relative">
      {/* Modern background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-elevated to-brand-50/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-brand-100)_0%,_transparent_50%)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-brand-200)_0%,_transparent_50%)] opacity-20" />

      <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Modern Welcome Header */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-gradient">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <StatusBadge status="active" showDot={true} />
              </div>
              <p className="text-text-secondary text-lg leading-relaxed">
                Here's your productivity overview and latest updates.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl"
                onClick={() => setSearchQuery('')}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
              
              <Button
                onClick={handleCreateNote}
                size="lg"
                variant="gradient"
                className="gap-2 rounded-xl shadow-3"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notes, workspaces, and more..."
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Notes"
            value={stats.totalNotes}
            change={{ value: `+${stats.weeklyGrowth}%`, trend: "up" }}
            icon={<BookOpen />}
            color="brand"
            size="default"
          />
          
          <MetricCard
            label="Workspaces"
            value={stats.totalWorkspaces}
            change={{ value: "+2 this week", trend: "up" }}
            icon={<Users />}
            color="success"
            size="default"
          />
          
          <MetricCard
            label="AI Insights"
            value={stats.aiSuggestions}
            change={{ value: "5 ready", trend: "neutral" }}
            icon={<BrainCircuit />}
            color="info"
            size="default"
          />
          
          <MetricCard
            label="Tasks Done"
            value={stats.completedTasks}
            change={{ value: "+60%", trend: "up" }}
            icon={<Target />}
            color="success"
            size="default"
          />
        </div>

        {/* Quick Actions Grid */}
        <Card variant="elevated" className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-brand-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start your most common tasks instantly
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-3 rounded-xl hover-lift"
              onClick={handleCreateNote}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <Plus className="h-4 w-4 text-brand-600" />
                </div>
                <span className="font-semibold">Create Note</span>
              </div>
              <p className="text-xs text-text-muted text-left">
                Start writing with AI assistance
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-3 rounded-xl hover-lift"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-success-bg rounded-lg">
                  <BarChart3 className="h-4 w-4 text-success" />
                </div>
                <span className="font-semibold">View Analytics</span>
              </div>
              <p className="text-xs text-text-muted text-left">
                Track your productivity trends
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-3 rounded-xl hover-lift"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-info-bg rounded-lg">
                  <Workflow className="h-4 w-4 text-info" />
                </div>
                <span className="font-semibold">AI Assistant</span>
              </div>
              <p className="text-xs text-text-muted text-left">
                Get intelligent writing help
              </p>
            </Button>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureCard
            title="AI-Powered Insights"
            description="Get intelligent suggestions and automated organization for your notes based on content analysis and usage patterns."
            icon={<Lightbulb />}
            badge="Smart"
          />
          
          <FeatureCard
            title="Real-time Collaboration"
            description="Work together seamlessly with your team using real-time editing, comments, and shared workspaces."
            icon={<Users />}
            badge="Team"
          />
        </div>

        {/* Recent Activity */}
        <Card variant="elevated" className="p-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-brand-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest notes and updates
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {notes.length > 0 ? (
                notes.slice(0, 5).map((note, index) => (
                  <div key={note.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-modern cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-brand-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-sm text-text-muted">Updated 2 hours ago</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" size="sm">
                        Note
                      </Badge>
                      {index === 0 && <Badge variant="success" size="sm">New</Badge>}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Productivity Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="feature" className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-text">+{stats.weeklyGrowth}%</div>
                <p className="text-sm text-text-muted">Notes created this week</p>
                <TrendBadge trend="up" value="vs last week" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-600" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-lg font-semibold">3 tasks today</div>
                <p className="text-sm text-text-muted">2 meetings, 1 deadline</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Pro Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Use keyboard shortcuts to speed up your workflow.</p>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn shortcuts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Note Editor Overlay */}
      {selectedNoteId && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          <div className={cn(
            "h-full overflow-hidden",
            isMobile ? "bg-bg" : "lg:absolute lg:inset-0"
          )}>
            <NoteEditor
              noteId={selectedNoteId}
              onClose={() => setSelectedNoteId(null)}
            />
          </div>
        </div>
      )}

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
