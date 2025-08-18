'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, FunnelIcon, ViewColumnsIcon } from '@heroicons/react/24/outline'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { useNotes } from '../../hooks/use-notes'
import { useWorkspaces } from '../../hooks/use-workspaces'
import { formatDistanceToNow } from 'date-fns'

export default function NotesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  const { data: workspaces = [] } = useWorkspaces()
  const { 
    data: notes = [], 
    isLoading,
    error 
  } = useNotes(
    selectedWorkspace === 'all' ? undefined : selectedWorkspace,
    50 // limit
  )

  const filteredNotes = notes.filter(note => 
    search ? note.title.toLowerCase().includes(search.toLowerCase()) ||
             note.content.toLowerCase().includes(search.toLowerCase()) : true
  )

  const handleCreateNote = () => {
    router.push('/notes/create')
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`)
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error loading notes</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
        <Button onClick={handleCreateNote}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workspaces</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <ViewColumnsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notes Grid/List */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium">No notes found</h3>
            <p className="text-muted-foreground mt-2">
              {search ? 'Try adjusting your search terms' : 'Get started by creating your first note'}
            </p>
            <Button onClick={handleCreateNote} className="mt-4">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNoteClick(note.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content?.substring(0, 150) || 'No content'}
                  {note.content && note.content.length > 150 && '...'}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>
                    {workspaces.find(w => w.id === note.workspaceId)?.name || 'Personal'}
                  </span>
                  <span>{note.content?.length || 0} characters</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}