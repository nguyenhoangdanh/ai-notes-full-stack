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

export default function AnalyticsPage() {
  // const { data: overview, isLoading: overviewLoading } = useDashboardAnalytics()
  // const { data: userActivity, isLoading: activityLoading } = useUserActivity()
  const overview = null
  const userActivity = null

  // TODO: Add proper analytics hooks to use-features.ts
  const workspaceStats = null
  const workspaceLoading = false
  const contentStats = null
  const contentLoading = false

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/2 relative overflow-hidden">
      {/* Superhuman background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-2" />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Superhuman Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Insights into your productivity and usage patterns
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 rounded-full bg-background/50 border-border/30">
            <Activity className="w-4 h-4" />
            Live Data
          </Badge>
        </div>

        {/* Overview Cards - Placeholder for now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="superhuman-hover border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Connect backend for data
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="superhuman-hover border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                Awaiting data
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="superhuman-hover border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                AI interactions
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="superhuman-hover border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <HardDrive className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Data coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="workspaces" className="space-y-6">
          <TabsList className="bg-muted/30 p-1 rounded-full border border-border/30">
            <TabsTrigger 
              value="workspaces" 
              className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Workspaces
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Content
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Activity
            </TabsTrigger>
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
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workspace data</h3>
                  <p className="text-muted-foreground">
                    Workspace analytics will be available once backend is connected
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
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Words</span>
                      <span className="text-sm">Connect backend for data</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Avg. Note Length</span>
                      <span className="text-sm">Content analytics coming soon</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Categories</span>
                      <div className="text-sm text-muted-foreground">No data available yet</div>
                    </div>
                  </div>
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
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">English</span>
                      <span>Coming soon</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Content Growth</CardTitle>
              <CardDescription>Your writing activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Growth analytics will be available when backend is connected
              </div>
            </CardContent>
          </Card>
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
    </div>
  )
}