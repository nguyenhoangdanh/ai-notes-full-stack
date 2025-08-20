'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  Tag,
  User,
  Sparkles,
  Clock,
  TrendingUp,
  Command
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { QuickTooltip } from '../ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'

interface SearchFilter {
  type: 'tag' | 'author' | 'date' | 'workspace'
  value: string
  label: string
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onFiltersChange?: (filters: SearchFilter[]) => void
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  showFilters?: boolean
  showSort?: boolean
  showAI?: boolean
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search notes and workspaces...",
  onFiltersChange,
  onSortChange,
  showFilters = true,
  showSort = true,
  showAI = true,
  className
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [sortField, setSortField] = useState<string>('updated')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Popular search suggestions
  const suggestions = [
    { icon: TrendingUp, text: "meeting notes", category: "Popular" },
    { icon: Sparkles, text: "project ideas", category: "AI Enhanced" },
    { icon: Clock, text: "today's tasks", category: "Recent" },
    { icon: Tag, text: "#productivity", category: "Tags" }
  ]

  // Sort options
  const sortOptions = [
    { field: 'updated', label: 'Last Updated' },
    { field: 'created', label: 'Date Created' },
    { field: 'title', label: 'Title' },
    { field: 'relevance', label: 'Relevance' }
  ]

  // Filter presets
  const filterPresets = [
    { type: 'date' as const, value: 'today', label: 'Today' },
    { type: 'date' as const, value: 'week', label: 'This Week' },
    { type: 'date' as const, value: 'month', label: 'This Month' },
    { type: 'tag' as const, value: 'important', label: '#important' },
    { type: 'tag' as const, value: 'work', label: '#work' },
    { type: 'workspace' as const, value: 'personal', label: 'Personal' }
  ]

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setShowSuggestions(true)
  }, [])

  const handleBlur = useCallback(() => {
    // Delay to allow for interactions
    setTimeout(() => {
      setIsFocused(false)
      setShowSuggestions(false)
    }, 150)
  }, [])

  const handleClear = useCallback(() => {
    onChange('')
    setFilters([])
    onFiltersChange?.([])
    inputRef.current?.focus()
  }, [onChange, onFiltersChange])

  const addFilter = useCallback((filter: SearchFilter) => {
    const newFilters = [...filters, filter]
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [filters, onFiltersChange])

  const removeFilter = useCallback((index: number) => {
    const newFilters = filters.filter((_, i) => i !== index)
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [filters, onFiltersChange])

  const handleSort = useCallback((field: string) => {
    let direction: 'asc' | 'desc' = 'desc'
    
    if (sortField === field) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc'
    }
    
    setSortField(field)
    setSortDirection(direction)
    onSortChange?.(field, direction)
  }, [sortField, sortDirection, onSortChange])

  const handleAISearch = useCallback(() => {
    if (value.trim()) {
      // Trigger AI-enhanced search
      console.log('AI search for:', value)
    }
  }, [value])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocused])

  return (
    <div className={cn("relative w-full", className)}>
      {/* Active Filters */}
      {filters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2 mb-3"
        >
          {filters.map((filter, index) => (
            <motion.div
              key={`${filter.type}-${filter.value}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge
                variant="outline"
                className="gap-1 pr-1 hover:bg-surface-hover cursor-pointer"
                onClick={() => removeFilter(index)}
              >
                {filter.type === 'tag' && <Tag className="h-3 w-3" />}
                {filter.type === 'author' && <User className="h-3 w-3" />}
                {filter.type === 'date' && <Calendar className="h-3 w-3" />}
                <span>{filter.label}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-4 w-4 p-0 hover:bg-danger/20 hover:text-danger"
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </Badge>
            </motion.div>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters([])
              onFiltersChange?.([])
            }}
            className="h-7 px-2 text-xs text-text-muted hover:text-danger"
          >
            Clear all
          </Button>
        </motion.div>
      )}

      {/* Search Input Container */}
      <div className="relative">
        <div className={cn(
          "relative flex items-center transition-modern",
          "rounded-2xl border shadow-1",
          isFocused 
            ? "border-brand-300 shadow-3 ring-4 ring-brand-100" 
            : "border-border hover:border-border-strong hover:shadow-2"
        )}>
          {/* Search Icon */}
          <Search className={cn(
            "absolute left-4 h-5 w-5 transition-colors",
            isFocused ? "text-brand-600" : "text-text-muted"
          )} />

          {/* Input */}
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "pl-12 pr-20 h-14 text-base border-0 rounded-2xl",
              "bg-surface focus:bg-surface shadow-none focus:shadow-none focus:ring-0",
              "placeholder:text-text-subtle"
            )}
          />

          {/* Right Actions */}
          <div className="absolute right-2 flex items-center gap-1">
            {/* AI Search Button */}
            {showAI && value && (
              <QuickTooltip content="AI-powered search">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleAISearch}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-modern",
                    "hover:bg-brand-100 hover:text-brand-700 hover:scale-110"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </QuickTooltip>
            )}

            {/* Clear Button */}
            {value && (
              <QuickTooltip content="Clear search">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClear}
                  className="h-10 w-10 rounded-xl hover:bg-surface-hover hover:scale-110 transition-modern"
                >
                  <X className="h-4 w-4" />
                </Button>
              </QuickTooltip>
            )}

            {/* Keyboard Shortcut Hint */}
            {!isFocused && !value && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-text-subtle">
                <kbd className="px-2 py-1 bg-bg-muted rounded-md text-xs font-mono border border-border-subtle">
                  {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="px-2 py-1 bg-bg-muted rounded-md text-xs font-mono border border-border-subtle">K</kbd>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          {/* Filters Dropdown */}
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "gap-2 rounded-xl transition-modern",
                    filters.length > 0 && "border-brand-300 bg-brand-50 text-brand-700"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {filters.length > 0 && (
                    <Badge variant="secondary" size="xs">
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56 p-2 rounded-xl">
                <DropdownMenuLabel className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Quick Filters
                </DropdownMenuLabel>
                
                {filterPresets.map((preset) => (
                  <DropdownMenuItem
                    key={`${preset.type}-${preset.value}`}
                    onClick={() => addFilter(preset)}
                    className="rounded-lg cursor-pointer"
                  >
                    {preset.type === 'tag' && <Tag className="h-4 w-4 mr-2" />}
                    {preset.type === 'date' && <Calendar className="h-4 w-4 mr-2" />}
                    {preset.type === 'workspace' && <User className="h-4 w-4 mr-2" />}
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Sort Dropdown */}
          {showSort && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  {sortDirection === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-48 p-2 rounded-xl">
                <DropdownMenuLabel className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Sort By
                </DropdownMenuLabel>
                
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.field}
                    onClick={() => handleSort(option.field)}
                    className={cn(
                      "rounded-lg cursor-pointer flex items-center justify-between",
                      sortField === option.field && "bg-brand-50 text-brand-700"
                    )}
                  >
                    <span>{option.label}</span>
                    {sortField === option.field && (
                      <div className="flex items-center">
                        {sortDirection === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && !value && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 z-50 mt-2"
            >
              <Card variant="glass" className="border border-border-subtle shadow-5 rounded-2xl p-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-text-secondary">Popular searches</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          onChange(suggestion.text)
                          setShowSuggestions(false)
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-modern text-left group"
                      >
                        <suggestion.icon className="h-4 w-4 text-brand-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="text-sm font-medium text-text">{suggestion.text}</div>
                          <div className="text-xs text-text-muted">{suggestion.category}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
