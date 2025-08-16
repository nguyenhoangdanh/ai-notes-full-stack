import { useNotes, Note } from '../../contexts/NotesContext'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { 
  Calendar, 
  Tag, 
  MoreHorizontal,
  Clock
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

interface NotesListProps {
  searchQuery: string
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
}

export function NotesList({ searchQuery, selectedNoteId, onSelectNote }: NotesListProps) {
  const { notes, searchNotes, deleteNote } = useNotes()
  
  const displayedNotes = searchQuery ? searchNotes(searchQuery) : notes
  const sortedNotes = displayedNotes.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId)
      if (selectedNoteId === noteId) {
        onSelectNote('')
      }
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'meetings': return 'bg-blue-100 text-blue-800'
      case 'ideas': return 'bg-purple-100 text-purple-800'
      case 'tasks': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (sortedNotes.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center">
            {searchQuery ? (
              <Tag className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Calendar className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium text-foreground">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {searchQuery 
              ? 'Try adjusting your search terms or create a new note.'
              : 'Create your first note to get started with AI-powered organization.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {searchQuery ? `${sortedNotes.length} results` : `${sortedNotes.length} notes`}
        </h2>
        {searchQuery && (
          <Badge variant="secondary" className="text-xs">
            Searching: "{searchQuery}"
          </Badge>
        )}
      </div>

      <Separator />

      {/* Notes List */}
      <div className="space-y-3">
        {sortedNotes.map((note) => (
          <Card
            key={note.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedNoteId === note.id 
                ? 'ring-2 ring-primary shadow-md' 
                : 'hover:bg-card/80'
            }`}
            onClick={() => onSelectNote(note.id)}
          >
            <CardContent className="p-4">
              {/* Note Header */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground line-clamp-1 flex-1">
                  {note.title || 'Untitled'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>

              {/* Note Content Preview */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {note.content || 'No content'}
              </p>

              {/* Note Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {note.category && (
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${getCategoryColor(note.category)}`}
                    >
                      {note.category}
                    </Badge>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {note.tags.length}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Tags Preview */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}