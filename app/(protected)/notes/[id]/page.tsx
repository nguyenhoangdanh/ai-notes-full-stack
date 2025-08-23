'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  ShareIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  BookmarkIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Separator } from '../../../components/ui/separator'
import { useNote } from '../../../hooks/use-notes'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { marked } from 'marked'
import { cn } from '../../../lib/utils'

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  
  const { data: note, isLoading, error } = useNote(noteId)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    if (note?.content) {
      // Calculate reading time (average 200 words per minute)
      const wordCount = note.content.split(/\s+/).length
      setReadingTime(Math.ceil(wordCount / 200))
    }
  }, [note?.content])

  const handleEdit = () => {
    router.push(`/notes/${noteId}/edit`)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        // Delete logic here
        toast.success('Note deleted successfully')
        router.push('/notes')
      } catch (error) {
        toast.error('Failed to delete note')
      }
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: note?.title,
        text: note?.content?.substring(0, 100) + '...',
        url: window.location.href
      })
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Bookmark removed' : 'Note bookmarked')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DocumentTextIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Note Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The note you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/notes')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={toggleBookmark}
                className={cn(
                  "hover:bg-primary/10",
                  isBookmarked && "text-yellow-500"
                )}
              >
                <BookmarkIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleEdit}>
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Note Content */}
          <Card className="superhuman-glass border-border/30 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {note.title}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {note.updatedAt !== note.createdAt && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag: string) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            
            <Separator className="mx-6" />
            
            <CardContent className="pt-6">
              {/* Content */}
              <div 
                className="prose prose-stone dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: typeof marked(note.content || '') === 'string' 
                    ? marked(note.content || '') as string
                    : ''
                }}
              />
            </CardContent>
          </Card>

          {/* Sidebar Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workspace Info */}
            {note.workspaceId && (
              <Card className="superhuman-glass">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Workspace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">Workspace ID: {note.workspaceId}</p>
                    <p className="text-sm text-muted-foreground">
                      Associated workspace
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <Card className="superhuman-glass">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Generate Summary
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Find Relations
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Suggest Tags
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
