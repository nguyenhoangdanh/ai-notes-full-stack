import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  X, 
  Clock, 
  FileText, 
  Tag,
  Filter,
  SortAscending,
  Star
} from '@phosphor-icons/react'
import { useOfflineNotes } from '@/contexts/OfflineNotesContext'
import { OfflineNote } from '@/lib/offline-storage'
import Fuse from 'fuse.js'

interface MobileSearchSheetProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

type SortOption = 'relevance' | 'date' | 'title' | 'modified'
type FilterOption = 'all' | 'today' | 'week' | 'month' | 'tagged'

export function MobileSearchSheet({ 
  isOpen, 
  onClose, 
  searchQuery, 
  onSearchChange 
}: MobileSearchSheetProps) {
  const { notes, selectNote, searchNotes } = useOfflineNotes()
  const [searchResults, setSearchResults] = useState<OfflineNote[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(notes, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 },
        { name: 'tags', weight: 1.5 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true
    })
  }, [notes])

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-notes-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load recent searches:', error)
      }
    }
  }, [])

  // Save recent searches
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('ai-notes-recent-searches', JSON.stringify(updated))
  }

  // Perform search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      // Use Fuse.js for fuzzy search
      const fuseResults = fuse.search(query)
      let results = fuseResults.map(result => result.item)
      
      // Apply filters
      results = applyFilters(results)
      
      // Apply sorting
      results = applySorting(results, fuseResults)
      
      setSearchResults(results)
      saveRecentSearch(query)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Apply filters
  const applyFilters = (results: OfflineNote[]): OfflineNote[] => {
    switch (filterBy) {
      case 'today':
        return results.filter(note => {
          const today = new Date()
          const noteDate = new Date(note.updatedAt)
          return noteDate.toDateString() === today.toDateString()
        })
      case 'week':
        return results.filter(note => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(note.updatedAt) >= weekAgo
        })
      case 'month':
        return results.filter(note => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return new Date(note.updatedAt) >= monthAgo
        })
      case 'tagged':
        return results.filter(note => note.tags && note.tags.length > 0)
      default:
        return results
    }
  }

  // Apply sorting
  const applySorting = (results: OfflineNote[], fuseResults?: any[]): OfflineNote[] => {
    switch (sortBy) {
      case 'relevance':
        // Already sorted by Fuse.js relevance
        return results
      case 'date':
        return [...results].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'modified':
        return [...results].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      case 'title':
        return [...results].sort((a, b) => 
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        )
      default:
        return results
    }
  }

  // Search when query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, sortBy, filterBy])

  const handleNoteSelect = (note: OfflineNote) => {
    selectNote(note)
    onClose()
  }

  const clearSearch = () => {
    onSearchChange('')
    setSearchResults([])
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('ai-notes-recent-searches')
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notes..."
                className="pl-10 pr-10"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pb-2">
                  {/* Sort Options */}
                  <div>
                    <p className="text-sm font-medium mb-2">Sort by</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'date', label: 'Date Created' },
                        { value: 'modified', label: 'Last Modified' },
                        { value: 'title', label: 'Title' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy(option.value as SortOption)}
                          className="whitespace-nowrap"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Options */}
                  <div>
                    <p className="text-sm font-medium mb-2">Filter by</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {[
                        { value: 'all', label: 'All Notes' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' },
                        { value: 'tagged', label: 'Tagged' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={filterBy === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterBy(option.value as FilterOption)}
                          className="whitespace-nowrap"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {!searchQuery ? (
            // Recent searches and suggestions
            <div className="p-4 space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => onSearchChange(search)}
                      >
                        <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-left">{search}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search suggestions */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Search Suggestions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['today', 'important', 'ideas', 'work', 'personal', 'todo'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      onClick={() => onSearchChange(suggestion)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Search results
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  {searchResults.map((note) => (
                    <Card
                      key={note.id}
                      className="p-4 cursor-pointer active:scale-95 transition-transform"
                      onClick={() => handleNoteSelect(note)}
                    >
                      <div className="space-y-2">
                        <h3 className="font-medium">
                          {highlightText(note.title, searchQuery)}
                        </h3>
                        
                        {note.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {highlightText(note.content.slice(0, 150), searchQuery)}
                            {note.content.length > 150 && '...'}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(new Date(note.updatedAt))}</span>
                          
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1">
                              {note.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {highlightText(tag, searchQuery)}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}