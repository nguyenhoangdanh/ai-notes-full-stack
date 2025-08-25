'use client'

import { Users, User, Clock, Target, BarChart3, AlertCircle, CheckCircle, Plus, Edit } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { EmptyState } from '@/components/ui/empty-state'
import type { WorkSheet } from '@/types/worksheet.types'

interface WorksheetWorkersProps {
  worksheet: WorkSheet
  className?: string
}

export function WorksheetWorkers({ worksheet, className = '' }: WorksheetWorkersProps) {
  const [search, setSearch] = useState('')
  const [showAddWorker, setShowAddWorker] = useState(false)

  // Mock worker performance data - in real app this would come from analytics
  const workersWithPerformance = worksheet.items?.map(item => {
    const completedRecords = item._count?.records || 0
    const totalRecords = 11 // 11 hours max
    const completionRate = Math.round((completedRecords / totalRecords) * 100)
    const efficiency = Math.round(Math.random() * 40 + 60) // Mock efficiency 60-100%
    
    return {
      ...item,
      completionRate,
      efficiency,
      totalOutput: Math.round(Math.random() * 100 + 50), // Mock output
      averagePerHour: Math.round((Math.random() * 15 + 10) * 10) / 10 // Mock avg per hour
    }
  }) || []

  const filteredWorkers = workersWithPerformance.filter(worker => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      worker.worker.firstName.toLowerCase().includes(searchLower) ||
      worker.worker.lastName.toLowerCase().includes(searchLower) ||
      worker.worker.employeeCode.toLowerCase().includes(searchLower)
    )
  })

  const getPerformanceColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 75) return 'text-blue-600'
    if (efficiency >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (efficiency: number) => {
    if (efficiency >= 90) return { variant: 'success' as const, label: 'Excellent' }
    if (efficiency >= 75) return { variant: 'default' as const, label: 'Good' }
    if (efficiency >= 60) return { variant: 'warning' as const, label: 'Average' }
    return { variant: 'destructive' as const, label: 'Below Avg' }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workers ({filteredWorkers.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage workers assigned to this worksheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workers..."
            className="w-64"
          />
          
          {worksheet.status === 'ACTIVE' && (
            <Button 
              onClick={() => setShowAddWorker(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Worker
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold">{workersWithPerformance.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                <p className="text-2xl font-bold">
                  {Math.round(workersWithPerformance.reduce((acc, w) => acc + w.efficiency, 0) / workersWithPerformance.length || 0)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-sage">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold">
                  {workersWithPerformance.filter(w => w.efficiency >= 90).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Support</p>
                <p className="text-2xl font-bold">
                  {workersWithPerformance.filter(w => w.efficiency < 60).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers List */}
      {filteredWorkers.length === 0 ? (
        <EmptyState
          icon={search ? User : Users}
          title={search ? "No workers found" : "No workers assigned"}
          description={
            search 
              ? "Try adjusting your search terms."
              : "No workers have been assigned to this worksheet yet."
          }
          action={
            worksheet.status === 'ACTIVE' ? {
              label: search ? "Clear Search" : "Add Worker",
              onClick: search ? () => setSearch('') : () => setShowAddWorker(true),
              icon: search ? User : Plus,
              variant: "primary"
            } : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((item) => {
            const performanceBadge = getPerformanceBadge(item.efficiency)
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Worker Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(item.worker.firstName, item.worker.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {item.worker.firstName} {item.worker.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.worker.employeeCode}
                          </p>
                        </div>
                      </div>

                      <Badge variant={performanceBadge.variant}>
                        {performanceBadge.label}
                      </Badge>
                    </div>

                    {/* Assignment Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Product:</span>
                        <span className="font-medium">{item.product.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Process:</span>
                        <span className="font-medium">{item.process.name}</span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completion</span>
                          <span className="font-medium">{item.completionRate}%</span>
                        </div>
                        <Progress value={item.completionRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Efficiency</div>
                          <div className={`font-semibold ${getPerformanceColor(item.efficiency)}`}>
                            {item.efficiency}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Output</div>
                          <div className="font-semibold">{item.totalOutput}</div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="text-muted-foreground">Avg per Hour</div>
                        <div className="font-semibold">{item.averagePerHour}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    {worksheet.status === 'ACTIVE' && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Worker Modal/Form - Placeholder */}
      {showAddWorker && (
        <Card className="border-2 border-dashed border-primary/50">
          <CardContent className="p-6 text-center">
            <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Add Worker</h3>
            <p className="text-muted-foreground mb-4">
              Worker assignment functionality will be implemented here
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowAddWorker(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddWorker(false)}>
                Add Worker
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
