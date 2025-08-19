import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Merge, Eye, AlertTriangle } from 'lucide-react'

interface DuplicateGroup {
  id: string
  similarity: number
  notes: Array<{
    id: string
    title: string
    content: string
    createdAt: string
    wordCount?: number
  }>
}

interface DuplicateGroupCardProps {
  group: DuplicateGroup
  onMerge: () => void
}

export function DuplicateGroupCard({ group, onMerge }: DuplicateGroupCardProps) {
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'text-red-600'
    if (similarity >= 0.8) return 'text-orange-600'
    return 'text-yellow-600'
  }

  const getSimilarityBadge = (similarity: number) => {
    if (similarity >= 0.9) return 'destructive'
    if (similarity >= 0.8) return 'default'
    return 'secondary'
  }

  return (
    <Card className="border-l-4 border-l-orange-400">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Duplicate Group
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getSimilarityBadge(group.similarity) as any}>
                {(group.similarity * 100).toFixed(0)}% similarity
              </Badge>
              <Badge variant="outline">
                {group.notes.length} notes
              </Badge>
            </div>
          </div>
          <Button onClick={onMerge} className="flex items-center gap-2">
            <Merge className="h-4 w-4" />
            Merge
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {group.notes.map((note, index) => (
            <div 
              key={note.id}
              className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{note.title}</h4>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs">
                      Original
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {note.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.wordCount && (
                    <span>{note.wordCount} words</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Similarity Details */}
        <div className="mt-4 p-3 bg-background border rounded-lg">
          <h5 className="text-sm font-medium mb-2">Similarity Analysis</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Content similarity:</span>
              <span className={`ml-2 font-medium ${getSimilarityColor(group.similarity)}`}>
                {(group.similarity * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Title similarity:</span>
              <span className={`ml-2 font-medium ${getSimilarityColor(group.similarity * 0.95)}`}>
                {(group.similarity * 95).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}