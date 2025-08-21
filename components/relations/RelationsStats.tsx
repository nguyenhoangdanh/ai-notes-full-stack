import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Network, Link, TrendingUp, Users } from 'lucide-react'

interface RelationsStatsData {
  totalRelations: number
  strongConnections: number
  networkDensity: number
  clusterCount: number
}

interface RelationsStatsProps {
  stats: RelationsStatsData
}

export function RelationsStats({ stats }: RelationsStatsProps) {
  const statItems = [
    {
      icon: Link,
      label: 'Total Relations',
      value: stats.totalRelations,
      color: 'text-blue-600',
    },
    {
      icon: Network,
      label: 'Strong Connections',
      value: stats.strongConnections,
      color: 'text-green-600',
    },
    {
      icon: TrendingUp,
      label: 'Network Density',
      value: `${(stats.networkDensity * 100).toFixed(1)}%`,
      color: 'text-orange-600',
    },
    {
      icon: Users,
      label: 'Clusters',
      value: stats.clusterCount,
      color: 'text-purple-600',
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
