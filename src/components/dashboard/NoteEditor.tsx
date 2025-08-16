import { useState, useEffect } from 'react'
import { useNotes } from '../../contexts/NotesContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AISuggestions } from '../ai/AISuggestions'
import { 
  X, 
  Tag as TagIcon, 
  Calendar,
  ArrowLeft,
  Sparkles,
  Robot,
  Clock,
  Brain
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { useIsMobile } from '../../hooks/use-mobile'
import { toast } from 'sonner'

interface NoteEditorProps {
  noteId: string
  onClose: () => void
}

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { notes, updateNote, getRelatedNotes } = useNotes()
  const isMobile = useIsMobile()
  
  const note = notes.find(n => n.id === noteId)
  const relatedNotes = getRelatedNotes(noteId)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags)
    }
  }, [note])

  // Auto-save functionality
  useEffect(() => {
    if (!note) return

    const timeoutId = setTimeout(async () => {
      if (title !== note.title || content !== note.content || tags !== note.tags) {
        setIsAutoSaving(true)
        try {
          await updateNote(noteId, { title, content, tags })
          toast.success('Note saved automatically')
        } catch (error) {
          toast.error('Failed to save note')
        } finally {
          setIsAutoSaving(false)
        }
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [title, content, tags, note, updateNote, noteId])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleApplySuggestion = async (type: string, suggestion: string) => {
    try {
      switch (type) {
        case 'title':
          setTitle(suggestion)
          break
        case 'content':
          setContent(suggestion)
          break
        case 'tags':
          // Parse tags from suggestion
          const newTags = suggestion.split(',').map(tag => tag.trim().toLowerCase())
          setTags(prev => [...new Set([...prev, ...newTags])])
          break
        case 'structure':
          // Apply structured content
          setContent(suggestion)
          break
        default:
          toast.info('Suggestion type not yet implemented')
      }
    } catch (error) {
      toast.error('Failed to apply suggestion')
    }
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Note not found</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Robot className="h-5 w-5 text-primary" weight="duotone" />
              <span className="text-sm font-medium text-foreground">AI Note Editor</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAutoSaving && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                <span>Saving...</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </span>
            </div>

            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="text-2xl font-bold border-none px-0 py-2 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Separator />

            {/* Category & Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {note.category && (
                  <Badge variant="secondary" className="capitalize">
                    {note.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {new Date(note.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" weight="fill" />
                <span>AI-Enhanced</span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Tags</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag..."
                    className="w-24 h-6 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddTag}
                    className="h-6 px-2 text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="min-h-[400px] resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Related Notes Sidebar */}
        {!isMobile && (
          <div className="w-80 border-l border-border bg-card/30 flex flex-col">
            {/* AI Suggestions */}
            <div className="p-4 border-b border-border">
              <AISuggestions
                noteId={noteId}
                noteTitle={title}
                noteContent={content}
                noteTags={tags}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>

            {/* Related Notes */}
            {relatedNotes.length > 0 && (
              <div className="flex-1 p-4 overflow-y-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-accent" weight="fill" />
                      <span>Related Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {relatedNotes.map((relatedNote) => (
                      <div
                        key={relatedNote.id}
                        className="p-3 rounded-md border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">
                          {relatedNote.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {relatedNote.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          {relatedNote.category && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {relatedNote.category}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(relatedNote.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}