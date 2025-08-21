'use client'

import { useState } from 'react'
import Link from 'next/link'

// Import new UI components
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { Toolbar, ToolbarSection } from '../../components/ui/Toolbar'

import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen, 
  Calendar, 
  Tag, 
  Sparkles,
  Clock,
  Star,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react'

export default function NotesClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'starred' | 'shared'>('all')
  
  // Mock notes data
  const notes = [
    {
      id: '1',
      title: 'Project Planning Session',
      content: 'Comprehensive notes from our quarterly planning meeting...',
      tags: ['planning', 'quarterly', 'strategy'],
      category: 'work',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      starred: true
    },
    {
      id: '2', 
      title: 'Machine Learning Research',
      content: 'Notes on latest AI developments and potential applications...',
      tags: ['AI', 'research', 'technology'],
      category: 'research',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14',
      starred: false
    },
    {
      id: '3',
      title: 'Book Notes: Deep Work',
      content: 'Key insights from Cal Newport\'s book on focused productivity...',
      tags: ['books', 'productivity', 'focus'],
      category: 'personal',
      createdAt: '2024-01-13',
      updatedAt: '2024-01-13',
      starred: true
    }
  ]

  const filteredNotes = notes.filter(note => {
    if (searchQuery) {
      return note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    switch (filterBy) {
      case 'starred':
        return note.starred
      case 'recent':
        return new Date(note.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      default:
        return true
    }
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Notes"
        subtitle="Manage your AI-powered notes"
        description="Browse, search, and organize all your notes with intelligent features. Create, edit, and discover insights from your knowledge base."
        icon={BookOpen}
        badge={{ text: 'AI Enhanced', variant: 'ai' }}
        actions={
          <Link href="/notes/create">
            <Button variant="cta" icon={Plus}>
              New Note
            </Button>
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, tags, or content..."
          size="lg"
          variant="glass"
        />
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Notes', count: notes.length },
            { key: 'recent', label: 'Recent', count: notes.filter(n => new Date(n.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
            { key: 'starred', label: 'Starred', count: notes.filter(n => n.starred).length },
            { key: 'shared', label: 'Shared', count: 0 }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={filterBy === filter.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterBy(filter.key as any)}
              className="gap-2"
            >
              {filter.label}
              <Badge variant="default" size="sm">{filter.count}</Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Notes Panel */}
      <Panel
        title="Your Notes"
        subtitle={`${filteredNotes.length} notes`}
        icon={BookOpen}
        toolbar={
          <Toolbar size="sm" justify="end">
            <ToolbarSection>
              {/* View Mode Toggle */}
              <div className="flex bg-bg-elev-1 rounded-lg p-1 border border-border-soft">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={Grid3X3}
                  onClick={() => setViewMode('grid')}
                  className="rounded-md"
                  aria-label="Grid view"
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={List}
                  onClick={() => setViewMode('list')}
                  className="rounded-md"
                  aria-label="List view"
                />
              </div>
            </ToolbarSection>
            
            <ToolbarSection>
              <Button variant="secondary" size="sm" icon={Filter}>
                Filter
              </Button>
            </ToolbarSection>

            <ToolbarSection>
              <Link href="/notes/create">
                <Button variant="cta" size="sm" icon={Plus}>
                  New Note
                </Button>
              </Link>
            </ToolbarSection>
          </Toolbar>
        }
      >
        {/* Notes Content */}
        {filteredNotes.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className={`panel p-4 hover-lift transition-modern cursor-pointer group animate-fade-in ${
                  viewMode === 'list' ? 'flex items-center gap-4' : 'space-y-4'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => window.location.href = `/notes/${note.id}`}
              >
                {/* Note Icon */}
                <div className={`${viewMode === 'list' ? 'w-12 h-12' : 'w-10 h-10'} rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0`}>
                  <BookOpen className={`${viewMode === 'list' ? 'w-6 h-6' : 'w-5 h-5'} text-primary-600`} />
                </div>
                
                {/* Note Content */}
                <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'space-y-3'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text group-hover:text-primary-600 transition-colors truncate">
                          {note.title}
                        </h3>
                        {note.starred && (
                          <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={MoreHorizontal}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Show context menu
                        }}
                      />
                      <ChevronRight className="w-4 h-4 text-text-subtle" />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-text-subtle">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{note.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>2 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon={searchQuery ? Search : BookOpen}
              title={searchQuery ? "No notes found" : "No notes yet"}
              description={
                searchQuery 
                  ? "No notes match your search criteria. Try adjusting your search terms or create a new note with this content."
                  : "Start creating notes to see them here. Your ideas and thoughts deserve a smart, organized home."
              }
              action={{
                label: searchQuery ? "Create Note" : "Create Your First Note",
                onClick: () => window.location.href = '/notes/create',
                icon: Plus,
                variant: "primary"
              }}
              secondaryAction={
                searchQuery ? {
                  label: "Clear Search",
                  onClick: () => setSearchQuery(''),
                  icon: Search
                } : undefined
              }
            />
          </div>
        )}
        
        {/* Pagination or Load More */}
        {filteredNotes.length > 0 && (
          <div className="pt-6 text-center">
            <Button variant="ghost" size="sm">
              Load More Notes
            </Button>
          </div>
        )}
      </Panel>
    </div>
  )
}
