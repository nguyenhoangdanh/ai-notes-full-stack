'use client'

import { useState } from 'react'
import { Network, Search, Plus, Eye, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/Badge'
import {
  useNotes,
  useRelationsStats,
  useAuthProfile
} from '@/hooks'
import { RelationsGraph } from '@/components/relations/RelationsGraph'
import { RelationsList } from '@/components/relations/RelationsList'
import { RelationsStats } from '@/components/relations/RelationsStats'

export default function RelationsPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: notes, isLoading: notesLoading } = useNotes()
  const { data: currentUser } = useAuthProfile()
  const { data: stats, isLoading: statsLoading } = useRelationsStats(currentUser?.id || '')

  const filteredNotes = notes?.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (notesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8" />
            Relations
          </h1>
          <p className="text-muted-foreground">
            Discover and visualize connections between your notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Relation
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <RelationsStats stats={stats} />}

      {/* Note Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Select Note to Explore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedNoteId === note.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <CardContent className="p-3">
                    <h4 className="font-medium truncate">{note.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {note.tags.length} tags
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No notes found matching your search' : 'No notes available'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Relations Content */}
      {selectedNoteId ? (
        <Tabs defaultValue="graph" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="mt-6">
            <RelationsGraph noteId={selectedNoteId} />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <RelationsList noteId={selectedNoteId} />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Relation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    AI Relation Analysis
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze relationships between this note and others using AI
                  </p>
                  <Button>
                    Start Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Network className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Select a Note</h3>
            <p className="text-muted-foreground text-center">
              Choose a note above to explore its relationships and connections
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
