'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, FolderIcon, UsersIcon, CogIcon } from '@heroicons/react/24/outline'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { useWorkspaces } from '../../hooks/use-workspaces'
import { formatDistanceToNow } from 'date-fns'

export default function WorkspacesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  
  const { 
    data: workspaces = [], 
    isLoading,
    error 
  } = useWorkspaces()

  const filteredWorkspaces = workspaces.filter(workspace => 
    search ? workspace.name.toLowerCase().includes(search.toLowerCase()) ||
             workspace.description?.toLowerCase().includes(search.toLowerCase()) : true
  )

  const handleCreateWorkspace = () => {
    router.push('/workspaces/create')
  }

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/workspaces/${workspaceId}`)
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error loading workspaces</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">
            {filteredWorkspaces.length} {filteredWorkspaces.length === 1 ? 'workspace' : 'workspaces'}
          </p>
        </div>
        <Button onClick={handleCreateWorkspace}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search workspaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FolderIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No workspaces found</h3>
            <p className="text-muted-foreground mt-2">
              {search ? 'Try adjusting your search terms' : 'Get started by creating your first workspace'}
            </p>
            <Button onClick={handleCreateWorkspace} className="mt-4">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleWorkspaceClick(workspace.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FolderIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {workspace.privacy || 'personal'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/workspaces/${workspace.id}/settings`)
                    }}
                  >
                    <CogIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {workspace.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="h-3 w-3" />
                    <span>Personal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Workspace</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}