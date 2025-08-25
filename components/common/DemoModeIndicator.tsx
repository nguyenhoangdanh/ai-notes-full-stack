/**
 * Demo Mode Indicator - Shows when the app is running in demo mode
 */
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Info, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'

export function DemoModeIndicator() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // setIsDemoMode(demoModeService.isDemoMode())
  }, [])

  if (!isDemoMode || !isVisible) {
    return null
  }

  const handleResetDemo = () => {
    // demoModeService.resetDemoData()
    toast.success('Demo data has been reset!')
    // Trigger a page refresh to reload the demo data
    window.location.reload()
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Demo Mode
            </Badge>
            <button
              onClick={handleDismiss}
              className="ml-auto text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            You're exploring AI Notes with sample data. Changes won't be saved permanently.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetDemo}
              className="text-xs border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
