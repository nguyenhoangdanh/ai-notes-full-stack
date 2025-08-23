'use client'


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

export default function AnalyticsPage() {
  // Mock data for the analytics - in real app this would come from hooks
  const mockStats = {
    totalNotes: 127,
    workspaces: 3,
    aiQueries: 342,
    storageUsed: 2.5 * 1024 * 1024, // 2.5 MB in bytes
    weeklyGrowth: 23,
    dailyActive: 15,
    avgSessionTime: "12m"
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
          value={mockStats.totalNotes}
          subtitle="All time created"
          delta={{
            value: mockStats.weeklyGrowth,
            type: 'increase',
            period: 'this week'
          }}
          icon={FileText}
          iconColor="text-primary-600"
        />
        
        <StatCard
          title="AI Queries"
          value={mockStats.aiQueries}
          subtitle="AI interactions"
          delta={{
            value: 45,
            type: 'increase',
            period: 'this month'
          }}
          icon={Brain}
          iconColor="text-purple"
        />
        
        <StatCard
          title="Active Days"
          value={mockStats.dailyActive}
          subtitle="This month"
          delta={{
            value: 12,
            type: 'increase',
            period: 'vs last month'
          }}
          icon={Activity}
          iconColor="text-accent"
        />
        
        <StatCard
          title="Avg Session"
          value={mockStats.avgSessionTime}
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
                    <p className="text-sm text-text-muted">87 notes • Most active</p>
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
                    <p className="text-sm text-text-muted">32 notes • Recent activity</p>
                  </div>
                  <Badge variant="default" size="sm">Active</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border-soft">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text">Research</h4>
                    <p className="text-sm text-text-muted">8 notes • Low activity</p>
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
                  <div className="text-3xl font-bold text-accent mb-1">↗ 23%</div>
                  <p className="text-sm text-text-muted">Note creation increase</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Most productive day</span>
                    <span className="text-sm text-text-muted">Tuesday</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Peak hours</span>
                    <span className="text-sm text-text-muted">9-11 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Avg. note length</span>
                    <span className="text-sm text-text-muted">247 words</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text">Total storage</span>
                    <span className="text-sm text-text-muted">{formatBytes(mockStats.storageUsed)}</span>
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
                <div className="text-2xl font-bold text-text">15</div>
                <p className="text-sm text-text-muted">Active days this month</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-text">247</div>
                <p className="text-sm text-text-muted">Average words per note</p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-text">12m</div>
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
                  <div className="text-3xl font-bold text-purple mb-1">342</div>
                  <p className="text-sm text-text-muted">Total AI queries</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Chat conversations</span>
                    <span className="text-sm text-text-muted">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Auto-summaries</span>
                    <span className="text-sm text-text-muted">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Relations discovered</span>
                    <span className="text-sm text-text-muted">67</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Categories created</span>
                    <span className="text-sm text-text-muted">12</span>
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
                    <div className="text-2xl font-bold text-text">31,247</div>
                    <p className="text-sm text-text-muted">Total words</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text">127</div>
                    <p className="text-sm text-text-muted">Total notes</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Longest note</span>
                    <span className="text-sm text-text-muted">1,247 words</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Most used tag</span>
                    <span className="text-sm text-text-muted">#productivity</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage used</span>
                    <span className="text-sm text-text-muted">{formatBytes(mockStats.storageUsed)}</span>
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
