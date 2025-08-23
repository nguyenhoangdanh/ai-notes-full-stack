'use client'

import { useState, useCallback, useMemo, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuth } from '../../hooks/use-auth'
import { useNotes } from '../../contexts/NotesContext'
import { NotesList } from './NotesList'
import { NoteEditor } from './NoteEditor'
import { EmptyState } from './EmptyState'
import { BulkActionsBar } from './BulkActionsBar'
import { AIAssistantToggle } from '../ai/AIAssistantToggle'
import { InstallPWAButton } from '../common/InstallPWAButton'
import { SyncStatusIndicator } from '../dev/SyncStatusIndicator'

// Import new UI components
import { PageHeader } from '../ui/PageHeader'
import { StatCard } from '../ui/StatCard'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { SearchInput } from '../ui/SearchInput'
import { GradientCallout } from '../ui/GradientCallout'
import { EmptyState as UIEmptyState } from '../ui/EmptyState'

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
  Workflow,
  MessageSquare,
  Activity,
  ChevronRight,
  Eye,
  CheckCircle
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

// Error fallback component
function DashboardErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833-.192 2.5 1.582 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text">Something went wrong</h2>
        <p className="text-text-muted">
          {error.message || 'Failed to load dashboard. Please try again.'}
        </p>
        <div className="space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neutral-6 text-text rounded-md hover:bg-neutral-7 transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}

// Loading component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-text-muted">Loading dashboard...</p>
      </div>
    </div>
  )
}

// Main Dashboard content component
function DashboardContent() {
  const { user } = useAuth()
  const { createNote, deleteNote, notes } = useNotes()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'starred' | 'shared'>('all')
  const isMobile = useIsMobile()

  // Enhanced stats calculation
  const stats: DashboardStats = useMemo(() => ({
    totalNotes: notes.length,
    totalWorkspaces: 1,
    recentActivity: notes.length > 0 ? 89 : 0,
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
    <div className="min-h-screen space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || 'User'}!`}
        description="Here's your productivity overview and latest updates from your AI-powered workspace."
        icon={BarChart3}
        badge={{ text: 'Live', variant: 'success' }}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={Search} size="md">
              Search
            </Button>
            <Button 
              variant="cta" 
              icon={Plus} 
              size="md"
              onClick={handleCreateNote}
            >
              New Note
            </Button>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="max-w-2xl">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, workspaces, and more..."
          size="lg"
          variant="glass"
        />
      </div>

      {/* Stats Grid - 4 StatCards as per reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          subtitle="All time created"
          delta={{
            value: stats.weeklyGrowth,
            type: 'increase',
            period: 'this week'
          }}
          icon={BookOpen}
          iconColor="text-primary-600"
        />
        
        <StatCard
          title="Workspaces"
          value={stats.totalWorkspaces}
          subtitle="Active workspace"
          delta={{
            value: 1,
            type: 'neutral',
            period: 'created'
          }}
          icon={Users}
          iconColor="text-accent"
        />
        
        <StatCard
          title="Categories"
          value="0"
          subtitle="Auto-generated"
          icon={Target}
          iconColor="text-purple"
          loading={false}
        />
        
        <StatCard
          title="Activity Score"
          value={stats.recentActivity}
          subtitle="Your productivity"
          delta={{
            value: 15,
            type: 'increase',
            period: 'this week'
          }}
          icon={TrendingUp}
          iconColor="text-info"
        />
      </div>

      {/* Three Panels Layout as per reference screenshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Panel */}
        <Panel
          title="Recent Activity"
          subtitle="Latest updates"
          icon={Activity}
          toolbar={
            <Button variant="ghost" size="sm" icon={Eye}>
              View All
            </Button>
          }
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.slice(0, 3).map((note, index) => (
                <div 
                  key={note.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-elev-1 transition-fast cursor-pointer"
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-text">{note.title}</p>
                    <p className="text-xs text-text-muted">Updated 2 hours ago</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {index === 0 && <Badge variant="success" size="sm">New</Badge>}
                    <ChevronRight className="w-4 h-4 text-text-subtle" />
                  </div>
                </div>
              ))
            ) : (
              <UIEmptyState
                icon={BookOpen}
                title="No recent activity"
                description="Start creating notes to see your activity here."
                size="sm"
              />
            )}
          </div>
        </Panel>

        {/* Today's Goals Panel */}
        <Panel
          title="Today's Goals"
          subtitle="Stay focused"
          icon={Target}
          toolbar={
            <Button variant="ghost" size="sm" icon={CheckCircle}>
              Manage
            </Button>
          }
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="text-2xl font-bold text-text mb-1">3</div>
              <p className="text-sm text-text-muted">Tasks for today</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-elev-1">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-sm text-text">Review weekly notes</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border-soft">
                <div className="w-4 h-4 rounded border border-border" />
                <span className="text-sm text-text-muted">Organize workspace</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border-soft">
                <div className="w-4 h-4 rounded border border-border" />
                <span className="text-sm text-text-muted">Update categories</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Smart Insights Panel */}
        <Panel
          title="Smart Insights"
          subtitle="AI-powered"
          icon={BrainCircuit}
          toolbar={
            <Badge variant="ai" size="sm">AI</Badge>
          }
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 text-primary-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-text-muted">AI insights will appear here as you create more notes</p>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              icon={MessageSquare}
            >
              Ask AI Assistant
            </Button>
          </div>
        </Panel>
      </div>

      {/* AI Features Callout - from reference screenshots */}
      <GradientCallout
        variant="ai"
        size="md"
        title="Intelligent Note Assistant"
        description="Our AI assistant can help summarize your notes, find connections between your ideas, and generate insights to accelerate your learning and productivity."
        badge={{ text: "AI-Powered", variant: "ai" }}
        action={{
          label: "Start Chatting",
          onClick: () => window.location.href = '/ai/chat',
          icon: MessageSquare,
          variant: "primary"
        }}
        secondaryAction={{
          label: "Learn More",
          onClick: () => {}
        }}
      />

      {/* Recent Notes Panel */}
      <Panel
        title="Recent Notes"
        subtitle={`${notes.length} notes`}
        icon={BookOpen}
        toolbar={
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              size="sm"
              className="w-48"
            />
            <Button variant="secondary" size="sm" icon={Plus} onClick={handleCreateNote}>
              New Note
            </Button>
          </div>
        }
      >
        {notes.length > 0 ? (
          <div className="space-y-2">
            {notes.slice(0, 8).map((note) => (
              <div 
                key={note.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-bg-elev-1 transition-fast cursor-pointer interactive"
                onClick={() => setSelectedNoteId(note.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-text">{note.title}</h3>
                  <p className="text-sm text-text-muted truncate">
                    {note.content || 'No content yet...'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-subtle">Updated 2 hours ago</span>
                    {note.tags && note.tags.length > 0 && (
                      <Badge variant="default" size="sm">
                        {note.tags[0]}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-text-subtle" />
              </div>
            ))}
            
            {notes.length > 8 && (
              <div className="pt-4 text-center">
                <Button variant="ghost" size="sm">
                  View All {notes.length} Notes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <UIEmptyState
            icon={BookOpen}
            title="No notes found"
            description="Create your first note to get started with AI-powered insights and organization."
            action={{
              label: "Create Note",
              onClick: handleCreateNote,
              icon: Plus,
              variant: "primary"
            }}
          />
        )}
      </Panel>

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
