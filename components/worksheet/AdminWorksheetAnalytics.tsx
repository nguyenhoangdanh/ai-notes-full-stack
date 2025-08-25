'use client'

import { BarChart3, Factory, Users, Target, TrendingUp, X, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import type { RealtimeAnalytics } from '@/types/worksheet.types'

interface AdminWorksheetAnalyticsProps {
  analytics: RealtimeAnalytics
  isLoading?: boolean
  onClose?: () => void
  className?: string
}

export function AdminWorksheetAnalytics({ 
  analytics, 
  isLoading = false, 
  onClose,
  className = ''
}: AdminWorksheetAnalyticsProps) {
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const factoryData = analytics.factoryBreakdown.map(factory => ({
    name: factory.name,
    efficiency: factory.efficiency,
    worksheets: factory.worksheets,
    workers: factory.workers,
    target: factory.targetOutput,
    actual: factory.actualOutput
  }))

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 75) return 'text-blue-600'
    if (efficiency >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return 'success'
    if (efficiency >= 75) return 'default'
    if (efficiency >= 60) return 'warning'
    return 'destructive'
  }

  return (
    <Card className={`${className} border-2 border-primary/20`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Real-time Analytics Dashboard</CardTitle>
            <Badge variant="outline" className="ml-2">Live</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Worksheets</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {analytics.summary.totalWorksheets}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {analytics.summary.activeFactories} factories active
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Total Workers</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {analytics.summary.totalWorkers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Active production
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Total Output</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {analytics.summary.totalActualOutput.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Target: {analytics.summary.totalTargetOutput.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Overall Efficiency</p>
                <p className={`text-2xl font-bold ${getEfficiencyColor(analytics.summary.overallEfficiency)}`}>
                  {Math.round(analytics.summary.overallEfficiency)}%
                </p>
                <Badge variant={getEfficiencyBadge(analytics.summary.overallEfficiency) as any} className="mt-1">
                  {analytics.summary.overallEfficiency >= 90 ? 'Excellent' :
                   analytics.summary.overallEfficiency >= 75 ? 'Good' :
                   analytics.summary.overallEfficiency >= 60 ? 'Average' : 'Needs Improvement'}
                </Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Factory Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Factory Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={factoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'efficiency' ? `${value}%` : value,
                    name === 'efficiency' ? 'Efficiency' :
                    name === 'target' ? 'Target Output' :
                    name === 'actual' ? 'Actual Output' :
                    name === 'worksheets' ? 'Worksheets' : 'Workers'
                  ]}
                />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                <Bar dataKey="worksheets" fill="#10b981" name="Worksheets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Factory Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Factory Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.factoryBreakdown.map((factory) => (
                  <div key={factory.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{factory.name}</h4>
                        <Badge variant={getEfficiencyBadge(factory.efficiency) as any} size="sm">
                          {Math.round(factory.efficiency)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="block font-medium text-foreground">{factory.worksheets}</span>
                          <span>Worksheets</span>
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">{factory.workers}</span>
                          <span>Workers</span>
                        </div>
                        <div>
                          <span className="block font-medium text-foreground">{factory.actualOutput}</span>
                          <span>Output</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Progress value={(factory.actualOutput / factory.targetOutput) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium">{activity.factory} - {activity.group}</p>
                      <p className="text-sm text-muted-foreground">{activity.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Production Status:</span>
              <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                {analytics.summary.totalWorksheets} active worksheets across {analytics.summary.activeFactories} factories
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Workforce:</span>
              <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                {analytics.summary.totalWorkers} workers producing at {Math.round(analytics.summary.overallEfficiency)}% efficiency
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Output Performance:</span>
              <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                {Math.round((analytics.summary.totalActualOutput / analytics.summary.totalTargetOutput) * 100)}% of target achieved
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
