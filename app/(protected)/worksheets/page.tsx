'use client'

import { Plus, Grid, List, Clock, Users, Target, Smartphone, Factory, Search, Filter, RefreshCw } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { useWorksheets, useMyTodayWorksheets } from '@/hooks/use-worksheet'
import { Badge, Button, EmptyState, PageHeader, Panel, SearchInput, SkeletonCard, StatCard, Toolbar, ToolbarSection } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorksheetCard } from '@/components/worksheet/WorksheetCard'
import { WorksheetMobileView } from '@/components/worksheet/WorksheetMobileView'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { WorkSheet, WorkSheetStatus } from '@/types/worksheet.types'

export default function WorksheetsPage() {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<WorkSheetStatus | 'ALL'>('ALL')
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlyToday, setShowOnlyToday] = useState(true)

  // Smart data fetching - use today's worksheets for better performance when possible
  const todayQuery = useMyTodayWorksheets()
  const allWorksheetsQuery = useWorksheets({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    factoryId: selectedFactoryId === 'ALL' ? undefined : selectedFactoryId,
    date: showOnlyToday ? new Date().toISOString().split('T')[0] : undefined
  })

  const { 
    data: worksheets = [], 
    isLoading, 
    error,
    refetch
  } = showOnlyToday ? todayQuery : allWorksheetsQuery

  // Performance-optimized filtering with useMemo
  const filteredWorksheets = useMemo(() => {
    if (!worksheets) return []
    
    let filtered = [...worksheets]
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(worksheet => 
        worksheet.group.name.toLowerCase().includes(searchLower) ||
        worksheet.factory.name.toLowerCase().includes(searchLower) ||
        worksheet.date.includes(search) ||
        worksheet.group.code.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [worksheets, search])

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const total = filteredWorksheets.length
    const active = filteredWorksheets.filter(w => w.status === 'ACTIVE').length
    const completed = filteredWorksheets.filter(w => w.status === 'COMPLETED').length
    const totalWorkers = filteredWorksheets.reduce((acc, w) => acc + w.totalWorkers, 0)
    
    return { total, active, completed, totalWorkers }
  }, [filteredWorksheets])

  const handleCreateWorksheet = () => {
    router.push('/worksheets/create')
  }

  const handleWorksheetClick = (worksheetId: string) => {
    router.push(`/worksheets/${worksheetId}`)
  }

  const getStatusColor = (status: WorkSheetStatus) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'COMPLETED': return 'default'
      case 'ARCHIVED': return 'secondary'
      default: return 'default'
    }
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Worksheets"
          subtitle="Error loading worksheets"
          description={error instanceof Error ? error.message : 'An unknown error occurred'}
          icon={Grid}
        />
        <EmptyState
          icon={Grid}
          title="Error loading worksheets"
          description="Please try refreshing the page or contact support if the problem persists."
          action={{
            label: "Refresh Page",
            onClick: () => refetch(),
            variant: "primary",
            icon: RefreshCw
          }}
        />
      </div>
    )
  }

  // Mobile-optimized loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-fade-in">
          <div className="skeleton h-8 w-64 rounded mb-4"></div>
          <div className="skeleton h-4 w-96 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>

        <SkeletonCard className="h-48" />
        
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  // Mobile view component
  if (isMobile) {
    return (
      <WorksheetMobileView
        worksheets={filteredWorksheets}
        stats={stats}
        search={search}
        onSearchChange={setSearch}
        onWorksheetClick={handleWorksheetClick}
        onCreateWorksheet={handleCreateWorksheet}
        isLoading={isLoading}
        showOnlyToday={showOnlyToday}
        onToggleToday={setShowOnlyToday}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>

      <PageHeader
        title="Production Worksheets"
        subtitle="Manage daily production worksheets across all factories and groups"
        description="Track worker productivity, monitor outputs, and analyze performance metrics in real-time."
        icon={Grid}
        badge={{ text: 'Production', variant: 'success' }}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              icon={isMobile ? Smartphone : Factory}
              onClick={() => router.push('/mobile/worksheets')}
              className="hidden sm:flex"
            >
              Mobile View
            </Button>
            <Button 
              variant="cta" 
              icon={Plus}
              onClick={handleCreateWorksheet}
            >
              New Worksheet
            </Button>
          </div>
        }
      />

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Worksheets"
          value={stats.total}
          subtitle={showOnlyToday ? "Today" : "All time"}
          icon={Grid}
          iconColor="text-primary-600"
        />
        
        <StatCard
          title="Active Worksheets"
          value={stats.active}
          subtitle="In progress"
          icon={Clock}
          iconColor="text-success"
        />
        
        <StatCard
          title="Completed Today"
          value={stats.completed}
          subtitle="Finished worksheets"
          icon={Target}
          iconColor="text-blue-600"
        />
        
        <StatCard
          title="Total Workers"
          value={stats.totalWorkers}
          subtitle="Active workers"
          icon={Users}
          iconColor="text-orange-600"
        />
      </div>

      {/* Main Worksheets Panel */}
      <Panel
        title="Worksheets"
        subtitle={`${filteredWorksheets.length} worksheets ${showOnlyToday ? 'today' : 'total'}`}
        icon={Grid}
        toolbar={
          <Toolbar size="sm" justify="between">
            <ToolbarSection>
              <div className="flex items-center gap-2">
                <Button
                  variant={showOnlyToday ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyToday(true)}
                >
                  Today
                </Button>
                <Button
                  variant={!showOnlyToday ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyToday(false)}
                >
                  All
                </Button>
              </div>
            </ToolbarSection>

            <ToolbarSection>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search worksheets..."
                size="sm"
                className="w-64"
              />
            </ToolbarSection>

            <ToolbarSection>
              {!showOnlyToday && (
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as WorkSheetStatus | 'ALL')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  icon={Grid}
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                />
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  icon={List}
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                />
              </div>

              <Button 
                variant="cta" 
                size="sm" 
                icon={Plus}
                onClick={handleCreateWorksheet}
              >
                New Worksheet
              </Button>
            </ToolbarSection>
          </Toolbar>
        }
      >
        {/* Worksheets Content */}
        {filteredWorksheets.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={search ? Search : Grid}
              title={search ? "No worksheets found" : "No worksheets yet"}
              description={
                search 
                  ? "Try adjusting your search terms to find worksheets."
                  : showOnlyToday
                    ? "No worksheets created for today. Create your first worksheet to start tracking production."
                    : "No worksheets found. Create your first worksheet to begin production tracking."
              }
              action={{
                label: search ? "Clear Search" : "Create Worksheet",
                onClick: search ? () => setSearch('') : handleCreateWorksheet,
                icon: search ? Search : Plus,
                variant: "primary"
              }}
              secondaryAction={
                search ? {
                  label: "Create Worksheet",
                  onClick: handleCreateWorksheet,
                  icon: Plus
                } : undefined
              }
            />
          </div>
        ) : (
          <div className={`space-y-4 ${viewMode === 'grid' ? 'md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6' : ''}`}>
            {filteredWorksheets.map((worksheet) => (
              <WorksheetCard
                key={worksheet.id}
                worksheet={worksheet}
                viewMode={viewMode}
                onClick={() => handleWorksheetClick(worksheet.id)}
                onEdit={() => router.push(`/worksheets/${worksheet.id}/edit`)}
                onAnalytics={() => router.push(`/worksheets/${worksheet.id}/analytics`)}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
