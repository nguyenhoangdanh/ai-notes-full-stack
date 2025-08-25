'use client'

import { BarChart3, Calendar, Factory, Filter, Grid, Plus, Search, Target, Trash2, Users, Download, Settings, RefreshCw, Archive } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns'
import { 
  useWorksheets, 
  useRealtimeAnalytics, 
  useArchiveOldWorksheets,
  useDeleteWorksheet 
} from '@/hooks/use-worksheet'
import { useFactories, useGroups } from '@/hooks/use-worksheet'
import { Badge, Button, EmptyState, PageHeader, Panel, SearchInput, SkeletonCard, StatCard, Toolbar, ToolbarSection } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DatePickerWithRange } from '@/components/ui/date-picker'
import { WorksheetCard } from '@/components/worksheet/WorksheetCard'
import { AdminWorksheetAnalytics } from '@/components/worksheet/AdminWorksheetAnalytics'
import { BulkActionsBar } from '@/components/admin/BulkActionsBar'
import { toast } from 'sonner'
import type { WorkSheet, WorkSheetStatus, DateRange } from '@/types/worksheet.types'

export default function AdminWorksheetsPage() {
  const router = useRouter()
  
  // Filters and view state
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<WorkSheetStatus | 'ALL'>('ALL')
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('ALL')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedWorksheets, setSelectedWorksheets] = useState<Set<string>>(new Set())
  const [showAnalytics, setShowAnalytics] = useState(true)

  // Data fetching
  const { data: worksheets = [], isLoading, error, refetch } = useWorksheets({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    factoryId: selectedFactoryId === 'ALL' ? undefined : selectedFactoryId,
    date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  })

  const { data: analytics, isLoading: isLoadingAnalytics } = useRealtimeAnalytics({
    factoryId: selectedFactoryId === 'ALL' ? undefined : selectedFactoryId,
    date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  })

  const { data: factories = [] } = useFactories()
  const { data: groups = [] } = useGroups()

  // Mutations
  const archiveOldWorksheets = useArchiveOldWorksheets()
  const deleteWorksheet = useDeleteWorksheet()

  // Filtered worksheets with performance optimization
  const filteredWorksheets = useMemo(() => {
    let filtered = [...worksheets]
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(worksheet => 
        worksheet.group.name.toLowerCase().includes(searchLower) ||
        worksheet.factory.name.toLowerCase().includes(searchLower) ||
        worksheet.group.code.toLowerCase().includes(searchLower) ||
        worksheet.createdBy.firstName.toLowerCase().includes(searchLower) ||
        worksheet.createdBy.lastName.toLowerCase().includes(searchLower)
      )
    }

    if (selectedGroupId !== 'ALL') {
      filtered = filtered.filter(worksheet => worksheet.groupId === selectedGroupId)
    }
    
    return filtered
  }, [worksheets, search, selectedGroupId])

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const total = filteredWorksheets.length
    const active = filteredWorksheets.filter(w => w.status === 'ACTIVE').length
    const completed = filteredWorksheets.filter(w => w.status === 'COMPLETED').length
    const archived = filteredWorksheets.filter(w => w.status === 'ARCHIVED').length
    const totalWorkers = filteredWorksheets.reduce((acc, w) => acc + w.totalWorkers, 0)
    const avgEfficiency = analytics?.summary.overallEfficiency || 0
    
    return { total, active, completed, archived, totalWorkers, avgEfficiency }
  }, [filteredWorksheets, analytics])

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedWorksheets.size === 0) return
    
    try {
      await Promise.all(
        Array.from(selectedWorksheets).map(id => deleteWorksheet.mutateAsync(id))
      )
      toast.success(`Deleted ${selectedWorksheets.size} worksheets`)
      setSelectedWorksheets(new Set())
      refetch()
    } catch (error) {
      toast.error('Failed to delete worksheets')
    }
  }

  const handleBulkArchive = async () => {
    if (!dateRange.from) return
    
    try {
      const archiveDate = format(subWeeks(dateRange.from, 2), 'yyyy-MM-dd')
      const result = await archiveOldWorksheets.mutateAsync(archiveDate)
      toast.success(`Archived ${result.count} old worksheets`)
      refetch()
    } catch (error) {
      toast.error('Failed to archive worksheets')
    }
  }

  const handleWorksheetSelect = (worksheetId: string, selected: boolean) => {
    const newSelection = new Set(selectedWorksheets)
    if (selected) {
      newSelection.add(worksheetId)
    } else {
      newSelection.delete(worksheetId)
    }
    setSelectedWorksheets(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedWorksheets.size === filteredWorksheets.length) {
      setSelectedWorksheets(new Set())
    } else {
      setSelectedWorksheets(new Set(filteredWorksheets.map(w => w.id)))
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
    }
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Admin: Worksheets"
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

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
          ← Back to Admin
        </Button>
      </div>

      <PageHeader
        title="Worksheet Management"
        subtitle="Comprehensive worksheet administration and analytics"
        description="Manage production worksheets across all factories, monitor performance, and analyze productivity metrics."
        icon={Grid}
        badge={{ text: 'Admin', variant: 'destructive' }}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              icon={Download}
              onClick={() => toast.info('Export functionality coming soon')}
            >
              Export
            </Button>
            <Button 
              variant="cta" 
              icon={Plus}
              onClick={() => router.push('/worksheets/create')}
            >
              New Worksheet
            </Button>
          </div>
        }
      />

      {/* Analytics Overview */}
      {showAnalytics && analytics && (
        <AdminWorksheetAnalytics 
          analytics={analytics}
          isLoading={isLoadingAnalytics}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatCard
          title="Total Worksheets"
          value={stats.total}
          subtitle="All worksheets"
          icon={Grid}
          iconColor="text-primary-600"
        />
        
        <StatCard
          title="Active"
          value={stats.active}
          subtitle="In progress"
          icon={Clock}
          iconColor="text-success"
        />
        
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle="Finished"
          icon={Target}
          iconColor="text-blue-600"
        />
        
        <StatCard
          title="Archived"
          value={stats.archived}
          subtitle="Historical"
          icon={Archive}
          iconColor="text-gray-600"
        />
        
        <StatCard
          title="Total Workers"
          value={stats.totalWorkers}
          subtitle="All workers"
          icon={Users}
          iconColor="text-orange-600"
        />
        
        <StatCard
          title="Avg Efficiency"
          value={`${Math.round(stats.avgEfficiency)}%`}
          subtitle="Overall performance"
          icon={BarChart3}
          iconColor="text-purple-600"
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedWorksheets.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedWorksheets.size}
          totalCount={filteredWorksheets.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedWorksheets(new Set())}
          actions={[
            {
              label: 'Delete Selected',
              icon: Trash2,
              variant: 'destructive',
              onClick: handleBulkDelete,
              requiresConfirmation: true,
              confirmationTitle: 'Delete Worksheets',
              confirmationDescription: `Are you sure you want to delete ${selectedWorksheets.size} worksheets? This action cannot be undone.`
            },
            {
              label: 'Archive Old',
              icon: Archive,
              variant: 'outline',
              onClick: handleBulkArchive
            }
          ]}
        />
      )}

      {/* Main Worksheets Panel */}
      <Panel
        title="All Worksheets"
        subtitle={`${filteredWorksheets.length} worksheets found`}
        icon={Grid}
        toolbar={
          <Toolbar size="sm" justify="between">
            <ToolbarSection>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={handleDateRangeChange}
                className="w-64"
              />
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
              <Select value={selectedFactoryId} onValueChange={setSelectedFactoryId}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Factory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Factories</SelectItem>
                  {factories.map(factory => (
                    <SelectItem key={factory.id} value={factory.id}>
                      {factory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Groups</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
                  icon={Grid}
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                />
              </div>

              <Button 
                variant="outline"
                size="sm" 
                icon={RefreshCw}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </ToolbarSection>
          </Toolbar>
        }
      >
        {/* Loading State */}
        {isLoading ? (
          <div className={`space-y-4 ${viewMode === 'grid' ? 'md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6' : ''}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="h-48" />
            ))}
          </div>
        ) : filteredWorksheets.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={search ? Search : Grid}
              title={search ? "No worksheets found" : "No worksheets"}
              description={
                search 
                  ? "Try adjusting your search terms or filters."
                  : "No worksheets found for the selected criteria. Create a new worksheet to get started."
              }
              action={{
                label: search ? "Clear Search" : "Create Worksheet",
                onClick: search ? () => setSearch('') : () => router.push('/worksheets/create'),
                icon: search ? Search : Plus,
                variant: "primary"
              }}
              secondaryAction={
                search ? {
                  label: "Create Worksheet",
                  onClick: () => router.push('/worksheets/create'),
                  icon: Plus
                } : undefined
              }
            />
          </div>
        ) : (
          <div className={`space-y-4 ${viewMode === 'grid' ? 'md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6' : ''}`}>
            {filteredWorksheets.map((worksheet) => (
              <div key={worksheet.id} className="relative">
                <input
                  type="checkbox"
                  checked={selectedWorksheets.has(worksheet.id)}
                  onChange={(e) => handleWorksheetSelect(worksheet.id, e.target.checked)}
                  className="absolute top-2 left-2 z-10 rounded"
                />
                <WorksheetCard
                  worksheet={worksheet}
                  viewMode={viewMode}
                  onClick={() => router.push(`/worksheets/${worksheet.id}`)}
                  onEdit={() => router.push(`/worksheets/${worksheet.id}/edit`)}
                  onAnalytics={() => router.push(`/worksheets/${worksheet.id}/analytics`)}
                  onMobileView={() => router.push(`/mobile/worksheets/${worksheet.id}`)}
                  className="ml-6"
                />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Archive Old Worksheets Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="fixed bottom-4 right-4">
            <Archive className="w-4 h-4 mr-2" />
            Archive Old
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Old Worksheets</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive all worksheets older than 2 weeks. Archived worksheets can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkArchive}>
              Archive Old Worksheets
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
