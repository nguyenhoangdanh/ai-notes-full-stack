'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Clock, 
  Hash, 
  FileText, 
  Users, 
  Folder,
  Sparkles,
  ArrowRight,
  Command,
  TrendingUp,
  X,
  Filter,
  Calendar,
  Star
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { useNotes as useNotesQuery } from '../../hooks'
import { notesUtils } from '../../stores/notes.store'
import { useAuth } from '../../hooks/use-auth'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface SearchResult {
  id: string
  type: 'note' | 'workspace' | 'tag' | 'user' | 'command' | 'ai-suggestion'
  title: string
  description?: string
  content?: string
  metadata?: {
    updatedAt?: Date
    author?: string
    tags?: string[]
    workspaceName?: string
    relevance?: number
  }
  action?: () => void
}

interface GlobalSearchProps {
  placeholder?: string
  onFocusChange?: (focused: boolean) => void
  autoFocus?: boolean
  className?: string
}

export function GlobalSearch({
  placeholder = "Search notes, workspaces, and more...",
  onFocusChange,
  autoFocus = false,
  className
}: GlobalSearchProps) {

  const { notes } = useNotes();


  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Enhanced search functionality with fuzzy matching
  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()

    // Search notes with relevance scoring
    notes.forEach(note => {
      const titleMatch = note.title.toLowerCase().includes(searchTerm)
      const contentMatch = note.content.toLowerCase().includes(searchTerm)
      const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      
      if (titleMatch || contentMatch || tagMatch) {
        let relevance = 0
        if (titleMatch) relevance += 3
        if (contentMatch) relevance += 1
        if (tagMatch) relevance += 2

        results.push({
          id: note.id,
          type: 'note',
          title: note.title,
          description: note.content.slice(0, 120) + (note.content.length > 120 ? '...' : ''),
          metadata: {
            updatedAt: new Date(note.updatedAt),
            tags: note.tags,
            relevance
          }
        })
      }
    })

    // AI-powered suggestions based on query
    if (query.length > 2) {
      results.push({
        id: 'ai-suggestion-1',
        type: 'ai-suggestion',
        title: `AI Insights for "${query}"`,
        description: 'Get intelligent suggestions and related concepts',
        action: () => {
          toast.success('AI analysis started...')
        }
      })
    }

    // Quick commands
    const commands = [
      { 
        trigger: 'new', 
        title: 'Create New Note', 
        description: 'Start writing a new note',
        action: () => console.log('New note')
      },
      { 
        trigger: 'workspace', 
        title: 'Create Workspace', 
        description: 'Organize your notes in a new workspace',
        action: () => console.log('New workspace')
      },
      { 
        trigger: 'export', 
        title: 'Export Notes', 
        description: 'Download your notes in various formats',
        action: () => console.log('Export')
      },
      { 
        trigger: 'settings', 
        title: 'Open Settings', 
        description: 'Customize your AI Notes experience',
        action: () => console.log('Settings')
      }
    ]

    commands.forEach(cmd => {
      if (cmd.trigger.includes(searchTerm) || searchTerm.includes(cmd.trigger)) {
        results.push({
          id: `cmd-${cmd.trigger}`,
          type: 'command',
          title: cmd.title,
          description: cmd.description,
          action: cmd.action
        })
      }
    })

    // Sort by relevance
    return results.sort((a, b) => {
      const aRelevance = a.metadata?.relevance || 0
      const bRelevance = b.metadata?.relevance || 0
      return bRelevance - aRelevance
    }).slice(0, 8) // Limit results
  }, [query, notes])

  // Trending searches and suggestions
  const trendingSuggestions = useMemo(() => [
    { icon: TrendingUp, text: "productivity tips", type: "trending" },
    { icon: Sparkles, text: "AI writing assistant", type: "ai" },
    { icon: Calendar, text: "meeting notes", type: "template" },
    { icon: Star, text: "project planning", type: "popular" }
  ], [])

  const handleInputFocus = useCallback(() => {
    setIsFocused(true)
    setIsOpen(true)
    onFocusChange?.(true)
  }, [onFocusChange])

  const handleInputBlur = useCallback(() => {
    // Delay to allow for result selection
    setTimeout(() => {
      setIsFocused(false)
      setIsOpen(false)
      onFocusChange?.(false)
    }, 150)
  }, [onFocusChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(0)
    setIsOpen(true)
  }, [])

  const handleSearchSubmit = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10)
      return newHistory
    })

    // Add to recent searches
    setRecentSearches(prev => {
      const newRecent = [searchQuery, ...prev.filter(r => r !== searchQuery)].slice(0, 5)
      return newRecent
    })

    toast.success(`Searching for "${searchQuery}"...`)
  }, [query])

  const handleResultSelect = useCallback((result: SearchResult) => {
    if (result.action) {
      result.action()
    } else if (result.type === 'note') {
      // Navigate to note
      console.log('Navigate to note:', result.id)
    }
    
    setQuery('')
    setIsOpen(false)
    handleSearchSubmit(result.title)
  }, [handleSearchSubmit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (searchResults[selectedIndex]) {
          handleResultSelect(searchResults[selectedIndex])
        } else if (query.trim()) {
          handleSearchSubmit()
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, searchResults, selectedIndex, handleResultSelect, query, handleSearchSubmit])

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [selectedIndex])

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          data-search-input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-11 pr-4 h-12 rounded-full transition-modern",
            "bg-surface border-border hover:border-border-strong",
            "focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
            "shadow-1 hover:shadow-2 focus:shadow-3",
            isFocused && "border-brand-500 ring-4 ring-brand-100 shadow-3",
            className
          )}
          autoComplete="off"
          spellCheck={false}
        />
        
        {/* Search Icon */}
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
          isFocused ? "text-brand-600" : "text-text-muted"
        )} />

        {/* Clear Button */}
        {query && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card variant="glass" className="border border-border-subtle shadow-5 rounded-2xl overflow-hidden max-h-[70vh]">
              <ScrollArea className="max-h-[calc(70vh-2rem)]">
                <div ref={resultsRef} className="p-2">
                  {/* Query-based Results */}
                  {query && searchResults.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Search Results
                      </div>
                      
                      {searchResults.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultSelect(result)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-modern group",
                            "hover:bg-surface-hover active:bg-surface-active",
                            selectedIndex === index && "bg-brand-50 border border-brand-200"
                          )}
                        >
                          {/* Result Icon */}
                          <div className={cn(
                            "mt-0.5 p-2 rounded-lg transition-transform group-hover:scale-110",
                            result.type === 'note' && "bg-blue-100 text-blue-600",
                            result.type === 'workspace' && "bg-green-100 text-green-600",
                            result.type === 'tag' && "bg-purple-100 text-purple-600",
                            result.type === 'command' && "bg-orange-100 text-orange-600",
                            result.type === 'ai-suggestion' && "bg-brand-100 text-brand-600"
                          )}>
                            {result.type === 'note' && <FileText className="h-4 w-4" />}
                            {result.type === 'workspace' && <Folder className="h-4 w-4" />}
                            {result.type === 'tag' && <Hash className="h-4 w-4" />}
                            {result.type === 'command' && <Command className="h-4 w-4" />}
                            {result.type === 'ai-suggestion' && <Sparkles className="h-4 w-4" />}
                          </div>
                          
                          {/* Result Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-text truncate group-hover:text-brand-700">
                                {result.title}
                              </h4>
                              {result.type === 'ai-suggestion' && (
                                <Badge variant="gradient" size="xs">AI</Badge>
                              )}
                            </div>
                            
                            {result.description && (
                              <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                                {result.description}
                              </p>
                            )}
                            
                            {/* Metadata */}
                            {result.metadata && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-text-subtle">
                                {result.metadata.updatedAt && (
                                  <span>
                                    {result.metadata.updatedAt.toLocaleDateString()}
                                  </span>
                                )}
                                
                                {result.metadata.tags && result.metadata.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {result.metadata.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="outline" size="xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Arrow */}
                          <ArrowRight className="h-4 w-4 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Empty Results */}
                  {query && searchResults.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="p-4 bg-bg-muted rounded-2xl inline-block mb-4">
                        <Search className="h-8 w-8 text-text-muted" />
                      </div>
                      <h3 className="font-medium text-text mb-2">No results found</h3>
                      <p className="text-sm text-text-muted mb-4">
                        Try adjusting your search terms or create a new note with this content.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('Create note with query:', query)}
                        className="rounded-xl"
                      >
                        Create "{query}" note
                      </Button>
                    </div>
                  )}

                  {/* Default State - Recent & Suggestions */}
                  {!query && (
                    <div className="space-y-4">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Recent
                          </div>
                          <div className="space-y-1">
                            {recentSearches.map((search, index) => (
                              <div
                                key={search}
                                onClick={() => {
                                  setQuery(search)
                                  handleSearchSubmit(search)
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-surface-hover transition-modern group"
                              >
                                <Clock className="h-4 w-4 text-text-muted" />
                                <span className="flex-1 text-text group-hover:text-brand-600">{search}</span>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setRecentSearches(prev => prev.filter(s => s !== search))
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending Suggestions */}
                      <div>
                        <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {trendingSuggestions.map((suggestion, index) => (
                            <Button
                              key={suggestion.text}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setQuery(suggestion.text)
                                handleSearchSubmit(suggestion.text)
                              }}
                              className="h-auto p-3 justify-start text-left rounded-xl hover:bg-brand-50 group"
                            >
                              <suggestion.icon className="h-4 w-4 mr-2 text-brand-600 group-hover:scale-110 transition-transform" />
                              <span className="text-sm truncate">{suggestion.text}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div>
                        <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Quick Actions
                        </div>
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            onClick={() => console.log('New note')}
                            className="w-full justify-start h-11 px-3 rounded-xl hover:bg-brand-50 group"
                          >
                            <div className="p-2 bg-brand-100 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                              <FileText className="h-4 w-4 text-brand-600" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-text">Create New Note</div>
                              <div className="text-xs text-text-muted">Start writing immediately</div>
                            </div>
                            <Badge variant="outline" size="xs" className="ml-auto">⌘N</Badge>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
