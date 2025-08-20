'use client'

import { useState } from 'react'
import { FileText, Brain, Clock, Zap, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Summaries
          </h1>
          <p className="text-muted-foreground">
            AI-generated summaries for your notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowBatchDialog(true)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Batch Generate
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate Summary
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <SummaryStatsCard stats={stats} />}

      <Tabs defaultValue="recent" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Summaries</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <RecentSummariesList />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : !Array.isArray(templates) || templates.length === 0 ? (
              <Card className="col-span-full">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Generation Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Analytics data will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Popular Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Array.isArray(templates) ? templates.slice(0, 5) : []).map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="text-sm">{template.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {template.usageCount || 0} uses
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No template usage data available
                    </p>
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