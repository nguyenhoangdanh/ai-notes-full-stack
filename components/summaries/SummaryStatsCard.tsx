import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Zap, Clock, TrendingUp } from 'lucide-react'

interface SummaryStats {
  totalSummaries: number
  summariesToday: number
  averageLength: number
  totalWordsGenerated: number
}

interface SummaryStatsCardProps {
  stats: SummaryStats
}

export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  const statItems = [
    {
      icon: FileText,
      label: 'Total Summaries',
      value: stats.totalSummaries,
      color: 'text-blue-600',
    },
    {
      icon: Zap,
      label: 'Generated Today',
      value: stats.summariesToday,
      color: 'text-green-600',
    },
    {
      icon: Clock,
      label: 'Average Length',
      value: `${stats.averageLength} words`,
      color: 'text-orange-600',
    },
    {
      icon: TrendingUp,
      label: 'Total Words',
      value: stats.totalWordsGenerated.toLocaleString(),
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}