'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  DocumentTextIcon,
  CalendarIcon,
  SparklesIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'
import { useCategory, useCategoryNotes } from '@/hooks/use-smart'
import { Badge, Button, Card, CardContent, CardHeader, Input } from '@/components'
import { CardTitle } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string
  
  const { data: category, isLoading, error } = useCategory(categoryId)
  const { data: notes, isLoading: notesLoading } = useCategoryNotes(categoryId)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes?.filter((note: any) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleEdit = () => {
    router.push(`/categories/${categoryId}/edit`)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this category? Notes will not be affected.')) {
      try {
        // Delete logic here
        toast.success('Category deleted successfully')
        router.push('/categories')
      } catch (error) {
        toast.error('Failed to delete category')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TagIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Category Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The category you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/categories')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = {
    totalNotes: notes?.length || 0,
    recentNotes: notes?.filter((note: any) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(note.updatedAt) > weekAgo
    }).length || 0,
    avgNotesPerWeek: Math.round((notes?.length || 0) / 4), // Rough estimate
    uniqueWorkspaces: new Set(notes?.map((note: any) => note.workspaceId)).size
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
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

          {/* Category Header */}
          <Card className="superhuman-glass border-border/30 shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
                      <TagIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                          {category.name}
                        </h1>
                        {category.isAuto && (
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400">
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {category.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created {format(new Date(category.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>{stats.totalNotes} notes</span>
                    </div>
                    {category.keywords && category.keywords.length > 0 && (
                      <div className="flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        <span>{category.keywords.length} keywords</span>
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  {category.keywords && category.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {category.keywords.map((keyword: string) => (
                        <Badge 
                          key={keyword} 
                          variant="outline"
                          className="text-xs bg-primary/5 hover:bg-primary/10"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link href={`/notes/create?category=${categoryId}`}>
                  <Button className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    New Note
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="superhuman-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalNotes}</div>
                <p className="text-xs text-muted-foreground">
                  In this category
                </p>
              </CardContent>
            </Card>

            <Card className="superhuman-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <SparklesIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.recentNotes}</div>
                <p className="text-xs text-muted-foreground">
                  Notes this week
                </p>
              </CardContent>
            </Card>

            <Card className="superhuman-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.uniqueWorkspaces}</div>
                <p className="text-xs text-muted-foreground">
                  Cross-workspace usage
                </p>
              </CardContent>
            </Card>

            <Card className="superhuman-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats.avgNotesPerWeek}</div>
                <p className="text-xs text-muted-foreground">
                  Avg notes/week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="notes" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-3 w-fit">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10"
                  />
                  <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="secondary" size="icon-sm">
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="notes" className="space-y-4">
              {notesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredNotes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <DocumentTextIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery ? 'No notes found' : 'No notes in this category'}
                    </h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery 
                        ? 'Try adjusting your search terms'
                        : 'Create your first note with this category'
                      }
                    </p>
                    {!searchQuery && (
                      <Link href={`/notes/create?category=${categoryId}`}>
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Note
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note: any) => (
                    <Card key={note.id} className="superhuman-glass hover:shadow-lg transition-all duration-200 group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-clamp-1">
                              {note.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{format(new Date(note.updatedAt), 'MMM d')}</span>
                              {note.workspace && (
                                <>
                                  <span>•</span>
                                  <span>{note.workspace.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => window.location.href = `/notes/${note.id}`}
                          >
                            <Link href={`/notes/${note.id}`}>
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {note.content.substring(0, 120)}...
                        </p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{note.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <ChartBarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Analytics charts will be displayed here
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Related Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Related categories analysis coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Category Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Auto-categorization</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Control how AI automatically assigns this category to notes
                      </p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            defaultChecked={category.isAuto}
                            disabled 
                          />
                          <span className="text-sm">Enable AI auto-categorization</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Keywords</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Keywords help AI understand when to apply this category
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.keywords?.map((keyword: string) => (
                          <Badge key={keyword} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleEdit}>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
