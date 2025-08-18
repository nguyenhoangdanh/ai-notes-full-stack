'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog'
import { cn } from '../../lib/utils'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setOpen(false)
      setQuery('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search notes...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center border-b px-3">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes, workspaces, and more..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-2"
                  onClick={() => {
                    router.push('/notes/create')
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center">
                    <CommandLineIcon className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Create new note</div>
                      <div className="text-xs text-muted-foreground">Start writing immediately</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-2"
                  onClick={() => {
                    router.push('/workspaces/create')
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center">
                    <CommandLineIcon className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Create workspace</div>
                      <div className="text-xs text-muted-foreground">Organize your notes</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1">Enter</kbd> to search or{' '}
              <kbd className="rounded bg-muted px-1">Esc</kbd> to cancel
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}