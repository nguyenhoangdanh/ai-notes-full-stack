'use client'

import { Clock, Users, Target, Factory, Calendar, Plus, Search, Filter, RefreshCw, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import type { WorkSheet, WorkSheetStatus } from '@/types/worksheet.types'

interface WorksheetMobileViewProps {
  worksheets: WorkSheet[]
  stats: {
    total: number
    active: number
    completed: number
    totalWorkers: number
  }
  search: string
  onSearchChange: (value: string) => void
  onWorksheetClick: (id: string) => void
  onCreateWorksheet: () => void
  isLoading: boolean
  showOnlyToday: boolean
  onToggleToday: (value: boolean) => void
}

export function WorksheetMobileView({
  worksheets,
  stats,
  search,
  onSearchChange,
  onWorksheetClick,
  onCreateWorksheet,
  isLoading,
  showOnlyToday,
  onToggleToday
}: WorksheetMobileViewProps) {
  const [activeTab, setActiveTab] = useState('all')

  const getStatusConfig = (status: WorkSheetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { 
          color: 'success' as const, 
          label: 'Active',
          bgColor: 'bg-green-50 dark:bg-green-950/20'
        }
      case 'COMPLETED':
        return { 
          color: 'default' as const, 
          label: 'Done',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20'
        }
      case 'ARCHIVED':
        return { 
          color: 'secondary' as const, 
          label: 'Archived',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20'
        }
      default:
        return { 
          color: 'default' as const, 
          label: status,
          bgColor: 'bg-gray-50 dark:bg-gray-950/20'
        }
    }
  }

  const filteredWorksheets = worksheets.filter(worksheet => {
    if (activeTab === 'active') return worksheet.status === 'ACTIVE'
    if (activeTab === 'completed') return worksheet.status === 'COMPLETED'
    return true
  })

  if (isLoading) {
    return (
      <div className="mobile-worksheet-grid">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 space-y-4 z-10">
          <div className="flex items-center justify-between">
            <SkeletonCard className="h-8 w-32" />
            <SkeletonCard className="h-9 w-20" />
          </div>
          <SkeletonCard className="h-9 w-full" />
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-20" />
            ))}
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-worksheet-grid">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4 space-y-4">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Worksheets</h1>
              <p className="text-sm text-muted-foreground">
                {showOnlyToday ? "Today's production" : "All worksheets"}
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={onCreateWorksheet}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search worksheets..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={showOnlyToday ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleToday(true)}
              className="flex-1"
            >
              Today
            </Button>
            <Button
              variant={!showOnlyToday ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleToday(false)}
              className="flex-1"
            >
              All
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.active}</div>
              <div className="text-sm text-green-600 dark:text-green-500">Active</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.completed}</div>
              <div className="text-sm text-blue-600 dark:text-blue-500">Done</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.totalWorkers}</div>
              <div className="text-sm text-orange-600 dark:text-orange-500">Workers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.total}</div>
              <div className="text-sm text-purple-600 dark:text-purple-500">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({worksheets.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="completed">Done ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <WorksheetMobileList 
              worksheets={filteredWorksheets} 
              onWorksheetClick={onWorksheetClick}
              onCreateWorksheet={onCreateWorksheet}
              search={search}
            />
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <WorksheetMobileList 
              worksheets={filteredWorksheets} 
              onWorksheetClick={onWorksheetClick}
              onCreateWorksheet={onCreateWorksheet}
              search={search}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <WorksheetMobileList 
              worksheets={filteredWorksheets} 
              onWorksheetClick={onWorksheetClick}
              onCreateWorksheet={onCreateWorksheet}
              search={search}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function WorksheetMobileList({ 
  worksheets, 
  onWorksheetClick, 
  onCreateWorksheet,
  search 
}: {
  worksheets: WorkSheet[]
  onWorksheetClick: (id: string) => void
  onCreateWorksheet: () => void
  search: string
}) {
  if (worksheets.length === 0) {
    return (
      <EmptyState
        icon={search ? Search : Target}
        title={search ? "No worksheets found" : "No worksheets"}
        description={
          search 
            ? "Try adjusting your search terms."
            : "Create your first worksheet to start tracking production."
        }
        action={{
          label: search ? "Clear Search" : "Create Worksheet",
          onClick: search ? () => {} : onCreateWorksheet,
          icon: search ? Search : Plus,
          variant: "primary"
        }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {worksheets.map((worksheet) => {
        const statusConfig = getStatusConfig(worksheet.status)
        const completionRate = worksheet._count 
          ? Math.round((worksheet._count.records / (worksheet.totalWorkers * 11)) * 100)
          : 0

        return (
          <Card 
            key={worksheet.id}
            className={`mobile-record-card cursor-pointer border-l-4 ${
              worksheet.status === 'ACTIVE' ? 'border-l-green-500' :
              worksheet.status === 'COMPLETED' ? 'border-l-blue-500' : 
              'border-l-gray-400'
            } ${statusConfig.bgColor}`}
            onClick={() => onWorksheetClick(worksheet.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {worksheet.group.name}
                      </h3>
                      <Badge variant={statusConfig.color} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {worksheet.group.team.name}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{worksheet.factory.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{format(new Date(worksheet.date), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs">{worksheet.shiftType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{worksheet.totalWorkers} workers</span>
                  </div>
                </div>

                {/* Progress */}
                {completionRate > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-1.5" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
