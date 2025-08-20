'use client'

import { useState } from 'react'
import { Copy, Search, Zap, AlertTriangle, Merge, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

import { DuplicateStatsCard } from '@/components/duplicates/DuplicateStatsCard'
import { DuplicateGroupCard } from '@/components/duplicates/DuplicateGroupCard'
import { DuplicateReportsList } from '@/components/duplicates/DuplicateReportsList'
import { MergeDialog } from '@/components/duplicates/MergeDialog'
import { useDuplicateDetection, useDuplicateReports, useDuplicateStats, useMergeDuplicates, useQueueDuplicateDetection } from '@/hooks/use-smart'

export default function DuplicatesPage() {
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  const { data: detectionData, isLoading: detectionLoading } = useDuplicateDetection()
  const { data: reports, isLoading: reportsLoading } = useDuplicateReports()
  const { data: stats, isLoading: statsLoading } = useDuplicateStats()
  const queueDetection = useQueueDuplicateDetection()
  const mergeDuplicates = useMergeDuplicates()

  const handleStartDetection = async () => {
    try {
      await queueDetection.mutateAsync()
    } catch (error) {
      console.error('Failed to start detection:', error)
    }
  }

  const handleMergeGroup = async (group: any, targetNoteId: string) => {
    try {
      await mergeDuplicates.mutateAsync({
        primaryNoteId: targetNoteId,
        duplicateNoteIds: group.notes.filter((n: any) => n.id !== targetNoteId).map((n: any) => n.id),
        mergeStrategy: 'APPEND',
        keepTags: true,
        keepCategories: true
      })
      setShowMergeDialog(false)
      setSelectedGroup(null)
    } catch (error) {
      console.error('Failed to merge duplicates:', error)
    }
  }

  if (detectionLoading || statsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 superhuman-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Copy className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Duplicates
            </span>
          </h1>
          <p className="text-muted-foreground">
            Detect and manage duplicate notes using AI analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleStartDetection}
            disabled={queueDetection.isPending}
            className="flex items-center gap-2 superhuman-hover superhuman-glow border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <Search className="h-4 w-4" />
            {queueDetection.isPending ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
          <Button className="flex items-center gap-2 superhuman-gradient superhuman-hover shadow-lg hover:shadow-xl">
            <BarChart3 className="h-4 w-4" />
            View Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <DuplicateStatsCard stats={stats} />}

      <Tabs defaultValue="detected" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 superhuman-glass">
          <TabsTrigger value="detected" className="superhuman-transition data-[state=active]:superhuman-gradient data-[state=active]:text-white">Detected Groups</TabsTrigger>
          <TabsTrigger value="reports" className="superhuman-transition data-[state=active]:superhuman-gradient data-[state=active]:text-white">Detection Reports</TabsTrigger>
          <TabsTrigger value="settings" className="superhuman-transition data-[state=active]:superhuman-gradient data-[state=active]:text-white">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="detected" className="mt-6">
          {!detectionData || !Array.isArray(detectionData) || detectionData.length === 0 ? (
            <Card className="superhuman-glass superhuman-glow">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <Copy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  No Duplicates Found
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Great! No duplicate notes detected in your workspace. Your content is well-organized.
                </p>
                <Button 
                  onClick={handleStartDetection} 
                  disabled={queueDetection.isPending}
                  className="superhuman-gradient superhuman-hover shadow-lg hover:shadow-xl"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Run Detection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {(Array.isArray(detectionData) ? detectionData : []).map((group: any, index: number) => (
                <DuplicateGroupCard
                  key={group.id || index}
                  group={group}
                  onMerge={() => {
                    setSelectedGroup(group)
                    setShowMergeDialog(true)
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <DuplicateReportsList reports={Array.isArray(reports) ? reports : []} isLoading={reportsLoading} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="superhuman-glass superhuman-glow">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Detection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h4 className="font-medium mb-3 text-primary">Similarity Threshold</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Minimum similarity percentage to consider notes as duplicates
                </p>
                <div className="flex items-center gap-4 p-4 rounded-lg superhuman-gradient-subtle border border-primary/10">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    defaultValue="80"
                    className="flex-1 superhuman-focus"
                  />
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary font-medium">
                    80%
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-primary">Detection Method</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how duplicates should be detected
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg superhuman-gradient-subtle border border-primary/10 superhuman-hover cursor-pointer">
                    <input type="radio" name="method" value="content" defaultChecked className="text-primary superhuman-focus" />
                    <span className="text-sm font-medium">Content similarity</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg superhuman-gradient-subtle border border-primary/10 superhuman-hover cursor-pointer">
                    <input type="radio" name="method" value="title" className="text-primary superhuman-focus" />
                    <span className="text-sm font-medium">Title similarity</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg superhuman-gradient-subtle border border-primary/10 superhuman-hover cursor-pointer">
                    <input type="radio" name="method" value="both" className="text-primary superhuman-focus" />
                    <span className="text-sm font-medium">Both content and title</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-primary">Auto-merge</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically merge duplicates with very high similarity
                </p>
                <label className="flex items-center gap-3 p-4 rounded-lg superhuman-gradient-subtle border border-primary/10 superhuman-hover cursor-pointer">
                  <input type="checkbox" className="text-primary superhuman-focus" />
                  <span className="text-sm font-medium">Enable auto-merge for 95%+ similarity</span>
                </label>
              </div>

              <Button className="superhuman-gradient superhuman-hover shadow-lg hover:shadow-xl">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Merge Dialog */}
      {selectedGroup && (
        <MergeDialog
          open={showMergeDialog}
          onOpenChange={setShowMergeDialog}
          group={selectedGroup}
          onMerge={handleMergeGroup}
          isLoading={mergeDuplicates.isPending}
        />
      )}
    </div>
  )
}