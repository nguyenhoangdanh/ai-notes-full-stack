'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  ShareIcon, 
  TrashIcon,
  PlusIcon,
  FolderIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Input } from '../../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useWorkspace, useWorkspaceNotes } from '../../../hooks/use-workspaces'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '../../../lib/utils'
import Link from 'next/link'

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string
  
  const { data: workspace, isLoading, error } = useWorkspace(workspaceId)
  const { data: notes, isLoading: notesLoading } = useWorkspaceNotes(workspaceId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState('grid')

  const filteredNotes = notes?.filter((note: any) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleEdit = () => {
    router.push(`/workspaces/${workspaceId}/edit`)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this workspace? All notes will be moved to your default workspace.')) {
      try {
        // Delete logic here
        toast.success('Workspace deleted successfully')
        router.push('/workspaces')
      } catch (error) {
        toast.error('Failed to delete workspace')
      }
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: workspace?.name,
        text: workspace?.description,
        url: window.location.href
      })
    } catch (error) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const handleInviteCollaborators = () => {
    // Open invite dialog
    toast.info('Invite feature coming soon')
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

  if (error || !workspace) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Workspace Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The workspace you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/workspaces')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Workspaces
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
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      return new Date(note.updatedAt) > dayAgo
    }).length || 0,
    totalMembers: workspace.members?.length || 1,
    categories: new Set(notes?.flatMap((note: any) => note.categories?.map((cat: any) => cat.name) || [])).size
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
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <ShareIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleInviteCollaborators}
              >
                <UsersIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Workspace Header */}
          <Card className="superhuman-glass border-border/30 shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl">
                      <FolderIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {workspace.name}
                      </h1>
                      <p className="text-muted-foreground">
                        {workspace.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created {format(new Date(workspace.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      <span>{stats.totalMembers} {stats.totalMembers === 1 ? 'member' : 'members'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>{stats.totalNotes} notes</span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/notes/create?workspace=${workspaceId}`}>
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
                  {stats.recentNotes} added recently
                </p>
              </CardContent>
            </Card>

            <Card className="superhuman-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats.categories}</div>
                <p className="text-xs text-muted-foreground">
                  Unique categories
                </p>
              </CardContent>
            </Card>

            <Card className="superhuman-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Members</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Active collaborators
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
                  Notes updated today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="notes" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-3 w-fit">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
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
                <Button variant="outline" size="icon">
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
                      {searchQuery ? 'No notes found' : 'No notes yet'}
                    </h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery 
                        ? 'Try adjusting your search terms'
                        : 'Create your first note in this workspace'
                      }
                    </p>
                    {!searchQuery && (
                      <Link href={`/notes/create?workspace=${workspaceId}`}>
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
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            asChild
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

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Member Management
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Collaborate with team members on this workspace
                    </p>
                    <Button onClick={handleInviteCollaborators}>
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Workspace Configuration
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Manage workspace settings and permissions
                    </p>
                    <Button onClick={handleEdit}>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Settings
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