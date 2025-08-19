'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  CommandLineIcon,
  DocumentTextIcon,
  FolderIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog'
import { cn } from '../../lib/utils'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'note' | 'workspace' | 'template' | 'action'
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string
  timestamp?: string
}

interface GlobalSearchProps {
  onFocusChange?: (focused: boolean) => void
  autoFocus?: boolean
  className?: string
}

export function GlobalSearch({ onFocusChange, autoFocus, className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search results - replace with actual search logic
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      title: 'Project Meeting Notes',
      description: 'Discussion about Q4 goals and strategy',
      type: 'note',
      href: '/notes/1',
      icon: DocumentTextIcon,
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      title: 'Work Workspace',
      description: '24 notes • 3 collaborators',
      type: 'workspace',
      href: '/workspaces/work',
      icon: FolderIcon,
      badge: 'Active'
    },
    {
      id: '3',
      title: 'Daily Standup Template',
      description: 'Template for daily team meetings',
      type: 'template',
      href: '/templates/standup',
      icon: DocumentTextIcon
    }
  ]

  const quickActions: SearchResult[] = [
    {
      id: 'create-note',
      title: 'Create new note',
      description: 'Start writing immediately',
      type: 'action',
      href: '/notes/create',
      icon: DocumentTextIcon
    },
    {
      id: 'create-workspace',
      title: 'Create workspace',
      description: 'Organize your notes',
      type: 'action',
      href: '/workspaces/create',
      icon: FolderIcon
    },
    {
      id: 'ai-chat',
      title: 'Open AI Assistant',
      description: 'Get help with your notes',
      type: 'action',
      href: '/ai/chat',
      icon: SparklesIcon,
      badge: 'New'
    }
  ]

  // Filter results based on query
  const filteredResults = query.trim() 
    ? mockSearchResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const allResults = query.trim() 
    ? [...filteredResults, ...quickActions]
    : quickActions

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (allResults[selectedIndex]) {
          handleSelect(allResults[selectedIndex])
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % allResults.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length)
        break
      case 'Escape':
        if (open) {
          setOpen(false)
        }
        break
    }
  }, [allResults, selectedIndex, open])

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Handle focus changes
  useEffect(() => {
    onFocusChange?.(focused || open)
  }, [focused, open, onFocusChange])

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSelect = useCallback((result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [router])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [])

  const SearchTrigger = (
    <Button
      variant="outline"
      className={cn(
        "relative h-10 w-full justify-start text-sm text-muted-foreground",
        "border-border/60 bg-background/50 backdrop-blur-sm",
        "hover:bg-accent/10 hover:border-border/80",
        "focus-visible:ring-2 focus-visible:ring-accent/30",
        "transition-all duration-200",
        "sm:pr-12 md:w-48 lg:w-72",
        className
      )}
      onClick={() => setOpen(true)}
    >
      <MagnifyingGlassIcon className="mr-2 h-4 w-4 text-muted-foreground" />
      <span className="hidden lg:inline-flex">Search notes, workspaces...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded-md border bg-muted/50 px-2 font-mono text-xs font-medium opacity-70 sm:flex">
        <span className="text-xs">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</span>
        <span>K</span>
      </kbd>
    </Button>
  )

  const SearchInput = (
    <div className="relative">
      <Input
        ref={inputRef}
        data-search-input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search notes, workspaces, and more..."
        className={cn(
          "h-12 pl-12 pr-4 text-base",
          "border-border/60 bg-background/50 backdrop-blur-sm",
          "focus-visible:ring-2 focus-visible:ring-accent/30",
          "transition-all duration-200",
          className
        )}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      
      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        </div>
      )}
    </div>
  )

  // For mobile or when used as inline component
  if (autoFocus) {
    return SearchInput
  }

  return (
    <>
      {SearchTrigger}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Search</DialogTitle>
          
          {/* Search Header */}
          <div className="flex items-center border-b border-border/60 px-4 py-3">
            <MagnifyingGlassIcon className="mr-3 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes, workspaces, and more..."
              className="flex-1 border-none bg-transparent px-0 py-2 text-base outline-none focus-visible:ring-0 placeholder:text-muted-foreground"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            
            {isLoading && (
              <div className="ml-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              </div>
            )}
          </div>
          
          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {allResults.length > 0 ? (
              <div className="p-2">
                {query.trim() && filteredResults.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Search Results
                    </div>
                    <div className="space-y-1">
                      {filteredResults.map((result, index) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          selected={index === selectedIndex}
                          onSelect={() => handleSelect(result)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {query.trim() ? 'Quick Actions' : 'Quick Actions'}
                  </div>
                  <div className="space-y-1">
                    {quickActions.map((action, index) => (
                      <SearchResultItem
                        key={action.id}
                        result={action}
                        selected={(query.trim() ? filteredResults.length : 0) + index === selectedIndex}
                        onSelect={() => handleSelect(action)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : query.trim() ? (
              <div className="p-8 text-center">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-sm font-medium text-foreground">No results found</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try adjusting your search terms or create a new note
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleSelect(quickActions[0])}
                >
                  <DocumentTextIcon className="mr-2 h-4 w-4" />
                  Create new note
                </Button>
              </div>
            ) : null}
          </div>
          
          {/* Search Footer */}
          <div className="border-t border-border/60 px-4 py-3 bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Enter</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded bg-background px-1.5 py-0.5 font-mono">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <span>Powered by</span>
                <SparklesIcon className="h-3 w-3" />
                <span className="font-medium">AI</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Search result item component
function SearchResultItem({ 
  result, 
  selected, 
  onSelect 
}: { 
  result: SearchResult
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
        "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none",
        selected && "bg-accent/15 ring-1 ring-accent/30"
      )}
      onClick={onSelect}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md",
          result.type === 'note' && "bg-blue-500/10 text-blue-600",
          result.type === 'workspace' && "bg-green-500/10 text-green-600",
          result.type === 'template' && "bg-purple-500/10 text-purple-600",
          result.type === 'action' && "bg-accent/10 text-accent-foreground"
        )}>
          <result.icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">
            {result.title}
          </span>
          {result.badge && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-accent/20 text-accent-foreground rounded">
              {result.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {result.description}
        </p>
        {result.timestamp && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {result.timestamp}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0 text-muted-foreground/50">
        <ArrowRightIcon className="h-4 w-4" />
      </div>
    </button>
  )
}
