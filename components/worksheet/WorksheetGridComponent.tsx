'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Save,
  Copy,
  Target,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MoreVertical,
  RefreshCw,
  Smartphone,
  Edit,
  Lock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWorksheetGrid, useUpsertHourOutputs, useWorksheetById } from '@/hooks/use-worksheet'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from 'sonner'
import type {
  WorksheetGridResponse,
  WorksheetGridRow,
  WorksheetGridHour,
  HourOutputEntryDto,
  WorksheetGridEntry
} from '@/types/worksheet.types'

interface WorksheetGridComponentProps {
  worksheetId: string
  readonly?: boolean
  className?: string
}

interface GridCell {
  itemId: string
  workHour: number
  entryIndex: number
  actualOutput: number
  targetOutput?: number | null
  variance?: number | null
  note?: string | null
  productId?: string
  processId?: string
  isDirty?: boolean
}

interface PendingChange {
  cellKey: string
  entry: HourOutputEntryDto
}

export function WorksheetGridComponent({ 
  worksheetId, 
  readonly = false,
  className = ''
}: WorksheetGridComponentProps) {
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const isTablet = useMediaQuery('(max-width: 1280px)')
  const gridRef = useRef<HTMLDivElement>(null)
  
  // State management with performance optimization
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCell, setEditingCell] = useState<string | null>(null)

  // Data fetching
  const { data: gridData, isLoading, error, refetch } = useWorksheetGrid(worksheetId)
  const { data: worksheet } = useWorksheetById(worksheetId)
  const upsertHourOutputs = useUpsertHourOutputs()

  // Optimized grid data calculation
  const gridCells = useMemo(() => {
    if (!gridData?.grid) return new Map<string, GridCell>()
    
    const cellsMap = new Map<string, GridCell>()
    
    gridData.grid.forEach(row => {
      row.hourlyData.forEach(hourData => {
        hourData.entries.forEach((entry, index) => {
          const cellKey = `${row.itemId}-${hourData.workHour}-${index}`
          const pendingChange = pendingChanges.get(cellKey)
          
          cellsMap.set(cellKey, {
            itemId: row.itemId,
            workHour: hourData.workHour,
            entryIndex: index,
            actualOutput: pendingChange?.entry.actualOutput ?? entry.actualOutput,
            targetOutput: pendingChange?.entry.targetOutput ?? entry.targetOutput,
            variance: entry.variance,
            note: pendingChange?.entry.note ?? entry.note,
            productId: entry.product?.id,
            processId: entry.process?.id,
            isDirty: pendingChanges.has(cellKey)
          })
        })
      })
    })
    
    return cellsMap
  }, [gridData, pendingChanges])

  // Performance-optimized change handler
  const handleCellChange = useCallback((
    itemId: string,
    workHour: number,
    entryIndex: number,
    field: 'actualOutput' | 'note',
    value: number | string
  ) => {
    const cellKey = `${itemId}-${workHour}-${entryIndex}`
    const currentCell = gridCells.get(cellKey)
    
    if (!currentCell) return

    const newEntry: HourOutputEntryDto = {
      itemId,
      entryIndex,
      actualOutput: field === 'actualOutput' ? Number(value) : currentCell.actualOutput,
      note: field === 'note' ? String(value) : currentCell.note,
      targetOutput: currentCell.targetOutput,
      productId: currentCell.productId,
      processId: currentCell.processId
    }

    setPendingChanges(prev => {
      const newChanges = new Map(prev)
      newChanges.set(cellKey, { cellKey, entry: newEntry })
      return newChanges
    })
  }, [gridCells])

  // Batch save with optimistic updates
  const handleSave = useCallback(async () => {
    if (pendingChanges.size === 0) return

    setIsSaving(true)
    try {
      // Group changes by record (hour)
      const recordGroups = new Map<string, HourOutputEntryDto[]>()
      
      pendingChanges.forEach(({ entry }) => {
        const recordKey = `${entry.itemId}-hour-${gridData?.grid.find(row => 
          row.hourlyData.some(h => h.entries.some(e => e.entryIndex === entry.entryIndex))
        )?.hourlyData.find(h => h.entries.some(e => e.entryIndex === entry.entryIndex))?.workHour}`
        
        if (!recordGroups.has(recordKey)) {
          recordGroups.set(recordKey, [])
        }
        recordGroups.get(recordKey)?.push(entry)
      })

      // Save all changes
      const savePromises = Array.from(recordGroups.entries()).map(([, entries]) => {
        const recordId = entries[0]?.itemId // This should be the actual record ID
        return upsertHourOutputs.mutateAsync({
          recordId,
          entries
        })
      })

      await Promise.all(savePromises)
      
      setPendingChanges(new Map())
      toast.success(`Saved ${pendingChanges.size} changes successfully`)
      
    } catch (error) {
      toast.error('Failed to save changes')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [pendingChanges, gridData, upsertHourOutputs])

  // Auto-save on blur
  const handleCellBlur = useCallback(() => {
    if (pendingChanges.size > 0) {
      // Debounced auto-save
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [pendingChanges, handleSave])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, cellKey: string) => {
    if (!gridData?.grid) return

    const [itemId, workHour, entryIndex] = cellKey.split('-')
    const currentRow = gridData.grid.find(row => row.itemId === itemId)
    const currentRowIndex = gridData.grid.indexOf(currentRow!)
    const currentHourIndex = parseInt(workHour) - 1

    let nextCellKey: string | null = null

    switch (e.key) {
      case 'ArrowRight':
        if (currentHourIndex < 10) { // Max 11 hours (0-10)
          nextCellKey = `${itemId}-${parseInt(workHour) + 1}-${entryIndex}`
        }
        break
      case 'ArrowLeft':
        if (currentHourIndex > 0) {
          nextCellKey = `${itemId}-${parseInt(workHour) - 1}-${entryIndex}`
        }
        break
      case 'ArrowDown':
        if (currentRowIndex < gridData.grid.length - 1) {
          const nextRow = gridData.grid[currentRowIndex + 1]
          nextCellKey = `${nextRow.itemId}-${workHour}-${entryIndex}`
        }
        break
      case 'ArrowUp':
        if (currentRowIndex > 0) {
          const prevRow = gridData.grid[currentRowIndex - 1]
          nextCellKey = `${prevRow.itemId}-${workHour}-${entryIndex}`
        }
        break
      case 'Enter':
        e.preventDefault()
        handleSave()
        break
      case 'Escape':
        setEditingCell(null)
        break
    }

    if (nextCellKey) {
      e.preventDefault()
      setSelectedCell(nextCellKey)
      setEditingCell(nextCellKey)
      
      // Focus the next input
      const nextInput = document.querySelector(`[data-cell-key="${nextCellKey}"]`) as HTMLInputElement
      nextInput?.focus()
    }
  }, [gridData, handleSave])

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Production Grid</h3>
          <Button variant="outline" size="sm">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile View
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Smartphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Mobile Grid Not Available</h3>
            <p className="text-muted-foreground mb-4">
              The production grid is optimized for desktop and tablet viewing. Use the mobile worksheet view for mobile devices.
            </p>
            <Button onClick={() => window.location.href = `/mobile/worksheets/${worksheetId}`}>
              Open Mobile View
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 120 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !gridData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Grid</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load worksheet grid'}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Production Grid
              {readonly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Read Only
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Track hourly production output for all workers
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingChanges.size > 0 && (
              <Badge variant="warning" className="animate-pulse">
                {pendingChanges.size} unsaved changes
              </Badge>
            )}
            
            <Button
              onClick={handleSave}
              disabled={readonly || pendingChanges.size === 0 || isSaving}
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Grid
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto" ref={gridRef}>
              <div className="min-w-max">
                {/* Header Row */}
                <div className="grid grid-cols-[200px_repeat(11,minmax(100px,1fr))] gap-px bg-muted p-px">
                  <div className="bg-background p-3 font-semibold sticky left-0 z-10">
                    Worker
                  </div>
                  {gridData.hours.map((hour) => (
                    <div key={hour.workHour} className="bg-background p-3 text-center">
                      <div className="font-semibold">Hour {hour.workHour}</div>
                      <div className="text-xs text-muted-foreground">
                        {hour.startTime} - {hour.endTime}
                      </div>
                      {hour.expectedOutputTotal && (
                        <div className="text-xs text-blue-600 font-medium">
                          Target: {hour.expectedOutputTotal}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Data Rows */}
                {gridData.grid.map((row) => (
                  <div key={row.itemId} className="grid grid-cols-[200px_repeat(11,minmax(100px,1fr))] gap-px bg-muted p-px">
                    {/* Worker Info */}
                    <div className="bg-background p-3 sticky left-0 z-10">
                      <div className="font-medium truncate">
                        {row.worker.firstName} {row.worker.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {row.worker.employeeCode}
                      </div>
                    </div>

                    {/* Hour Cells */}
                    {row.hourlyData.map((hourData) => (
                      <div key={hourData.workHour} className="bg-background p-1">
                        {hourData.entries.map((entry, entryIndex) => {
                          const cellKey = `${row.itemId}-${hourData.workHour}-${entryIndex}`
                          const cellData = gridCells.get(cellKey)
                          const isEditing = editingCell === cellKey

                          return (
                            <div key={entryIndex} className="space-y-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative">
                                    <Input
                                      data-cell-key={cellKey}
                                      type="number"
                                      min="0"
                                      value={cellData?.actualOutput || ''}
                                      onChange={(e) => handleCellChange(
                                        row.itemId,
                                        hourData.workHour,
                                        entryIndex,
                                        'actualOutput',
                                        e.target.value
                                      )}
                                      onFocus={() => {
                                        setSelectedCell(cellKey)
                                        setEditingCell(cellKey)
                                      }}
                                      onBlur={handleCellBlur}
                                      onKeyDown={(e) => handleKeyDown(e, cellKey)}
                                      disabled={readonly}
                                      className={`
                                        h-8 text-center text-sm transition-all
                                        ${cellData?.isDirty ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''}
                                        ${selectedCell === cellKey ? 'ring-2 ring-blue-500' : ''}
                                        ${readonly ? 'bg-muted cursor-not-allowed' : ''}
                                      `}
                                      placeholder="0"
                                    />
                                    {cellData?.isDirty && (
                                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div>Worker: {row.worker.firstName} {row.worker.lastName}</div>
                                    <div>Hour: {hourData.workHour} ({hourData.startTime} - {hourData.endTime})</div>
                                    <div>Current Output: {cellData?.actualOutput || 0}</div>
                                    {cellData?.targetOutput && (
                                      <div>Target: {cellData.targetOutput}</div>
                                    )}
                                    {cellData?.variance && (
                                      <div className={cellData.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                                        Variance: {cellData.variance > 0 ? '+' : ''}{cellData.variance}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>

                              {/* Notes */}
                              {(cellData?.note || isEditing) && (
                                <Input
                                  placeholder="Note..."
                                  value={cellData?.note || ''}
                                  onChange={(e) => handleCellChange(
                                    row.itemId,
                                    hourData.workHour,
                                    entryIndex,
                                    'note',
                                    e.target.value
                                  )}
                                  disabled={readonly}
                                  className="h-6 text-xs"
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {gridData.grid.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{gridData.grid.length}</div>
                  <div className="text-sm text-muted-foreground">Workers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{gridData.hours.length}</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pendingChanges.size}</div>
                  <div className="text-sm text-muted-foreground">Pending Changes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Array.from(gridCells.values()).reduce((sum, cell) => sum + cell.actualOutput, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Output</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
