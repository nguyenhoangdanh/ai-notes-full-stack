import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Network, Maximize2, Download } from 'lucide-react'
import { useNoteGraph } from '@/hooks'

interface RelationsGraphProps {
  noteId: string
}

export function RelationsGraph({ noteId }: RelationsGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { data: graphData, isLoading } = useNoteGraph(noteId)

  useEffect(() => {
    if (!canvasRef.current || !graphData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Simple graph visualization (mock implementation)
    const nodes = graphData.nodes || []
    const edges = graphData.edges || []

    // Draw edges
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    edges.forEach((edge: any) => {
      const source = nodes.find((n: any) => n.id === edge.source)
      const target = nodes.find((n: any) => n.id === edge.target)
      if (source && target) {
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach((node: any) => {
      ctx.fillStyle = node.id === noteId ? '#3b82f6' : '#64748b'
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size || 10, 0, 2 * Math.PI)
      ctx.fill()

      // Draw node label
      ctx.fillStyle = '#1e293b'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(node.title.substring(0, 15) + '...', node.x, node.y - 15)
    })
  }, [graphData, noteId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Note Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Note Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Relations Found</h3>
            <p className="text-muted-foreground text-center">
              This note doesn't have any established relationships yet
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Note Graph
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border rounded-lg bg-background"
            style={{ maxWidth: '100%' }}
          />
          
          {/* Graph Legend */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border">
            <h4 className="text-sm font-medium mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Current Note</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span>Related Notes</span>
              </div>
            </div>
          </div>

          {/* Graph Stats */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              {graphData.nodes.length} nodes
            </Badge>
            <Badge variant="outline">
              {graphData.edges?.length || 0} connections
            </Badge>
            <Badge variant="outline">
              Density: {((graphData.edges?.length || 0) / (graphData.nodes.length * (graphData.nodes.length - 1)) * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}