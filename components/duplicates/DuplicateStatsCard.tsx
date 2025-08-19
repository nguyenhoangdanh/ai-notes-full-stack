import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, AlertTriangle, TrendingDown, Clock } from 'lucide-react'

interface DuplicateStats {
  totalDuplicates: number
  duplicateGroups: number
  spaceSaved: number
  lastDetection: string
}

interface DuplicateStatsCardProps {
  stats: DuplicateStats
}

export function DuplicateStatsCard({ stats }: DuplicateStatsCardProps) {
  const statItems = [
    {
      icon: Copy,
      label: 'Total Duplicates',
      value: stats.totalDuplicates,
      color: 'text-red-600',
    },
    {
      icon: AlertTriangle,
      label: 'Duplicate Groups',
      value: stats.duplicateGroups,
      color: 'text-orange-600',
    },
    {
      icon: TrendingDown,
      label: 'Space Saved',
      value: `${(stats.spaceSaved / 1024).toFixed(1)} KB`,
      color: 'text-green-600',
    },
    {
      icon: Clock,
      label: 'Last Detection',
      value: new Date(stats.lastDetection).toLocaleDateString(),
      color: 'text-blue-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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