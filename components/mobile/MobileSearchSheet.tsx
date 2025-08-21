'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Search, 
  X, 
  Filter, 
  Clock, 
  Tag, 
  FileText,
  Star,
  Calendar,
  User,
  Folder,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
  Grid,
  List
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'

interface SearchResult {
  id: string
  type: 'note' | 'workspace' | 'tag' | 'user'
  title: string
  content: string
  metadata: {
    lastModified: Date
    tags: string[]
    workspace?: string
    author?: string
  }
  relevance: number
}

interface FilterOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface MobileSearchSheetProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
}

export function MobileSearchSheet({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  className
}: MobileSearchSheetProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'meeting notes',
    'project ideas',
    'weekly review',
    'task list'
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Mock search results
  const searchResults = useMemo((): SearchResult[] => {
    if (!localQuery.trim()) return []

    return [
      {
        id: '1',
        type: 'note' as const,
        title: 'Project Kickoff Meeting',
        content: 'Discussion about the new AI features and timeline for implementation...',
        metadata: {
          lastModified: new Date('2024-01-15'),
          tags: ['meeting', 'project', 'ai'],
          workspace: 'Work'
        },
        relevance: 95
      },
      {
        id: '2',
        type: 'note' as const,
        title: 'Ideas for Mobile App',
        content: 'Voice recording feature, offline sync, gesture controls...',
        metadata: {
          lastModified: new Date('2024-01-14'),
          tags: ['ideas', 'mobile', 'features'],
          workspace: 'Personal'
        },
        relevance: 87
      },
      {
        id: '3',
        type: 'workspace' as const,
        title: 'Personal Projects',
        content: 'Collection of personal development and side projects',
        metadata: {
          lastModified: new Date('2024-01-13'),
          tags: ['workspace'],
        },
        relevance: 78
      }
    ].filter(result => 
      result.title.toLowerCase().includes(localQuery.toLowerCase()) ||
      result.content.toLowerCase().includes(localQuery.toLowerCase()) ||
      result.metadata.tags.some(tag => tag.toLowerCase().includes(localQuery.toLowerCase()))
    )
  }, [localQuery])

  // Filter options
  const filterOptions: FilterOption[] = [
    { id: 'notes', label: 'Notes', icon: FileText, count: 156 },
    { id: 'workspaces', label: 'Workspaces', icon: Folder, count: 12 },
    { id: 'tags', label: 'Tags', icon: Tag, count: 89 },
    { id: 'recent', label: 'Recent', icon: Clock, count: 45 },
    { id: 'starred', label: 'Starred', icon: Star, count: 23 },
  ]

  // Trending suggestions
  const trendingSuggestions = [
    { text: 'productivity tips', icon: TrendingUp },
    { text: 'meeting notes', icon: FileText },
    { text: 'project planning', icon: Folder },
    { text: '#important', icon: Tag }
  ]

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Sync with parent search query
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  // Handle search submission
  const handleSearch = useCallback((query: string) => {
    onSearchChange(query)
    
    // Add to recent searches
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)])
    }
  }, [onSearchChange, recentSearches])

  // Handle filter toggle
  const toggleFilter = useCallback((filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }, [])

  // Handle drag to close
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (info.offset.y > 200) {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bg-overlay backdrop-blur-xl"
    >
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "flex flex-col h-full bg-surface rounded-t-3xl shadow-5 overflow-hidden",
          className
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center p-2">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text">Search</h2>
            <p className="text-sm text-text-muted">Find notes, workspaces, and more</p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "rounded-full transition-transform",
              showAdvanced && "rotate-180"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              ref={inputRef}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(localQuery)}
              placeholder="Search everything..."
              className="pl-12 pr-12 h-12 rounded-2xl text-base"
            />
            
            {localQuery && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setLocalQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filterOptions.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="whitespace-nowrap rounded-full gap-2"
              >
                <filter.icon className="h-3 w-3" />
                {filter.label}
                {filter.count && (
                  <Badge variant="secondary" size="xs">
                    {filter.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 border-b border-border-subtle"
            >
              <Card variant="glass" className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text">Advanced Options</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon-sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-lg"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon-sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-lg"
                    >
                      <Grid className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['relevance', 'date', 'name'].map((sort) => (
                    <Button
                      key={sort}
                      variant={sortBy === sort ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(sort as any)}
                      className="rounded-xl capitalize"
                    >
                      {sort}
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {localQuery.trim() === '' ? (
            /* Empty State - Recent & Suggestions */
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <h3 className="font-medium text-text">Recent</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <motion.div
                        key={search}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setLocalQuery(search)
                          handleSearch(search)
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
                      >
                        <Clock className="h-4 w-4 text-text-muted" />
                        <span className="flex-1 text-text group-hover:text-brand-600">
                          {search}
                        </span>
                        <ArrowRight className="h-4 w-4 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-text-muted" />
                  <h3 className="font-medium text-text">Trending</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {trendingSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.text}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Card
                        variant="glass"
                        className="p-4 cursor-pointer hover:border-brand-200 transition-colors group"
                        onClick={() => {
                          setLocalQuery(suggestion.text)
                          handleSearch(suggestion.text)
                        }}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <suggestion.icon className="h-5 w-5 text-brand-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-text">
                            {suggestion.text}
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-text-muted" />
                  <h3 className="font-medium text-text">Quick Actions</h3>
                </div>
                
                <Card variant="glass" className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 rounded-xl"
                    onClick={() => console.log('Create note')}
                  >
                    <div className="p-2 bg-brand-100 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-text">Create New Note</div>
                      <div className="text-sm text-text-muted">Start writing immediately</div>
                    </div>
                  </Button>
                </Card>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            /* Search Results */
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  {searchResults.length} results for "{localQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch(localQuery)}
                  className="gap-2 rounded-xl"
                >
                  <Sparkles className="h-3 w-3" />
                  AI Search
                </Button>
              </div>

              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 gap-3" 
                  : "space-y-3"
              )}>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      variant="glass"
                      className="p-4 cursor-pointer hover:border-brand-200 transition-colors group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-brand-100 rounded-lg group-hover:scale-110 transition-transform">
                            {result.type === 'note' && <FileText className="h-4 w-4 text-brand-600" />}
                            {result.type === 'workspace' && <Folder className="h-4 w-4 text-brand-600" />}
                            {result.type === 'tag' && <Tag className="h-4 w-4 text-brand-600" />}
                            {result.type === 'user' && <User className="h-4 w-4 text-brand-600" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-text group-hover:text-brand-700 transition-colors line-clamp-1">
                              {result.title}
                            </h3>
                            <p className="text-sm text-text-muted line-clamp-2 mt-1">
                              {result.content}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-text-subtle">
                          <span>
                            {result.metadata.lastModified.toLocaleDateString()}
                          </span>
                          
                          {result.metadata.tags.length > 0 && (
                            <div className="flex gap-1">
                              {result.metadata.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" size="xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* No Results */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="p-4 bg-bg-muted rounded-2xl mb-4">
                <Search className="h-8 w-8 text-text-muted" />
              </div>
              
              <h3 className="font-medium text-text mb-2">No results found</h3>
              <p className="text-sm text-text-muted mb-6 max-w-sm">
                Try adjusting your search terms or use different filters.
              </p>
              
              <div className="space-y-3 w-full max-w-xs">
                <Button
                  variant="outline"
                  onClick={() => setLocalQuery('')}
                  className="w-full rounded-xl"
                >
                  Clear Search
                </Button>
                
                <Button
                  variant="gradient"
                  onClick={() => console.log('Create note with query')}
                  className="w-full rounded-xl gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Create "{localQuery}" Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
