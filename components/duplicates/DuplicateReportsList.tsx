import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FileText, Download, Calendar } from 'lucide-react'

import { type DuplicateDetectionReport } from '@/types'

interface DuplicateReportsListProps {
  reports: DuplicateDetectionReport[]
  isLoading: boolean
}

export function DuplicateReportsList({ reports, isLoading }: DuplicateReportsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Detection Reports</h3>
          <p className="text-muted-foreground text-center">
            Run your first duplicate detection to see reports here
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Detection Reports</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>
      
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detection Report
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {getStatusBadge(report.status)}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {report.duplicatesFound}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {report.totalNotes}
                </div>
                <div className="text-sm text-muted-foreground">Notes Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {report.completedAt 
                    ? Math.round((new Date(report.completedAt).getTime() - new Date(report.createdAt).getTime()) / 1000)
                    : 0}s
                </div>
                <div className="text-sm text-muted-foreground">Time Elapsed</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Detection efficiency: {((report.duplicatesFound / report.totalNotes) * 100).toFixed(1)}%
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
