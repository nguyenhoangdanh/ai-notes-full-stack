'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Badge } from './Badge'
import { Button } from './Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: 'default' | 'ai' | 'success' | 'warning' | 'danger'
  }
  actions?: ReactNode
  breadcrumb?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  actions,
  breadcrumb,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumb && (
        <div className="text-sm text-text-subtle">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="glass p-2.5 rounded-lg">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-text leading-tight">
                {title}
              </h1>
              
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>
          
          {subtitle && (
            <h2 className="text-lg text-text-muted font-medium">
              {subtitle}
            </h2>
          )}
          
          {description && (
            <p className="text-sm text-text-subtle leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
