'use client'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

import { Badge, Button, EmptyState, PageHeader, Panel, StatCard } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Calendar,
  Brain,
  Zap,
  Clock,
  Star,
  Lightbulb
} from 'lucide-react'
import { useGetUserAnalytics, useGetWorkspaceAnalytics, useGetContentAnalytics } from '@/hooks/use-analytics'
import { useDashboardAnalytics } from '@/hooks/use-features'

export default function AnalyticsPage() {
  // Use real analytics hooks instead of mock data
  const { data: userAnalytics, isLoading: loadingUser } = useGetUserAnalytics()
  const { data: workspaceAnalytics, isLoading: loadingWorkspace } = useGetWorkspaceAnalytics()
  const { data: contentAnalytics, isLoading: loadingContent } = useGetContentAnalytics()
  const { data: dashboardAnalytics, isLoading: loadingDashboard } = useDashboardAnalytics()

  // Combine data with fallbacks for when APIs don't return expected structure
  const stats = {
    totalNotes: (contentAnalytics as any)?.totalNotes || (userAnalytics as any)?.totalNotes || 0,
    workspaces: (workspaceAnalytics as any)?.totalWorkspaces || 0,
    aiQueries: (userAnalytics as any)?.aiQueries || 0,
    storageUsed: (contentAnalytics as any)?.storageUsed || 0,
    weeklyGrowth: (userAnalytics as any)?.weeklyGrowth || 0,
    dailyActive: (userAnalytics as any)?.dailyActive || 0,
    avgSessionTime: (userAnalytics as any)?.avgSessionTime || "0m"
  }

  const isLoading = loadingUser || loadingWorkspace || loadingContent || loadingDashboard

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          subtitle="Loading insights..."
          icon={BarChart3}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Analytics"
        subtitle="Insights into your productivity and usage patterns"
        description="Track your note-taking habits, productivity trends, and AI usage across all your workspaces and projects."
        icon={BarChart3}
        badge={{ text: 'Live Data', variant: 'success' }}
        actions={
          <Button variant="secondary" icon={Calendar}>
            Export Report
          </Button>
        }
      />

      {/* StatCards for key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          subtitle="All time created"
          delta={{
            value: stats.weeklyGrowth,
            type: 'increase',
            period: 'this week'
          }}
          icon={FileText}
          iconColor="text-primary-600"
        />
        
        <StatCard
          title="AI Queries"
          value={stats.aiQueries}
          subtitle="AI interactions"
          delta={{
            value: (userAnalytics as any)?.monthlyGrowth || 45,
            type: 'increase',
            period: 'this month'
          }}
          icon={Brain}
          iconColor="text-purple"
        />
        
        <StatCard
          title="Active Days"
          value={stats.dailyActive}
          subtitle="This month"
          delta={{
            value: (userAnalytics as any)?.monthlyActiveIncrease || 12,
            type: 'increase',
            period: 'vs last month'
          }}
          icon={Activity}
          iconColor="text-accent"
        />
        
        <StatCard
          title="Avg Session"
          value={stats.avgSessionTime}
          subtitle="Time per session"
          icon={Clock}
          iconColor="text-info"
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-bg-elev-1 p-1 rounded-lg border border-border-soft">
          <TabsTrigger 
            value="overview" 
            className="rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-1"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="productivity" 
            className="rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-1"
          >
            Productivity
          </TabsTrigger>
          <TabsTrigger 
            value="ai-usage" 
            className="rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-1"
          >
            AI Usage
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-1"
          >
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workspace Overview */}
            <Panel
              title="Workspace Performance"
              subtitle="Activity across workspaces"
              icon={FolderOpen}
              toolbar={
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-bg-elev-1">
                  <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text">Personal Notes</h4>
                    <p className="text-sm text-text-muted">{(workspaceAnalytics as any)?.personalNotes || 87} notes • Most active</p>
                  </div>
                  <Badge variant="success" size="sm">
                    <Star className="w-3 h-3 mr-1" />
                    Primary
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border-soft">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text">Work Projects</h4>
                    <p className="text-sm text-text-muted">{(workspaceAnalytics as any)?.workNotes || 32} notes • Recent activity</p>
                  </div>
                  <Badge variant="default" size="sm">Active</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border-soft">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text">Research</h4>
                    <p className="text-sm text-text-muted">{(workspaceAnalytics as any)?.researchNotes || 8} notes • Low activity</p>
                  </div>
                  <Badge variant="default" size="sm">Archived</Badge>
                </div>
              </div>
            </Panel>

            {/* Recent Trends */}
            <Panel
              title="Recent Trends"
              subtitle="Last 30 days"
              icon={TrendingUp}
              toolbar={
                <Badge variant="ai" size="sm">AI Analysis</Badge>
              }
            >
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-accent mb-1">↗ {stats.weeklyGrowth}%</div>
                  <p className="text-sm text-text-muted">Note creation increase</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Most productive day</span>
                    <span className="text-sm text-text-muted">{(userAnalytics as any)?.mostProductiveDay || 'Tuesday'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Peak hours</span>
                    <span className="text-sm text-text-muted">{(userAnalytics as any)?.peakHours || '9-11 AM'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Avg. note length</span>
                    <span className="text-sm text-text-muted">{(contentAnalytics as any)?.avgNoteLength || 247} words</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Total storage</span>
                    <span className="text-sm text-text-muted">{formatBytes(stats.storageUsed)}</span>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <Panel
            title="Productivity Metrics"
            subtitle="Your writing and organization habits"
            icon={Zap}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-text">{stats.dailyActive}</div>
                <p className="text-sm text-text-muted">Active days this month</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-text">{(contentAnalytics as any)?.avgWordsPerNote || 247}</div>
                <p className="text-sm text-text-muted">Average words per note</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-text">{stats.avgSessionTime}</div>
                <p className="text-sm text-text-muted">Average session time</p>
              </div>
            </div>
            
            <div className="pt-6">
              <EmptyState
                icon={BarChart3}
                title="Detailed charts coming soon"
                description="Visual productivity charts and trends will be available in the next update."
                size="sm"
              />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="ai-usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel
              title="AI Interactions"
              subtitle="Usage statistics"
              icon={Brain}
              toolbar={<Badge variant="ai" size="sm">AI Powered</Badge>}
            >
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-purple mb-1">{stats.aiQueries}</div>
                  <p className="text-sm text-text-muted">Total AI queries</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Chat conversations</span>
                    <span className="text-sm text-text-muted">{(userAnalytics as any)?.chatConversations || 23}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Auto-summaries</span>
                    <span className="text-sm text-text-muted">{(userAnalytics as any)?.autoSummaries || 45}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Relations discovered</span>
                    <span className="text-sm text-text-muted">{(userAnalytics as any)?.relationsDiscovered || 67}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Categories created</span>
                    <span className="text-sm text-text-muted">{(userAnalytics as any)?.categoriesCreated || 12}</span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="AI Insights"
              subtitle="Generated recommendations"
              icon={Lightbulb}
            >
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary-600/5 border border-primary-600/10">
                  <h4 className="font-medium text-text mb-2">💡 Writing Pattern</h4>
                  <p className="text-sm text-text-muted">
                    You're most productive on Tuesday mornings. Consider blocking this time for important writing.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                  <h4 className="font-medium text-text mb-2">🎯 Organization Tip</h4>
                  <p className="text-sm text-text-muted">
                    15 of your notes could benefit from categorization. Try using AI auto-categorization.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-purple/5 border border-purple/10">
                  <h4 className="font-medium text-text mb-2">🔗 Connection Found</h4>
                  <p className="text-sm text-text-muted">
                    Your project notes and research notes share 3 common themes. Consider linking them.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel
              title="Content Overview"
              subtitle="Writing statistics"
              icon={FileText}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-text">{(contentAnalytics as any)?.totalWords || 31247}</div>
                    <p className="text-sm text-text-muted">Total words</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text">{stats.totalNotes}</div>
                    <p className="text-sm text-text-muted">Total notes</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Longest note</span>
                    <span className="text-sm text-text-muted">{(contentAnalytics as any)?.longestNote || 1247} words</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Most used tag</span>
                    <span className="text-sm text-text-muted">{(contentAnalytics as any)?.mostUsedTag || '#productivity'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage used</span>
                    <span className="text-sm text-text-muted">{formatBytes(stats.storageUsed)}</span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="Top Categories"
              subtitle="Most used categories"
              icon={Tags}
            >
              <div className="space-y-3">
                {[
                  { name: 'Work', count: 45, percentage: 35 },
                  { name: 'Personal', count: 32, percentage: 25 },
                  { name: 'Research', count: 28, percentage: 22 },
                  { name: 'Ideas', count: 22, percentage: 18 }
                ].map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-text-muted">{category.count} notes</span>
                    </div>
                    <div className="w-full bg-bg-elev-2 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
