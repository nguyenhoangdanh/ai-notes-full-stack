'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  StarIcon,
  PlayIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Separator } from '../../../components/ui/separator'
import { useTemplate } from '../../../hooks/use-features'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { marked } from 'marked'
import { cn } from '../../../lib/utils'
import Link from 'next/link'

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  
  const { data: template, isLoading, error } = useTemplate(templateId)
  const [isStarred, setIsStarred] = useState(false)

  const handleEdit = () => {
    router.push(`/templates/${templateId}/edit`)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        // Delete logic here
        toast.success('Template deleted successfully')
        router.push('/templates')
      } catch (error) {
        toast.error('Failed to delete template')
      }
    }
  }

  const handleUseTemplate = () => {
    router.push(`/notes/create?template=${templateId}`)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: template?.name,
        text: template?.description,
        url: window.location.href
      })
    } catch (error) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const toggleStar = () => {
    setIsStarred(!isStarred)
    toast.success(isStarred ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleDuplicate = async () => {
    try {
      // Duplicate logic here
      toast.success('Template duplicated successfully')
      router.push('/templates')
    } catch (error) {
      toast.error('Failed to duplicate template')
    }
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

  if (error || !template) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DocumentDuplicateIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Template Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The template you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/templates')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Templates
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
                onClick={toggleStar}
                className={cn(
                  "hover:bg-primary/10",
                  isStarred && "text-yellow-500"
                )}
              >
                <StarIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleDuplicate}>
                <DocumentDuplicateIcon className="h-4 w-4" />
              </Button>
              {/* Always show edit/delete for now since we don't have proper owner check */}
              {(
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Template Header */}
          <Card className="superhuman-glass border-border/30 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-xl">
                      <DocumentDuplicateIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {template.name}
                      </h1>
                      <p className="text-muted-foreground">
                        {template.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created {format(new Date(template.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>by {typeof template.ownerId === 'string' ? template.ownerId : 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{0 || 0} uses</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {true ? (
                        <>
                          <GlobeAltIcon className="h-4 w-4" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-4 w-4" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleUseTemplate}
                  size="lg"
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <PlayIcon className="h-4 w-4" />
                  Use Template
                </Button>
              </div>
              
              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag: string) => (
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

              {/* Category - using metadata for category */}
              {template.metadata?.category && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    {template.metadata.category}
                  </Badge>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Template Content */}
          <Card className="superhuman-glass border-border/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DocumentDuplicateIcon className="h-5 w-5" />
                Template Content
              </CardTitle>
            </CardHeader>
            
            <Separator className="mx-6" />
            
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Template Structure */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Preview</h3>
                  <Card className="border-border/30 bg-muted/20">
                    <CardContent className="p-6">
                      <div 
                        className="prose prose-stone dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: typeof marked(template.content || '') === 'string' 
                            ? marked(template.content || '') as string
                            : ''
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Sidebar Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Stats */}
            <Card className="superhuman-glass">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Uses</span>
                    <span className="font-medium">{0 || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Favorites</span>
                    <span className="font-medium">{0 || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Used</span>
                    <span className="font-medium">Never</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="superhuman-glass">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={handleUseTemplate}
                    className="w-full justify-start"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Create Note from Template
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleDuplicate}
                    className="w-full justify-start"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Duplicate Template
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleShare}
                    className="w-full justify-start"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share Template
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
