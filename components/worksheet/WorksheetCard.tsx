'use client'

import { Clock, Users, Target, Factory, Calendar, MoreVertical, Edit, BarChart3, Smartphone } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import type { WorkSheet, WorkSheetStatus } from '@/types/worksheet.types'

interface WorksheetCardProps {
  worksheet: WorkSheet
  viewMode: 'grid' | 'list'
  onClick: () => void
  onEdit?: () => void
  onAnalytics?: () => void
  onMobileView?: () => void
  className?: string
}

export function WorksheetCard({ 
  worksheet, 
  viewMode, 
  onClick, 
  onEdit, 
  onAnalytics, 
  onMobileView,
  className = '' 
}: WorksheetCardProps) {
  
  const getStatusConfig = (status: WorkSheetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { 
          color: 'success' as const, 
          label: 'Active',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'COMPLETED':
        return { 
          color: 'default' as const, 
          label: 'Completed',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case 'ARCHIVED':
        return { 
          color: 'secondary' as const, 
          label: 'Archived',
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800'
        }
      default:
        return { 
          color: 'default' as const, 
          label: status,
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800'
        }
    }
  }

  const statusConfig = getStatusConfig(worksheet.status)
  
  // Calculate completion percentage
  const completionRate = worksheet._count 
    ? Math.round((worksheet._count.records / (worksheet.totalWorkers * 11)) * 100) // 11 hours max
    : 0

  const efficiency = worksheet.targetOutputPerHour && worksheet._count?.records
    ? Math.round((worksheet._count.records / worksheet.targetOutputPerHour) * 100)
    : 0

  if (viewMode === 'list') {
    return (
      <Card 
        className={`
          mobile-optimized-card cursor-pointer transition-all duration-200 hover:shadow-md 
          ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}
        `}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Status Indicator */}
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  worksheet.status === 'ACTIVE' ? 'bg-green-500' :
                  worksheet.status === 'COMPLETED' ? 'bg-blue-500' : 
                  'bg-gray-400'
                }`} />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {worksheet.group.name}
                  </h3>
                  <Badge variant={statusConfig.color} size="sm">
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Factory className="w-3 h-3" />
                    <span className="truncate">{worksheet.factory.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(worksheet.date), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{worksheet.shiftType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="w-3 h-3" />
                    <span>{worksheet.totalWorkers} workers</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Target className="w-3 h-3" />
                    <span>{completionRate}% complete</span>
                  </div>
                  {efficiency > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <BarChart3 className="w-3 h-3" />
                      <span>{efficiency}% efficiency</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onAnalytics && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAnalytics() }}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                  )}
                  {onMobileView && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMobileView() }}>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile View
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar */}
          {completionRate > 0 && (
            <div className="mt-3">
              <Progress value={completionRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card 
      className={`
        mobile-optimized-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1
        group ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}
      `}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {worksheet.group.name}
              </h3>
              <Badge variant={statusConfig.color} size="sm">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {worksheet.group.team.name} • {worksheet.group.team.line.name}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onAnalytics && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAnalytics() }}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
              )}
              {onMobileView && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMobileView() }}>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile View
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Factory and Date Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Factory className="w-3 h-3" />
              <span className="truncate">{worksheet.factory.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(worksheet.date), 'MMM dd')}</span>
            </div>
          </div>

          {/* Shift and Workers */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{worksheet.shiftType.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <Users className="w-3 h-3" />
              <span>{worksheet.totalWorkers} workers</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Performance Metrics */}
          {efficiency > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target className="w-3 h-3" />
                <span>Efficiency</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${
                  efficiency >= 100 ? 'text-green-600' :
                  efficiency >= 80 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {efficiency}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
