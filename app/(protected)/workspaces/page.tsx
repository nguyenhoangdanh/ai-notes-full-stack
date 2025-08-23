'use client'

import { Plus, Folder, Users, Settings, Search, Star, MoreHorizontal, Clock, Activity } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

// Import new UI components
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Panel } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { Toolbar, ToolbarSection } from '../../components/ui/Toolbar'
import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton'

import { useWorkspaces } from '../../hooks/use-workspaces'

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

  // Mock stats based on workspaces data
  const stats = {
    totalWorkspaces: workspaces.length || 3,
    defaultWorkspace: 'Personal Notes',
    recentActivity: workspaces.length > 0 ? '2 hours ago' : 'No activity',
    lastUpdated: workspaces.length > 0 ? new Date() : null
  }

  const handleCreateWorkspace = () => {
    router.push('/workspaces/create')
  }

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/workspaces/${workspaceId}`)
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Workspaces"
          subtitle="Error loading workspaces"
          description={error instanceof Error ? error.message : 'An unknown error occurred'}
          icon={Folder}
        />
        <EmptyState
          icon={Folder}
          title="Error loading workspaces"
          description="Please try refreshing the page or contact support if the problem persists."
          action={{
            label: "Refresh Page",
            onClick: () => window.location.reload(),
            variant: "primary"
          }}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-fade-in">
          <div className="skeleton h-8 w-64 rounded mb-4"></div>
          <div className="skeleton h-4 w-96 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>

        <SkeletonCard className="h-48" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header with breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-subtle mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>

      <PageHeader
        title="Workspaces"
        subtitle="Organize your notes into separate workspaces for better productivity"
        description="Create dedicated spaces for different projects, teams, or topics to keep your work organized and focused."
        icon={Folder}
        badge={{ text: 'Organized', variant: 'success' }}
        actions={
          <Button 
            variant="cta" 
            icon={Plus}
            onClick={handleCreateWorkspace}
          >
            New Workspace
          </Button>
        }
      />

      {/* StatCards as per reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Workspaces"
          value={stats.totalWorkspaces}
          subtitle="Active workspaces"
          icon={Folder}
          iconColor="text-primary-600"
        />
        
        <StatCard
          title="Default Workspace"
          value={stats.defaultWorkspace}
          subtitle="Active workspace"
          icon={Star}
          iconColor="text-warning"
        />
        
        <StatCard
          title="Recent Activity"
          value={stats.recentActivity}
          subtitle="Last updated notes"
          icon={Activity}
          iconColor="text-accent"
        />
      </div>

      {/* Manage Workspaces Panel */}
      <Panel
        title="Manage Workspaces"
        subtitle={`${filteredWorkspaces.length} workspaces`}
        icon={Folder}
        toolbar={
          <Toolbar size="sm" justify="end">
            <ToolbarSection>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workspaces..."
                size="sm"
                className="w-64"
              />
            </ToolbarSection>

            <ToolbarSection>
              <Button 
                variant="cta" 
                size="sm" 
                icon={Plus}
                onClick={handleCreateWorkspace}
              >
                New Workspace
              </Button>
            </ToolbarSection>
          </Toolbar>
        }
      >
        {/* Workspaces Content */}
        {filteredWorkspaces.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={search ? Search : Folder}
              title={search ? "No workspaces found" : "No workspaces yet"}
              description={
                search 
                  ? "Try adjusting your search terms to find workspaces."
                  : "Create your first workspace to start organizing your notes by project or topic."
              }
              action={{
                label: search ? "Clear Search" : "Create Workspace",
                onClick: search ? () => setSearch('') : handleCreateWorkspace,
                icon: search ? Search : Plus,
                variant: "primary"
              }}
              secondaryAction={
                search ? {
                  label: "Create Workspace",
                  onClick: handleCreateWorkspace,
                  icon: Plus
                } : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Workspace List Items */}
            {filteredWorkspaces.map((workspace, index) => (
              <div
                key={workspace.id}
                className="panel p-4 hover-lift transition-modern cursor-pointer group"
                onClick={() => handleWorkspaceClick(workspace.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Workspace Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary-600/10 flex items-center justify-center">
                      <Folder className="w-6 h-6 text-primary-600" />
                    </div>
                    
                    {/* Workspace Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-text group-hover:text-primary-600 transition-colors">
                          {workspace.name}
                        </h3>
                        
                        {/* Default badge for first workspace */}
                        {index === 0 && (
                          <Badge variant="warning" size="sm">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        
                        <Badge variant="default" size="sm">
                          {workspace.privacy || 'Personal'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-text-muted mb-2">
                        {workspace.description || 'Active workspace'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-text-subtle">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Created {formatDistanceToNow(new Date(workspace.createdAt || Date.now()), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Personal access</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Settings}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/workspaces/${workspace.id}/settings`)
                      }}
                      aria-label="Workspace settings"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={MoreHorizontal}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Show context menu
                      }}
                      aria-label="More options"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add more workspaces CTA at the bottom */}
            <div className="pt-4 border-t border-border-soft">
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={handleCreateWorkspace}
                className="w-full justify-center"
              >
                Create Another Workspace
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
