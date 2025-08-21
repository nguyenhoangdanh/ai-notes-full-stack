import { useNotes, Note } from '../../contexts/NotesContext'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/Button'
import { Separator } from '../ui/separator'
import { 
  Calendar, 
  Tag, 
  MoreHorizontal,
  Clock,
  Star,
  Share,
  Archive
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'

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

  const getTagColor = (tag?: string) => {
    const colors = {
      'meetings': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      'ideas': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      'tasks': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      'projects': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
      'personal': 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
    }
    return colors[tag as keyof typeof colors] || 'bg-muted text-muted-foreground'
  }

  if (sortedNotes.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
            {searchQuery ? (
              <Tag className="h-8 w-8 text-muted-foreground/60" />
            ) : (
              <Calendar className="h-8 w-8 text-muted-foreground/60" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {searchQuery 
                ? 'Try adjusting your search terms or create a new note.'
                : 'Create your first note to get started with AI-powered organization.'
              }
            </p>
          </div>
          {!searchQuery && (
            <Button 
              className="mt-4 rounded-full superhuman-gradient"
              onClick={() => onSelectNote('new')}
            >
              Create your first note
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <h2
          className="text-sm font-medium text-muted-foreground"
          id="notes-list-title"
        >
          {searchQuery ? `${sortedNotes.length} results` : `${sortedNotes.length} notes`}
        </h2>
        {searchQuery && (
          <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
            "{searchQuery}"
          </Badge>
        )}
      </div>

      <Separator className="opacity-60" />

      {/* Notes List */}
      <div
        className="space-y-3"
        role="list"
        aria-labelledby="notes-list-title"
      >
        {sortedNotes.map((note) => (
          <Card
            key={note.id}
            variant="glass"
            className={cn(
              "cursor-pointer superhuman-transition superhuman-hover group relative overflow-hidden",
              selectedNoteId === note.id
                ? 'ring-2 ring-primary/50 bg-primary/5 border-primary/30'
                : 'hover:bg-background/70 border-border/30'
            )}
            role="listitem"
            tabIndex={0}
            onClick={() => onSelectNote(note.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectNote(note.id);
              }
            }}
            aria-label={`Note: ${note.title || 'Untitled'}`}
            aria-describedby={`note-content-${note.id} note-metadata-${note.id}`}
          >
            <CardContent className="p-4">
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground line-clamp-1 flex-1 pr-2">
                  {note.title || 'Untitled'}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 superhuman-transition">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle star toggle
                    }}
                    aria-label="Star note"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle share
                    }}
                    aria-label="Share note"
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                    aria-label={`Delete ${note.title || 'untitled note'}`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Note Content Preview */}
              <p
                className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed"
                id={`note-content-${note.id}`}
              >
                {note.content || 'No content'}
              </p>

              {/* Note Metadata */}
              <div
                className="flex items-center justify-between"
                id={`note-metadata-${note.id}`}
              >
                <div className="flex items-center gap-2" aria-label="Note tags">
                  {note.tags.length > 0 && (
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        getTagColor(note.tags[0])
                      )}
                    >
                      {note.tags[0]}
                    </Badge>
                  )}
                  {note.tags.length > 1 && (
                    <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                      +{note.tags.length - 1}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <time
                    dateTime={note.updatedAt}
                    title={new Date(note.updatedAt).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </time>
                </div>
              </div>

              {/* Tags Preview */}
              {note.tags.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/30">
                  {note.tags.slice(1, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                      +{note.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Selection indicator */}
              {selectedNoteId === note.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
