'use client'

import { ReactNode } from 'react'
import { LucideIcon, FileText, Search, Plus, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    variant?: 'primary' | 'secondary' | 'cta'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  badge?: {
    text: string
    variant?: 'default' | 'ai' | 'success' | 'warning' | 'danger'
  }
  children?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  secondaryAction,
  badge,
  children,
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'w-8 h-8',
      iconContainer: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-3'
    },
    md: {
      container: 'py-12',
      icon: 'w-10 h-10',
      iconContainer: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16',
      icon: 'w-12 h-12',
      iconContainer: 'w-24 h-24',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6'
    }
  }
  
  const sizeConfig = sizes[size]
  
  return (
    <div className={`text-center ${sizeConfig.container} ${className}`}>
      <div className={`mx-auto ${sizeConfig.spacing}`}>
        {/* Icon */}
        <div className={`mx-auto ${sizeConfig.iconContainer} rounded-full bg-bg-elev-1 flex items-center justify-center`}>
          <Icon className={`${sizeConfig.icon} text-text-subtle`} />
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className={`font-semibold text-text ${sizeConfig.title}`}>
              {title}
            </h3>
            {badge && (
              <Badge variant={badge.variant || 'default'}>
                {badge.text}
              </Badge>
            )}
          </div>
          
          <p className={`text-text-muted max-w-md mx-auto leading-relaxed ${sizeConfig.description}`}>
            {description}
          </p>
        </div>
        
        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                variant="ghost"
                icon={secondaryAction.icon}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
        
        {/* Custom content */}
        {children}
      </div>
    </div>
  )
}

// Specialized empty state components
export function NoNotesEmptyState({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No notes yet"
      description="Create your first note to get started with AI-powered insights and organization."
      action={{
        label: 'Create Note',
        onClick: onCreateNote,
        icon: Plus,
        variant: 'primary'
      }}
    />
  )
}

export function NoSearchResultsEmptyState({ 
  query, 
  onClear 
}: { 
  query: string
  onClear: () => void 
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No results found for "${query}". Try adjusting your search terms or browse categories.`}
      action={{
        label: 'Clear Search',
        onClick: onClear,
        variant: 'secondary'
      }}
      size="sm"
    />
  )
}

export function ErrorEmptyState({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description={error || "An unexpected error occurred. Please try again."}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
        variant: 'secondary'
      } : undefined}
      size="sm"
    />
  )
}

export function LoadingEmptyState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-bg-elev-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-text">
            {message}
          </h3>
          <p className="text-sm text-text-muted">
            Please wait while we load your content
          </p>
        </div>
      </div>
    </div>
  )
}

export function ComingSoonEmptyState({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Coming Soon"
      description={`${feature} is currently in development and will be available in a future update.`}
      badge={{
        text: 'Beta',
        variant: 'warning'
      }}
      size="sm"
    />
  )
}
