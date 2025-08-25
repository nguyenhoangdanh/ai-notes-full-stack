'use client'

import { BarChart3, TrendingUp, Users, Target, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { WorksheetAnalytics as AnalyticsType, WorkSheet } from '@/types/worksheet.types'

interface WorksheetAnalyticsProps {
  analytics: AnalyticsType
  worksheet: WorkSheet
  className?: string
}

export function WorksheetAnalytics({ analytics, worksheet, className = '' }: WorksheetAnalyticsProps) {
  
  // Prepare chart data
  const hourlyData = analytics.hourlyData.map(hour => ({
    hour: `H${hour.workHour}`,
    target: hour.targetOutput,
    actual: hour.actualOutput,
    efficiency: hour.efficiency,
    workers: hour.workerCount
  }))

  const workerPerformanceData = analytics.workerPerformance.map(worker => ({
    id: worker.workerId,
    name: `Worker ${worker.workerId.slice(-4)}`,
    output: worker.totalOutput,
    efficiency: worker.efficiency,
    hoursWorked: worker.hoursWorked,
    avgPerHour: worker.averagePerHour
  }))

  // Performance distribution for pie chart
  const performanceDistribution = [
    { name: 'Excellent (>95%)', value: analytics.workerPerformance.filter(w => w.efficiency > 95).length, color: '#22c55e' },
    { name: 'Good (80-95%)', value: analytics.workerPerformance.filter(w => w.efficiency >= 80 && w.efficiency <= 95).length, color: '#3b82f6' },
    { name: 'Average (60-80%)', value: analytics.workerPerformance.filter(w => w.efficiency >= 60 && w.efficiency < 80).length, color: '#f59e0b' },
    { name: 'Below Average (<60%)', value: analytics.workerPerformance.filter(w => w.efficiency < 60).length, color: '#ef4444' }
  ]

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'text-green-600'
    if (efficiency >= 80) return 'text-blue-600'
    if (efficiency >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBadgeVariant = (efficiency: number) => {
    if (efficiency >= 100) return 'success'
    if (efficiency >= 80) return 'default'
    if (efficiency >= 60) return 'warning'
    return 'destructive'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(analytics.summary.completionRate)}%</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.summary.completedRecords}/{analytics.summary.totalRecords} records
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={analytics.summary.completionRate} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="glass-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className={`text-2xl font-bold ${getEfficiencyColor(analytics.summary.efficiency)}`}>
                  {Math.round(analytics.summary.efficiency)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.summary.totalOutput}/{analytics.summary.targetOutput} output
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={analytics.summary.efficiency} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="glass-sage">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Output</p>
                <p className="text-2xl font-bold">{analytics.summary.totalOutput.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Target: {analytics.summary.targetOutput.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Badge variant={getEfficiencyBadgeVariant(analytics.summary.efficiency)}>
                {analytics.summary.totalOutput > analytics.summary.targetOutput ? 'Above Target' : 'Below Target'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-muted">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                <p className="text-2xl font-bold">{analytics.summary.totalWorkers}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {Math.round(analytics.summary.totalOutput / analytics.summary.totalWorkers)} per worker
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Peak hour: H{analytics.trends.peakHour.workHour} ({analytics.trends.peakHour.actualOutput})
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hourly Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'target' ? 'Target' : 'Actual']}
                  labelFormatter={(label) => `Hour ${label.replace('H', '')}`}
                />
                <Legend />
                <Bar dataKey="target" fill="#e2e8f0" name="Target" />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Efficiency Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis domain={[0, 150]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Efficiency']}
                  labelFormatter={(label) => `Hour ${label.replace('H', '')}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  name="Efficiency %"
                />
                {/* Efficiency target line */}
                <Line 
                  type="monotone" 
                  dataKey={() => 100} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target (100%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Worker Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Workers']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workerPerformanceData
                .sort((a, b) => b.efficiency - a.efficiency)
                .slice(0, 6)
                .map((worker, index) => (
                  <div key={worker.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {worker.output} units • {worker.hoursWorked}h
                        </div>
                      </div>
                    </div>
                    <Badge variant={getEfficiencyBadgeVariant(worker.efficiency)}>
                      {Math.round(worker.efficiency)}%
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Peak Performance</h4>
              <p className="text-sm text-muted-foreground">
                Hour {analytics.trends.peakHour.workHour} had the highest output with {analytics.trends.peakHour.actualOutput} units
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Lowest Performance</h4>
              <p className="text-sm text-muted-foreground">
                Hour {analytics.trends.lowestHour.workHour} had the lowest output with {analytics.trends.lowestHour.actualOutput} units
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Average Efficiency</h4>
              <p className="text-sm text-muted-foreground">
                Overall efficiency of {Math.round(analytics.summary.efficiency)}% with {analytics.summary.totalWorkers} active workers
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {analytics.summary.efficiency < 80 && (
                <li>• Consider reviewing processes to improve overall efficiency</li>
              )}
              {analytics.trends.peakHour.actualOutput > analytics.trends.lowestHour.actualOutput * 1.5 && (
                <li>• Investigate factors contributing to performance variation between hours</li>
              )}
              {analytics.summary.completionRate < 90 && (
                <li>• Focus on completing remaining records to improve completion rate</li>
              )}
              {analytics.workerPerformance.filter(w => w.efficiency < 60).length > 0 && (
                <li>• Provide additional training for underperforming workers</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
