'use client'

import { Target, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import type { WorksheetAnalytics, WorkSheet } from '@/types/worksheet.types'

interface WorksheetPerformanceProps {
  analytics: WorksheetAnalytics
  worksheet: WorkSheet
  className?: string
}

export function WorksheetPerformance({ analytics, worksheet, className = '' }: WorksheetPerformanceProps) {
  
  // Prepare performance data
  const hourlyPerformance = analytics.hourlyData.map(hour => ({
    hour: `H${hour.workHour}`,
    fullHour: hour.workHour,
    efficiency: hour.efficiency,
    target: hour.targetOutput,
    actual: hour.actualOutput,
    variance: hour.actualOutput - hour.targetOutput,
    workers: hour.workerCount,
    variancePercent: hour.targetOutput > 0 ? ((hour.actualOutput - hour.targetOutput) / hour.targetOutput) * 100 : 0
  }))

  // Calculate performance metrics
  const performanceMetrics = {
    overallEfficiency: analytics.summary.efficiency,
    bestHour: analytics.trends.peakHour,
    worstHour: analytics.trends.lowestHour,
    averageOutput: Math.round(analytics.summary.totalOutput / analytics.hourlyData.length),
    varianceSum: hourlyPerformance.reduce((acc, hour) => acc + hour.variance, 0),
    positiveHours: hourlyPerformance.filter(hour => hour.variance > 0).length,
    negativeHours: hourlyPerformance.filter(hour => hour.variance < 0).length
  }

  // Performance trends
  const trend = hourlyPerformance.length > 1 
    ? hourlyPerformance[hourlyPerformance.length - 1].efficiency - hourlyPerformance[0].efficiency
    : 0

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return TrendingUp
    if (trend < -5) return TrendingDown
    return Target
  }

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600'
    if (trend < -5) return 'text-red-600'
    return 'text-gray-600'
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'text-green-600'
    if (efficiency >= 80) return 'text-blue-600'
    if (efficiency >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600'
    if (variance < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const TrendIcon = getTrendIcon(trend)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Efficiency</p>
                <p className={`text-2xl font-bold ${getEfficiencyColor(performanceMetrics.overallEfficiency)}`}>
                  {Math.round(performanceMetrics.overallEfficiency)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className={`h-4 w-4 ${getTrendColor(trend)}`} />
                  <span className={`text-xs ${getTrendColor(trend)}`}>
                    {trend > 0 ? '+' : ''}{Math.round(trend)}% vs start
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Output Variance</p>
                <p className={`text-2xl font-bold ${getVarianceColor(performanceMetrics.varianceSum)}`}>
                  {performanceMetrics.varianceSum > 0 ? '+' : ''}{performanceMetrics.varianceSum}
                </p>
                <p className="text-xs text-muted-foreground">
                  vs target total
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-sage">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Above Target Hours</p>
                <p className="text-2xl font-bold text-green-600">
                  {performanceMetrics.positiveHours}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {hourlyPerformance.length} hours
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-muted">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Below Target Hours</p>
                <p className="text-2xl font-bold text-red-600">
                  {performanceMetrics.negativeHours}
                </p>
                <p className="text-xs text-muted-foreground">
                  need improvement
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Efficiency Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis domain={[0, 150]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Efficiency']}
                  labelFormatter={(label) => `Hour ${label.replace('H', '')}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {/* Target line at 100% */}
                <Line 
                  type="monotone" 
                  dataKey={() => 100} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Output vs Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Output vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyPerformance}>
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
      </div>

      {/* Detailed Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hourly Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hourlyPerformance.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">{hour.hour}</div>
                    <div className="text-xs text-muted-foreground">{hour.workers} workers</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Target:</span>
                      <span className="font-medium">{hour.target}</span>
                      <span className="text-sm text-muted-foreground">Actual:</span>
                      <span className="font-medium">{hour.actual}</span>
                    </div>
                    <Progress value={(hour.actual / hour.target) * 100} className="w-48 h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-semibold ${getEfficiencyColor(hour.efficiency)}`}>
                      {Math.round(hour.efficiency)}%
                    </div>
                    <div className="text-xs text-muted-foreground">efficiency</div>
                  </div>

                  <div className="text-right">
                    <div className={`font-semibold ${getVarianceColor(hour.variance)}`}>
                      {hour.variance > 0 ? '+' : ''}{hour.variance}
                    </div>
                    <div className="text-xs text-muted-foreground">variance</div>
                  </div>

                  <Badge 
                    variant={
                      hour.efficiency >= 100 ? 'success' :
                      hour.efficiency >= 80 ? 'default' :
                      hour.efficiency >= 60 ? 'warning' : 'destructive'
                    }
                  >
                    {hour.efficiency >= 100 ? 'Excellent' :
                     hour.efficiency >= 80 ? 'Good' :
                     hour.efficiency >= 60 ? 'Average' : 'Poor'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Best Performance</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Hour {performanceMetrics.bestHour.workHour} achieved {performanceMetrics.bestHour.actualOutput} units output
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Needs Attention</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Hour {performanceMetrics.worstHour.workHour} had lowest output of {performanceMetrics.worstHour.actualOutput} units
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Overall Trend</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'} performance trend
                {trend !== 0 && ` (${trend > 0 ? '+' : ''}${Math.round(trend)}%)`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceMetrics.overallEfficiency < 80 && (
                <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm">
                    <strong>Efficiency Improvement:</strong> Overall efficiency is below 80%. 
                    Consider reviewing processes and providing additional training.
                  </p>
                </div>
              )}
              
              {performanceMetrics.negativeHours > performanceMetrics.positiveHours && (
                <div className="p-3 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm">
                    <strong>Target Achievement:</strong> More hours are below target than above. 
                    Review workload distribution and resource allocation.
                  </p>
                </div>
              )}
              
              {trend < -10 && (
                <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm">
                    <strong>Declining Trend:</strong> Performance is declining over time. 
                    Investigate potential causes like fatigue or equipment issues.
                  </p>
                </div>
              )}
              
              {Math.abs(performanceMetrics.bestHour.actualOutput - performanceMetrics.worstHour.actualOutput) > 50 && (
                <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm">
                    <strong>Consistency:</strong> Large variation between best and worst hours. 
                    Focus on maintaining consistent performance throughout the shift.
                  </p>
                </div>
              )}
              
              {performanceMetrics.overallEfficiency >= 95 && (
                <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm">
                    <strong>Excellent Performance:</strong> Outstanding efficiency! 
                    Consider this as a benchmark for other worksheets.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
