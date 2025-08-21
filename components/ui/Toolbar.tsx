'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ToolbarProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  justify?: 'start' | 'end' | 'center' | 'between'
  wrap?: boolean
}

export function Toolbar({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  justify = 'between',
  wrap = false
}: ToolbarProps) {
  const variants = {
    default: 'bg-bg-elev-1 border border-border',
    glass: 'glass border border-glass-border'
  }
  
  const sizes = {
    sm: 'px-3 py-2 gap-2',
    md: 'px-4 py-3 gap-3',
    lg: 'px-6 py-4 gap-4'
  }
  
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between'
  }
  
  return (
    <div className={cn(
      'flex items-center rounded-lg transition-modern',
      variants[variant],
      sizes[size],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  )
}

interface ToolbarSectionProps {
  children: ReactNode
  className?: string
}

export function ToolbarSection({ children, className = '' }: ToolbarSectionProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  )
}

interface ToolbarSeparatorProps {
  className?: string
}

export function ToolbarSeparator({ className = '' }: ToolbarSeparatorProps) {
  return (
    <div className={cn('w-px h-4 bg-border-soft', className)} />
  )
}

interface ToolbarGroupProps {
  children: ReactNode
  className?: string
}

export function ToolbarGroup({ children, className = '' }: ToolbarGroupProps) {
  return (
    <div className={cn(
      'flex items-center gap-1 p-1 rounded-md bg-bg-elev-2/50 border border-border-soft',
      className
    )}>
      {children}
    </div>
  )
}

// Specialized toolbar components
export function SearchToolbar({
  searchInput,
  filters,
  actions,
  className = ''
}: {
  searchInput: ReactNode
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <Toolbar className={className}>
      <ToolbarSection>
        {searchInput}
        {filters && (
          <>
            <ToolbarSeparator />
            {filters}
          </>
        )}
      </ToolbarSection>
      
      {actions && (
        <ToolbarSection>
          {actions}
        </ToolbarSection>
      )}
    </Toolbar>
  )
}

export function BulkActionToolbar({
  selectedCount,
  actions,
  onClear,
  className = ''
}: {
  selectedCount: number
  actions: ReactNode
  onClear: () => void
  className?: string
}) {
  if (selectedCount === 0) return null
  
  return (
    <Toolbar variant="glass" className={cn('shadow-2', className)}>
      <ToolbarSection>
        <span className="text-sm font-medium text-text">
          {selectedCount} selected
        </span>
        <button
          onClick={onClear}
          className="text-sm text-text-muted hover:text-text transition-fast"
        >
          Clear
        </button>
      </ToolbarSection>
      
      <ToolbarSection>
        {actions}
      </ToolbarSection>
    </Toolbar>
  )
}

export function FilterToolbar({
  filters,
  activeCount,
  onClearAll,
  className = ''
}: {
  filters: ReactNode
  activeCount?: number
  onClearAll?: () => void
  className?: string
}) {
  return (
    <Toolbar variant="default" size="sm" className={className}>
      <ToolbarSection>
        <span className="text-sm font-medium text-text-muted">Filters:</span>
        {filters}
      </ToolbarSection>
      
      {activeCount && activeCount > 0 && onClearAll && (
        <ToolbarSection>
          <button
            onClick={onClearAll}
            className="text-sm text-text-muted hover:text-text transition-fast"
          >
            Clear all ({activeCount})
          </button>
        </ToolbarSection>
      )}
    </Toolbar>
  )
}
