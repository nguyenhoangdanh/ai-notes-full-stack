import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { List, Eye, Link2, Trash2, Plus } from 'lucide-react'
import { useStoredRelations, useSmartRelatedNotes, useSaveRelation, useDeleteRelation } from '@/hooks'

interface RelationsListProps {
  noteId: string
}

export function RelationsList({ noteId }: RelationsListProps) {
  const { data: storedRelations, isLoading: storedLoading } = useStoredRelations(noteId)
  const { data: relatedNotes, isLoading: relatedLoading } = useSmartRelatedNotes(noteId)
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
    ...(storedRelations || []).map((r: any) => ({ ...r, type: 'stored' })),
    ...(relatedNotes || []).map((r: any) => ({ ...r, type: 'suggested' }))
  ]

  return (
    <div className="space-y-6">
      {/* Stored Relations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Established Relations
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Relation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!storedRelations || storedRelations.length === 0 ? (
            <div className="text-center py-8">
              <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No established relations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {storedRelations.map((relation: any) => (
                <div 
                  key={relation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{relation.targetNote?.title || 'Untitled'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {relation.relationshipType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Strength: {(relation.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteRelation(relation.targetNoteId)}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Suggested Relations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!relatedNotes || relatedNotes.length === 0 ? (
            <div className="text-center py-8">
              <List className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No suggested relations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatedNotes.map((note: any) => (
                <div 
                  key={note.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{note.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {note.content?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Similarity: {(note.similarity * 100).toFixed(0)}%
                      </Badge>
                      {note.sharedTags && note.sharedTags.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {note.sharedTags.length} shared tags
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
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