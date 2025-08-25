'use client'

import { useMyTodayWorksheets } from '@/hooks/use-worksheet'
import { WorksheetMobileView } from '@/components/worksheet/WorksheetMobileView'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MobileWorksheetsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  
  const { data: worksheets = [], isLoading, error } = useMyTodayWorksheets()

  // Calculate stats
  const stats = {
    total: worksheets.length,
    active: worksheets.filter(w => w.status === 'ACTIVE').length,
    completed: worksheets.filter(w => w.status === 'COMPLETED').length,
    totalWorkers: worksheets.reduce((acc, w) => acc + w.totalWorkers, 0)
  }

  const handleWorksheetClick = (id: string) => {
    router.push(`/mobile/worksheets/${id}`)
  }

  const handleCreateWorksheet = () => {
    router.push('/worksheets/create')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Worksheets</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load worksheets'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <WorksheetMobileView
      worksheets={worksheets}
      stats={stats}
      search={search}
      onSearchChange={setSearch}
      onWorksheetClick={handleWorksheetClick}
      onCreateWorksheet={handleCreateWorksheet}
      isLoading={isLoading}
      showOnlyToday={true}
      onToggleToday={() => {}}
    />
  )
}
