'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  FolderOpen, 
  Tags, 
  MessageSquare,
  HardDrive,
  Activity,
  Calendar
} from 'lucide-react'
import { useAnalyticsOverview, useWorkspaceAnalytics, useContentAnalytics } from '@/hooks/use-tags-analytics'

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview()
  const { data: workspaceStats, isLoading: workspaceLoading } = useWorkspaceAnalytics()
  const { data: contentStats, isLoading: contentLoading } = useContentAnalytics()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights into your productivity and usage patterns
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Live Data
        </Badge>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.totalNotes)}</div>
              <p className="text-xs text-muted-foreground">
                +{overview.recentActivity} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalWorkspaces}</div>
              <p className="text-xs text-muted-foreground">
                {overview.collaborators} collaborators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.aiQueries)}</div>
              <p className="text-xs text-muted-foreground">
                AI interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(overview.storageUsed)}</div>
              <p className="text-xs text-muted-foreground">
                {overview.totalTags} tags organized
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="workspaces" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Performance</CardTitle>
              <CardDescription>
                Activity and collaboration metrics for each workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workspaceLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-16 h-8 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : workspaceStats && workspaceStats.length > 0 ? (
                <div className="space-y-4">
                  {workspaceStats.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{workspace.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {workspace.noteCount} notes • {workspace.collaboratorCount} collaborators
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant={workspace.growth > 0 ? "default" : "secondary"}>
                            {workspace.growth > 0 ? '+' : ''}{workspace.growth}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatBytes(workspace.storageUsed)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workspace data</h3>
                  <p className="text-muted-foreground">
                    Create some workspaces to see analytics here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
                <CardDescription>Writing and content statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : contentStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Words</span>
                      <span className="text-sm">{formatNumber(contentStats.wordCount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Avg. Note Length</span>
                      <span className="text-sm">{Math.round(contentStats.averageNoteLength)} words</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Categories</span>
                      {contentStats.mostActiveCategories.slice(0, 3).map((category) => (
                        <div key={category.category} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{category.category}</span>
                          <span>{category.count} notes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No content data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Content language breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="space-y-2 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    ))}
                  </div>
                ) : contentStats?.languageDistribution ? (
                  <div className="space-y-2">
                    {contentStats.languageDistribution.map((lang) => (
                      <div key={lang.language} className="flex justify-between text-sm">
                        <span className="capitalize">{lang.language}</span>
                        <span>{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No language data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart */}
          {contentStats?.contentGrowth && (
            <Card>
              <CardHeader>
                <CardTitle>Content Growth</CardTitle>
                <CardDescription>Your writing activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentStats.contentGrowth.slice(-7).map((point) => (
                    <div key={point.date} className="flex justify-between text-sm">
                      <span>{formatDate(point.date)}</span>
                      <span>{point.notes} notes, {formatNumber(point.words)} words</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>Recent activity and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Activity tracking coming soon</h3>
                <p className="text-muted-foreground">
                  Detailed activity analytics will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}