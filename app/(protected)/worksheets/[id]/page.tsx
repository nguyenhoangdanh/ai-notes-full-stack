'use client'

import { ArrowLeft, Grid, BarChart3, Users, Clock, Target, CheckCircle, AlertCircle, Download, RefreshCw, Settings, Calendar, Factory, Smartphone } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useParams } from 'next/navigation'
import { Button, Badge, Panel, SkeletonCard, StatCard, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useWorksheetById, useWorksheetAnalytics, useCompleteWorksheet } from '@/hooks/use-worksheet'
import { WorksheetGridComponent } from '@/components/worksheet/WorksheetGridComponent'
import { WorksheetAnalytics } from '@/components/worksheet/WorksheetAnalytics'
import { WorksheetWorkers } from '@/components/worksheet/WorksheetWorkers'
import { WorksheetPerformance } from '@/components/worksheet/WorksheetPerformance'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from 'sonner'
import type { WorkSheet, WorkSheetStatus } from '@/types/worksheet.types'

export default function WorksheetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const worksheetId = params.id as string
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const [currentTab, setCurrentTab] = useState('grid')

  // Data fetching with error handling
  const { 
    data: worksheet, 
    isLoading: isLoadingWorksheet, 
    error: worksheetError,
    refetch: refetchWorksheet 
  } = useWorksheetById(worksheetId)
  
  const { 
    data: analytics, 
    isLoading: isLoadingAnalytics 
  } = useWorksheetAnalytics(worksheetId)
  
  // Mutations
  const completeWorksheetMutation = useCompleteWorksheet()

  // Calculate performance stats
  const performanceStats = useMemo(() => {
    if (!worksheet || !analytics) return null

    const completionRate = analytics.summary.completionRate
    const efficiency = analytics.summary.efficiency
    const totalOutput = analytics.summary.totalOutput
    const targetOutput = analytics.summary.targetOutput

    return {
      completionRate,
      efficiency,
      totalOutput,
      targetOutput,
      status: worksheet.status,
      totalWorkers: worksheet.totalWorkers,
      completedRecords: analytics.summary.completedRecords,
      totalRecords: analytics.summary.totalRecords
    }
  }, [worksheet, analytics])

  const getStatusConfig = (status: WorkSheetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { 
          color: 'success', 
          icon: Clock, 
          label: 'Active Production',
          description: 'Worksheet is currently in progress'
        }
      case 'COMPLETED':
        return { 
          color: 'default', 
          icon: CheckCircle, 
          label: 'Completed',
          description: 'All production records completed'
        }
      case 'ARCHIVED':
        return { 
          color: 'secondary', 
          icon: AlertCircle, 
          label: 'Archived',
          description: 'Worksheet has been archived'
        }
      default:
        return { 
          color: 'default', 
          icon: Clock, 
          label: status,
          description: 'Unknown status'
        }
    }
  }

  const handleCompleteWorksheet = async () => {
    if (!worksheet) return
    
    try {
      await completeWorksheetMutation.mutateAsync(worksheet.id)
      toast.success('Worksheet completed successfully')
      refetchWorksheet()
    } catch (error) {
      toast.error('Failed to complete worksheet')
    }
  }

  const handleExport = () => {
    toast.info('Export functionality coming soon')
  }

  const handleMobileView = () => {
    router.push(`/mobile/worksheets/${worksheetId}`)
  }

  if (worksheetError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Worksheet</h2>
          <p className="text-muted-foreground mb-4">
            {worksheetError instanceof Error ? worksheetError.message : 'Failed to load worksheet'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => refetchWorksheet()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => router.push('/worksheets')}>
              Back to Worksheets
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoadingWorksheet) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <SkeletonCard className="h-8 w-16" />
          <SkeletonCard className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>

        <SkeletonCard className="h-96" />
      </div>
    )
  }

  if (!worksheet) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Worksheet Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested worksheet could not be found.
        </p>
        <Button onClick={() => router.push('/worksheets')}>
          Back to Worksheets
        </Button>
      </div>
    )
  }

  const statusConfig = getStatusConfig(worksheet.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Worksheets</span>
            <span>/</span>
            <span className="text-foreground font-medium">{worksheet.group.name}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">
                {worksheet.group.name} - {worksheet.group.team.name}
              </h1>
              <Badge variant={statusConfig.color as any} className="flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(worksheet.date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Factory className="w-4 h-4" />
                <span>{worksheet.factory.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{worksheet.shiftType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMobile && (
              <Button variant="outline" size="sm" onClick={handleMobileView}>
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile View
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            {worksheet.status === 'ACTIVE' && (
              <Button 
                onClick={handleCompleteWorksheet}
                disabled={completeWorksheetMutation.isPending}
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={() => router.push(`/worksheets/${worksheet.id}/edit`)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {performanceStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Completion Rate"
            value={`${Math.round(performanceStats.completionRate)}%`}
            subtitle={`${performanceStats.completedRecords}/${performanceStats.totalRecords} records`}
            icon={Target}
            iconColor="text-blue-600"
          />
          
          <StatCard
            title="Efficiency"
            value={`${Math.round(performanceStats.efficiency)}%`}
            subtitle={`${performanceStats.totalOutput}/${performanceStats.targetOutput} output`}
            icon={BarChart3}
            iconColor="text-success"
          />
          
          <StatCard
            title="Total Workers"
            value={performanceStats.totalWorkers}
            subtitle="Active workers"
            icon={Users}
            iconColor="text-orange-600"
          />
          
          <StatCard
            title="Status"
            value={statusConfig.label}
            subtitle={statusConfig.description}
            icon={StatusIcon}
            iconColor={performanceStats.status === 'ACTIVE' ? 'text-success' : 'text-muted-foreground'}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Panel title="Worksheet Details" className="p-0">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Production Grid</span>
              <span className="sm:hidden">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Workers</span>
              <span className="sm:hidden">Workers</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="grid" className="mt-0">
              <WorksheetGridComponent 
                worksheetId={worksheetId} 
                readonly={worksheet.status !== 'ACTIVE'}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              {isLoadingAnalytics ? (
                <div className="space-y-4">
                  <SkeletonCard className="h-64" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonCard className="h-48" />
                    <SkeletonCard className="h-48" />
                  </div>
                </div>
              ) : analytics ? (
                <WorksheetAnalytics analytics={analytics} worksheet={worksheet} />
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No analytics data available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="workers" className="mt-0">
              <WorksheetWorkers worksheet={worksheet} />
            </TabsContent>

            <TabsContent value="performance" className="mt-0">
              {analytics ? (
                <WorksheetPerformance analytics={analytics} worksheet={worksheet} />
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Panel>
    </div>
  )
}
