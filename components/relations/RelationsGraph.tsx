'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuickTooltip } from '@/components/ui/tooltip'
import { 
  Network, 
  Maximize2, 
  Download, 
  RotateCcw, 
  Zap, 
  Filter, 
  Share2, 
  Eye,
  Minimize2,
  Settings
} from 'lucide-react'
import { useNoteGraph } from '@/hooks'
import { cn } from '@/lib/utils'

interface RelationsGraphProps {
  noteId: string
  className?: string
}

export function RelationsGraph({ noteId, className }: RelationsGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { data: graphData, isLoading } = useNoteGraph(noteId)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !graphData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with proper scaling
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    // Clear canvas with modern background
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Modern gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, 'rgba(var(--color-bg-rgb), 0.5)')
    gradient.addColorStop(1, 'rgba(var(--color-brand-50-rgb), 0.3)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const nodes = graphData.nodes || []
    const edges = graphData.edges || []

    // Draw edges with modern styling
    edges.forEach((edge: any) => {
      const source = nodes.find((n: any) => n.id === edge.source)
      const target = nodes.find((n: any) => n.id === edge.target)
      if (source && target) {
        ctx.strokeStyle = 'rgba(var(--color-border-strong-rgb), 0.6)'
        ctx.lineWidth = edge.strength ? edge.strength * 4 : 2
        ctx.setLineDash([])
        
        // Add glow effect for strong connections
        if (edge.strength > 0.7) {
          ctx.shadowColor = 'rgba(var(--color-brand-500-rgb), 0.3)'
          ctx.shadowBlur = 8
        }
        
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
        
        ctx.shadowBlur = 0
      }
    })

    // Draw nodes with modern styling
    nodes.forEach((node: any) => {
      const isCurrentNode = node.id === noteId
      const nodeSize = node.size || (isCurrentNode ? 16 : 12)
      
      // Node shadow
      ctx.shadowColor = isCurrentNode 
        ? 'rgba(var(--color-brand-500-rgb), 0.4)' 
        : 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = isCurrentNode ? 12 : 6
      ctx.shadowOffsetY = 2
      
      // Node fill
      if (isCurrentNode) {
        const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize)
        nodeGradient.addColorStop(0, 'rgba(var(--color-brand-500-rgb), 1)')
        nodeGradient.addColorStop(1, 'rgba(var(--color-brand-600-rgb), 1)')
        ctx.fillStyle = nodeGradient
      } else {
        ctx.fillStyle = 'rgba(var(--color-text-muted-rgb), 0.8)'
      }
      
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
      ctx.fill()
      
      // Node border
      ctx.strokeStyle = isCurrentNode 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(var(--color-border-rgb), 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Node label with better typography
      ctx.fillStyle = 'rgba(var(--color-text-rgb), 0.9)'
      ctx.font = isCurrentNode ? 'bold 13px Inter' : '12px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      
      // Label background for better readability
      const text = node.title.substring(0, 15) + (node.title.length > 15 ? '...' : '')
      const textMetrics = ctx.measureText(text)
      const labelY = node.y + nodeSize + 8
      
      ctx.fillStyle = 'rgba(var(--color-surface-rgb), 0.9)'
      ctx.fillRect(
        node.x - textMetrics.width/2 - 4, 
        labelY - 2, 
        textMetrics.width + 8, 
        16
      )
      
      ctx.fillStyle = 'rgba(var(--color-text-rgb), 0.9)'
      ctx.fillText(text, node.x, labelY)
    })
  }, [graphData, noteId, viewMode])

  const handleNodeClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !graphData) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Find clicked node (simplified)
    const clickedNode = graphData.nodes?.find((node: any) => {
      const dx = x - node.x
      const dy = y - node.y
      return Math.sqrt(dx * dx + dy * dy) < (node.size || 12) + 5
    })
    
    setSelectedNode(clickedNode?.id || null)
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Card variant="glass" className="shadow-3 border border-border-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl">
                <Network className="h-5 w-5 text-brand-600" />
              </div>
              <span className="text-gradient">Note Relations</span>
              <Badge variant="feature" size="xs" className="ml-auto">
                AI-Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-gradient-to-br from-bg-muted to-brand-50/30 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center animate-pulse">
                    <Network className="h-8 w-8 text-brand-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-brand-100 rounded-xl w-32 mx-auto animate-pulse" />
                    <div className="h-3 bg-brand-50 rounded-lg w-48 mx-auto animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Card variant="glass" className="shadow-3 border border-border-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl">
                <Network className="h-5 w-5 text-brand-600" />
              </div>
              <span className="text-gradient">Note Relations</span>
              <Badge variant="feature" size="xs" className="ml-auto">
                AI-Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-gradient-to-br from-bg-muted to-brand-50/30 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center shadow-3"
                >
                  <Network className="h-10 w-10 text-brand-600" />
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-3"
                >
                  <h3 className="text-xl font-bold text-text">No Relations Yet</h3>
                  <p className="text-text-muted max-w-md leading-relaxed">
                    This note doesn't have any established relationships. As you create more notes with similar content, AI will automatically detect connections.
                  </p>
                  <Button variant="gradient" size="sm" className="mt-4 gap-2 shadow-2">
                    <Zap className="h-4 w-4" />
                    Generate Relations
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "transition-all duration-500",
        isFullscreen && "fixed inset-4 z-50 shadow-5",
        className
      )}
    >
      <Card variant="glass" className="shadow-3 border border-border-subtle h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl">
                <Network className="h-5 w-5 text-brand-600" />
              </div>
              <span className="text-gradient">Note Relations</span>
              <Badge variant="feature" size="xs">
                Interactive
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <QuickTooltip content="Graph settings">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "rounded-xl transition-modern",
                    showSettings && "bg-brand-100 text-brand-700"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </QuickTooltip>
              
              <QuickTooltip content="Filter relations">
                <Button variant="ghost" size="icon-sm" className="rounded-xl">
                  <Filter className="h-4 w-4" />
                </Button>
              </QuickTooltip>
              
              <QuickTooltip content="Refresh graph">
                <Button variant="ghost" size="icon-sm" className="rounded-xl">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </QuickTooltip>
              
              <QuickTooltip content={isFullscreen ? "Exit fullscreen" : "Fullscreen view"}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="gap-2 rounded-xl hover-lift"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              </QuickTooltip>
              
              <QuickTooltip content="Export graph">
                <Button variant="gradient" size="sm" className="gap-2 rounded-xl shadow-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </QuickTooltip>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                "relative rounded-2xl overflow-hidden",
                "bg-gradient-to-br from-bg via-bg-elevated to-brand-50/30",
                "border border-border-subtle shadow-inner"
              )}
            >
              <canvas
                ref={canvasRef}
                className={cn(
                  "w-full transition-all duration-500 cursor-crosshair",
                  isFullscreen ? "h-[70vh]" : "h-96"
                )}
                style={{ maxWidth: '100%' }}
                onClick={handleNodeClick}
              />
              
              {/* Modern Graph Legend */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute top-4 right-4 glass p-4 rounded-2xl border border-border-subtle shadow-3 backdrop-blur-xl"
              >
                <h4 className="text-sm font-semibold mb-3 text-text">Legend</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 shadow-1" />
                    <span className="text-text-secondary">Current Note</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-text-muted to-text-secondary shadow-1" />
                    <span className="text-text-secondary">Related Notes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-1 rounded-full bg-border-strong" />
                    <span className="text-text-secondary">Connections</span>
                  </div>
                </div>
                
                {/* Connection strength indicator */}
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <h5 className="text-xs font-medium text-text mb-2">Strength</h5>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-xs text-text-subtle ml-1">Strong → Weak</span>
                  </div>
                </div>
              </motion.div>

              {/* Node info tooltip */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute bottom-4 left-4 glass p-4 rounded-2xl border border-border-subtle shadow-3 backdrop-blur-xl max-w-xs"
                  >
                    <h4 className="font-semibold text-text mb-2">Note Details</h4>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      Details about the selected node would appear here
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="xs" className="gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button variant="ghost" size="xs" className="gap-1">
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Modern Graph Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-3 pt-4"
            >
              <Badge variant="feature" className="gap-2 px-3 py-1.5">
                <Network className="h-3 w-3" />
                {graphData.nodes.length} nodes
              </Badge>
              <Badge variant="outline" className="gap-2 px-3 py-1.5 border-brand-200 bg-brand-50 text-brand-700">
                <Share2 className="h-3 w-3" />
                {graphData.edges?.length || 0} connections
              </Badge>
              <Badge variant="glass" className="gap-2 px-3 py-1.5">
                <Zap className="h-3 w-3" />
                {((graphData.edges?.length || 0) / Math.max(1, graphData.nodes.length * (graphData.nodes.length - 1)) * 100).toFixed(1)}% density
              </Badge>
              
              {viewMode === '3d' && (
                <Badge variant="gradient" className="gap-2 px-3 py-1.5">
                  <Eye className="h-3 w-3" />
                  3D Mode
                </Badge>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
