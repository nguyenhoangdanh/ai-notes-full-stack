'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
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
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/2 relative overflow-hidden">
      {/* Superhuman background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-2" />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Superhuman Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Your Notes
                </h1>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Manage and organize your notes with AI-powered features.
              </p>
            </div>
            
            <Link href="/notes/create">
              <Button 
                size="lg" 
                className="gap-2 rounded-full superhuman-gradient superhuman-glow px-6 py-3"
              >
                <Plus className="h-5 w-5" />
                Create Note
              </Button>
            </Link>
          </div>
          
          {/* Search and Filters */}
          <Card variant="glass" className="p-4 border-border/30">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-background/50 border-border/30"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex bg-muted/30 rounded-full p-1 border border-border/30">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-full"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-full"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 superhuman-glass border-border/30 rounded-full"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Notes' },
            { key: 'recent', label: 'Recent' },
            { key: 'starred', label: 'Starred' },
            { key: 'shared', label: 'Shared' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={filterBy === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy(filter.key as any)}
              className="rounded-full superhuman-transition"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Notes Grid/List */}
        {notes.length > 0 ? (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {notes.map((note, index) => (
              <Card 
                key={note.id} 
                variant="glass"
                className="group cursor-pointer superhuman-hover border-border/30 animate-superhuman-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate group-hover:text-primary superhuman-transition">
                        {note.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1 line-clamp-2">
                        {note.content}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {note.starred && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 superhuman-transition rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs rounded-full">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs rounded-full">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Separator className="opacity-50" />
                    
                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span className="capitalize">{note.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>2 min read</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-12 text-center border-border/30">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
            <h3 className="text-xl font-semibold mb-3">No notes found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery 
                ? "No notes match your search criteria. Try adjusting your search terms." 
                : "Start creating notes to see them here. Your ideas and thoughts deserve a smart home."
              }
            </p>
            <Link href="/notes/create">
              <Button className="gap-2 rounded-full superhuman-gradient">
                <Plus className="h-4 w-4" />
                Create Your First Note
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}