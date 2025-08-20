import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { List, Eye, Link2, Trash2, Plus } from 'lucide-react'
import { useStoredRelations, useRelatedNotes, useSaveRelation, useDeleteRelation } from '@/hooks'

interface RelationsListProps {
  noteId: string
}

export function RelationsList({ noteId }: RelationsListProps) {
  const { data: storedRelations, isLoading: storedLoading } = useStoredRelations(noteId)
  const { data: relatedNotes, isLoading: relatedLoading } = useRelatedNotes(noteId)
  const saveRelation = useSaveRelation()
  const deleteRelation = useDeleteRelation()

  const handleDeleteRelation = async (targetNoteId: string) => {
    try {
      await deleteRelation.mutateAsync({ 
        sourceNoteId: noteId, 
        targetNoteId 
      })
    } catch (error) {
      console.error('Failed to delete relation:', error)
    }
  }

  if (storedLoading || relatedLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const allRelations = [
    ...(Array.isArray(storedRelations) ? storedRelations : []).map((r: any) => ({ ...r, type: 'stored' })),
    ...(Array.isArray(relatedNotes) ? relatedNotes : []).map((r: any) => ({ ...r, type: 'suggested' }))
  ]

  return (
    <div className="space-y-6">
      {/* Stored Relations */}
      <Card className="superhuman-glass superhuman-glow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Established Relations
              </span>
            </CardTitle>
            <Button size="sm" className="superhuman-gradient superhuman-hover shadow-md hover:shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Relation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!storedRelations || !Array.isArray(storedRelations) || storedRelations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <Link2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">No established relations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {storedRelations.map((relation: any) => (
                <div 
                  key={relation.id}
                  className="flex items-center justify-between p-4 border rounded-lg superhuman-gradient-subtle superhuman-hover border-primary/10 hover:border-primary/20"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{relation.targetNote?.title || 'Untitled'}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5 text-primary">
                        {relation.relationshipType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Strength: <span className="text-primary font-medium">{(relation.strength * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="superhuman-hover hover:bg-primary/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteRelation(relation.targetNoteId)}
                      className="superhuman-hover hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Relations */}
      <Card className="superhuman-glass superhuman-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Suggested Relations
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!relatedNotes || !Array.isArray(relatedNotes) || relatedNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center">
                <List className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No suggested relations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatedNotes.map((note: any) => (
                <div 
                  key={note.id}
                  className="flex items-center justify-between p-4 border rounded-lg superhuman-gradient-subtle superhuman-hover border-primary/10 hover:border-primary/20"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{note.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {note.content?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
                        Similarity: {(note.similarity * 100).toFixed(0)}%
                      </Badge>
                      {note.sharedTags && note.sharedTags.length > 0 && (
                        <Badge variant="outline" className="text-xs border-accent/30 bg-accent/5 text-accent">
                          {note.sharedTags.length} shared tags
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="superhuman-hover hover:bg-primary/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // saveRelation.mutate({
                        //   noteId,
                        //   targetNoteId: note.id,
                        //   relationshipType: 'related'
                        // })
                      }}
                      className="superhuman-hover border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Link2 className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}