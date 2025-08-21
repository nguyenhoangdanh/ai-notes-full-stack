'use client'

import { useState } from 'react'
import { FileText, Brain, Clock, Zap, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useSummaryStats,
  useSummaryTemplates,
  useBatchGenerateSummaries,
  useNotes
} from '@/hooks'
import { SummaryStatsCard } from '@/components/summaries/SummaryStatsCard'
import { SummaryTemplateCard } from '@/components/summaries/SummaryTemplateCard'
import { BatchGenerateDialog } from '@/components/summaries/BatchGenerateDialog'
import { RecentSummariesList } from '@/components/summaries/RecentSummariesList'

export default function SummariesPage() {
  const [showBatchDialog, setShowBatchDialog] = useState(false)

  const { data: stats, isLoading: statsLoading } = useSummaryStats()
  const { data: templates, isLoading: templatesLoading } = useSummaryTemplates()
  const { data: notes } = useNotes()
  const batchGenerate = useBatchGenerateSummaries()

  const handleBatchGenerate = async (noteIds: string[], options: any) => {
    try {
      await batchGenerate.mutateAsync({
        noteIds,
        minWords: options.minWords,
        skipExisting: true
      })
      setShowBatchDialog(false)
    } catch (error) {
      console.error('Failed to generate summaries:', error)
    }
  }

  if (statsLoading) {
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
            <Brain className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Summaries
            </span>
          </h1>
          <p className="text-muted-foreground">
            AI-generated summaries for your notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowBatchDialog(true)}
            className="flex items-center gap-2 superhuman-hover superhuman-glow border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <Zap className="h-4 w-4" />
            Batch Generate
          </Button>
          <Button className="flex items-center gap-2 superhuman-gradient superhuman-hover shadow-lg hover:shadow-xl">
            <Plus className="h-4 w-4" />
            Generate Summary
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <SummaryStatsCard stats={stats} />}

      <Tabs defaultValue="recent" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 superhuman-glass">
          <TabsTrigger value="recent" className="superhuman-transition data-[state=active]:superhuman-gradient data-[state=active]:text-white">Recent Summaries</TabsTrigger>
          <TabsTrigger value="templates" className="superhuman-transition data-[state=active]:superhuman-gradient data-[state=active]:text-white">Templates</TabsTrigger>
          <TabsTrigger value="analytics" className="superhuman-transition data-[state=active]:superhuman-gradient data-[state=active]:text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <RecentSummariesList />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse superhuman-glass">
                  <CardHeader>
                    <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-muted to-muted/30 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-full mb-2" />
                    <div className="h-4 bg-gradient-to-r from-muted to-muted/30 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : !Array.isArray(templates) || templates.length === 0 ? (
              <Card className="col-span-full superhuman-glass superhuman-glow">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground text-center">
                    Summary templates will help you create consistent summaries
                  </p>
                </CardContent>
              </Card>
            ) : (
              (Array.isArray(templates) ? templates : []).map((template) => (
                <SummaryTemplateCard key={template.id} template={template} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary Generation Trends */}
            <Card className="superhuman-glass superhuman-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Generation Trends
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Analytics data will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card className="superhuman-glass superhuman-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Popular Templates
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Array.isArray(templates) ? templates.slice(0, 5) : []).map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between p-3 rounded-lg superhuman-gradient-subtle superhuman-hover border border-primary/10">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="superhuman-gradient text-white font-medium">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{template.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {template.usageCount || 0} uses
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        No template usage data available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Batch Generate Dialog */}
      <BatchGenerateDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        notes={notes || []}
        onSubmit={handleBatchGenerate}
        isLoading={batchGenerate.isPending}
      />
    </div>
  )
}
