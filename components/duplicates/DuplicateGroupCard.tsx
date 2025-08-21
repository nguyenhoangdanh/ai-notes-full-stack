import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
    if (similarity >= 0.9) return 'text-red-500'
    if (similarity >= 0.8) return 'text-orange-500'
    return 'text-yellow-500'
  }

  const getSimilarityBadge = (similarity: number) => {
    if (similarity >= 0.9) return 'destructive'
    if (similarity >= 0.8) return 'default'
    return 'secondary'
  }

  const getBorderColor = (similarity: number) => {
    if (similarity >= 0.9) return 'border-l-red-400'
    if (similarity >= 0.8) return 'border-l-orange-400'
    return 'border-l-yellow-400'
  }

  return (
    <Card className={`border-l-4 ${getBorderColor(group.similarity)} superhuman-glass superhuman-glow card-hover`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Duplicate Group
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={getSimilarityBadge(group.similarity) as any}
                className="superhuman-gradient text-white"
              >
                {(group.similarity * 100).toFixed(0)}% similarity
              </Badge>
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                {group.notes.length} notes
              </Badge>
            </div>
          </div>
          <Button 
            onClick={onMerge} 
            className="flex items-center gap-2 superhuman-gradient superhuman-hover shadow-md hover:shadow-lg"
          >
            <Merge className="h-4 w-4" />
            Merge
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {group.notes.map((note, index) => (
            <div 
              key={note.id}
              className="flex items-start justify-between p-4 superhuman-gradient-subtle rounded-lg border border-primary/10 superhuman-hover"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium truncate text-foreground">{note.title}</h4>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs border-green-400/30 bg-green-400/5 text-green-600">
                      Original
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {note.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <Badge variant="outline" className="border-muted-foreground/20 bg-muted/5">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </Badge>
                  {note.wordCount && (
                    <Badge variant="outline" className="border-muted-foreground/20 bg-muted/5">
                      {note.wordCount} words
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="sm" className="superhuman-hover hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="superhuman-hover hover:bg-accent/10">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Similarity Details */}
        <div className="mt-6 p-4 superhuman-gradient-subtle border border-primary/10 rounded-lg">
          <h5 className="text-sm font-medium mb-3 text-primary">Similarity Analysis</h5>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Content similarity:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    style={{ width: `${group.similarity * 100}%` }}
                  />
                </div>
                <span className={`font-medium ${getSimilarityColor(group.similarity)}`}>
                  {(group.similarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Title similarity:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                    style={{ width: `${group.similarity * 95}%` }}
                  />
                </div>
                <span className={`font-medium ${getSimilarityColor(group.similarity * 0.95)}`}>
                  {(group.similarity * 95).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
