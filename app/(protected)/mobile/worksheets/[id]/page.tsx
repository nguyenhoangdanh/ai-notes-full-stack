'use client'

import { ArrowLeft, Users, Target, Clock, CheckCircle, BarChart3, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWorksheetById, useWorksheetAnalytics } from '@/hooks/use-worksheet'
import type { WorkSheetStatus } from '@/types/worksheet.types'

export default function MobileWorksheetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const worksheetId = params.id as string

  const { data: worksheet, isLoading, error, refetch } = useWorksheetById(worksheetId)
  const { data: analytics } = useWorksheetAnalytics(worksheetId)

  const getStatusConfig = (status: WorkSheetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'success' as const, label: 'Active', bgColor: 'bg-green-100 dark:bg-green-900/20' }
      case 'COMPLETED':
        return { color: 'default' as const, label: 'Completed', bgColor: 'bg-blue-100 dark:bg-blue-900/20' }
      case 'ARCHIVED':
        return { color: 'secondary' as const, label: 'Archived', bgColor: 'bg-gray-100 dark:bg-gray-900/20' }
      default:
        return { color: 'default' as const, label: status, bgColor: 'bg-gray-100 dark:bg-gray-900/20' }
    }
  }

  if (isLoading) {
    return (
      <div className="mobile-worksheet-grid">
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !worksheet) {
    return (
      <div className="mobile-worksheet-grid">
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold">Error</h1>
          </div>
        </div>
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Error Loading Worksheet</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Worksheet not found'}
          </p>
          <div className="space-y-2">
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/mobile/worksheets')} className="w-full">
              Back to Worksheets
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(worksheet.status)
  const completionRate = analytics?.summary.completionRate || 0
  const efficiency = analytics?.summary.efficiency || 0

  return (
    <div className="mobile-worksheet-grid">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">{worksheet.group.name}</h1>
              <p className="text-sm text-muted-foreground">{worksheet.factory.name}</p>
            </div>
            <Badge variant={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{format(new Date(worksheet.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{worksheet.totalWorkers} workers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Performance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <div className="text-xl font-bold text-green-700 dark:text-green-400">
                {Math.round(completionRate)}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">Completion</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                {Math.round(efficiency)}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-500">Efficiency</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <div className="text-xl font-bold text-purple-700 dark:text-purple-400">
                {analytics?.summary.totalOutput || 0}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-500">Total Output</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-orange-600 mb-2" />
              <div className="text-xl font-bold text-orange-700 dark:text-orange-400">
                {worksheet.totalWorkers}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-500">Workers</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Efficiency</span>
                <span className="font-medium">{Math.round(efficiency)}%</span>
              </div>
              <Progress value={efficiency} className="h-3" />
            </div>

            {analytics && (
              <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Completed Records</div>
                  <div className="font-semibold">{analytics.summary.completedRecords}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Records</div>
                  <div className="font-semibold">{analytics.summary.totalRecords}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Worksheet Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Worksheet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Factory</div>
                <div className="font-medium">{worksheet.factory.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Group</div>
                <div className="font-medium">{worksheet.group.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Team</div>
                <div className="font-medium">{worksheet.group.team.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Line</div>
                <div className="font-medium">{worksheet.group.team.line.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Shift Type</div>
                <div className="font-medium">{worksheet.shiftType.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Created By</div>
                <div className="font-medium">
                  {worksheet.createdBy.firstName} {worksheet.createdBy.lastName}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={() => router.push(`/worksheets/${worksheet.id}`)}
            className="w-full"
          >
            View Full Details
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/mobile/worksheets')}
            className="w-full"
          >
            Back to Worksheets
          </Button>
        </div>
      </div>
    </div>
  )
}
