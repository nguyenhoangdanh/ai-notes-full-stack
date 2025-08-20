'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { QuickTooltip } from '@/components/ui/tooltip'
import { 
  List, 
  Eye, 
  Link2, 
  Trash2, 
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Brain,
  TrendingUp,
  Clock,
  Share2
} from 'lucide-react'
import { 
  useStoredRelations, 
  useRelatedNotes, 
  useSaveRelation, 
  useDeleteRelation 
} from '@/hooks'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface RelationsListProps {
  noteId: string
  className?: string
}

export function RelationsList({ noteId, className }: RelationsListProps) {
  const { data: storedRelations, isLoading: storedLoading } = useStoredRelations(noteId)
  const { data: relatedNotes, isLoading: relatedLoading } = useRelatedNotes(noteId)
  const saveRelation = useSaveRelation()
  const deleteRelation = useDeleteRelation()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'strength' | 'date' | 'title'>('strength')

  const handleDeleteRelation = async (targetNoteId: string) => {
    try {
      await deleteRelation.mutateAsync({ 
        sourceNoteId: noteId, 
        targetNoteId 
      })
      toast.success('Relation removed successfully')
    } catch (error) {
      console.error('Failed to delete relation:', error)
      toast.error('Failed to remove relation')
    }
  }

  const handleSaveRelation = async (targetNoteId: string, relationshipType = 'related') => {
    try {
      await saveRelation.mutateAsync({
        sourceNoteId: noteId,
        targetNoteId,
        relationshipType,
        strength: 0.8
      })
      toast.success('Relation established successfully')
    } catch (error) {
      console.error('Failed to save relation:', error)
      toast.error('Failed to establish relation')
    }
  }

  // Filter and sort relations
  const filteredStoredRelations = (storedRelations || []).filter((relation: any) => {
    const matchesSearch = !searchQuery || 
      relation.targetNote?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || relation.relationshipType === selectedType
    return matchesSearch && matchesType
  })

  const filteredSuggestedRelations = (relatedNotes || []).filter((note: any) => {
    return !searchQuery || note.title?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (storedLoading || relatedLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} variant="glass" className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-brand-100 rounded-xl w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="p-4 bg-brand-50 rounded-xl">
                  <div className="h-5 bg-brand-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-brand-50 rounded w-1/2" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search relations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              Sort: {sortBy}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Established Relations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass" className="shadow-3 border border-border-subtle">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl">
                  <Link2 className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-gradient">Established Relations</span>
                <Badge variant="feature" size="xs">
                  {filteredStoredRelations.length}
                </Badge>
              </CardTitle>
              <Button variant="gradient" size="sm" className="gap-2 shadow-2">
                <Plus className="h-4 w-4" />
                Add Relation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!filteredStoredRelations || filteredStoredRelations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center">
                  <Link2 className="h-8 w-8 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-2">No Relations Established</h3>
                  <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                    {searchQuery 
                      ? "No relations match your search criteria."
                      : "Connect this note with related notes to build a knowledge network."
                    }
                  </p>
                </div>
                {!searchQuery && (
                  <Button variant="outline" className="gap-2 mt-4">
                    <Sparkles className="h-4 w-4" />
                    Discover Relations
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredStoredRelations.map((relation: any, index: number) => (
                    <motion.div
                      key={relation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex items-center justify-between p-4 rounded-2xl transition-modern",
                        "border border-border-subtle hover:border-brand-300",
                        "bg-gradient-to-r from-surface to-surface-elevated",
                        "hover:shadow-2 hover:-translate-y-0.5"
                      )}
                    >
                      {/* Relation Type Indicator */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-brand-500 to-brand-600 rounded-r-full" />
                      
                      <div className="flex-1 min-w-0 pl-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-text truncate">
                            {relation.targetNote?.title || 'Untitled Note'}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className="shrink-0 text-xs border-brand-200 bg-brand-50 text-brand-700"
                          >
                            {relation.relationshipType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-brand-600" />
                            <span className="text-text-secondary">
                              Strength: <span className="font-medium text-brand-600">
                                {(relation.strength * 100).toFixed(0)}%
                              </span>
                            </span>
                          </div>
                          
                          {relation.createdAt && (
                            <div className="flex items-center gap-2 text-text-subtle">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(relation.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Relation preview */}
                        {relation.targetNote?.content && (
                          <p className="text-sm text-text-muted line-clamp-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {relation.targetNote.content.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <QuickTooltip content="View note">
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="rounded-xl hover:bg-brand-100 hover:text-brand-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </QuickTooltip>
                        
                        <QuickTooltip content="Share relation">
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="rounded-xl hover:bg-brand-100 hover:text-brand-700"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </QuickTooltip>
                        
                        <QuickTooltip content="Remove relation">
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => handleDeleteRelation(relation.targetNoteId)}
                            className="rounded-xl hover:bg-danger/10 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </QuickTooltip>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggested Relations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" className="shadow-3 border border-border-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-gradient">AI Suggestions</span>
              <Badge variant="feature" size="xs" className="bg-gradient-to-r from-purple-500 to-purple-600">
                {filteredSuggestedRelations.length} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!filteredSuggestedRelations || filteredSuggestedRelations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-2">No Suggestions Available</h3>
                  <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                    {searchQuery 
                      ? "No suggested relations match your search."
                      : "AI hasn't found any potential relations yet. Try adding more content or tags to your notes."
                    }
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredSuggestedRelations.map((note: any, index: number) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex items-center justify-between p-4 rounded-2xl transition-modern",
                        "border border-purple-200/50 hover:border-purple-300",
                        "bg-gradient-to-r from-purple-50/50 to-surface",
                        "hover:shadow-2 hover:-translate-y-0.5"
                      )}
                    >
                      {/* AI Indicator */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-r-full" />
                      
                      <div className="flex-1 min-w-0 pl-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-text truncate">
                            {note.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className="shrink-0 text-xs border-purple-200 bg-purple-50 text-purple-700"
                          >
                            {(note.similarity * 100).toFixed(0)}% match
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-text-muted line-clamp-2 mb-3 leading-relaxed">
                          {note.content?.substring(0, 120)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {note.sharedTags && note.sharedTags.length > 0 && (
                            <Badge variant="outline" className="text-xs border-accent/30 bg-accent/5 text-accent">
                              {note.sharedTags.length} shared tags
                            </Badge>
                          )}
                          
                          {note.updatedAt && (
                            <div className="flex items-center gap-2 text-text-subtle">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(note.updatedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <QuickTooltip content="Preview note">
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="rounded-xl hover:bg-purple-100 hover:text-purple-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </QuickTooltip>
                        
                        <QuickTooltip content="Establish relation">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveRelation(note.id)}
                            disabled={saveRelation.isPending}
                            className={cn(
                              "gap-2 rounded-xl border-purple-300 hover:bg-purple-100 hover:border-purple-400",
                              "opacity-0 group-hover:opacity-100 transition-all"
                            )}
                          >
                            <Link2 className="h-4 w-4" />
                            Connect
                            <ArrowRight className="h-3 w-3 opacity-60" />
                          </Button>
                        </QuickTooltip>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
