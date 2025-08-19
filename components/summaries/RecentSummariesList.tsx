import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Eye, Edit } from 'lucide-react'
import { useNotes } from '@/hooks'

export function RecentSummariesList() {
  const { data: notes, isLoading } = useNotes()

  // Filter notes that have summaries (for now, show all notes as examples)
  const notesWithSummaries = notes?.slice(0, 5) || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (notesWithSummaries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No summaries yet</h3>
          <p className="text-muted-foreground text-center">
            Generate your first AI summary to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notesWithSummaries.slice(0, 10).map((note) => (
        <Card key={note.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {note.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                  <Badge variant="secondary" className="text-xs">
                    Summary Available
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {/* Mock summary content */}
                This is a sample AI-generated summary of the note content. 
                It provides key insights and highlights the main points 
                discussed in the original note...
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
              <span>Summary length: ~150 words</span>
              <span>Generated 2 days ago</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}