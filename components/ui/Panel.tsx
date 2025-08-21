'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface PanelProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  toolbar?: ReactNode
  loading?: boolean
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  variant?: 'default' | 'glass'
}

export function Panel({
  title,
  subtitle,
  icon: Icon,
  toolbar,
  loading = false,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default'
}: PanelProps) {
  const panelClasses = variant === 'glass' ? 'panel-glass' : 'panel'
  
  return (
    <div className={`${panelClasses} ${className}`}>
      {(title || toolbar) && (
        <div className={`flex items-center justify-between p-6 border-b border-border-soft ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-1.5 rounded-md bg-bg-elev-1">
                <Icon className="w-4 h-4 text-primary-600" />
              </div>
            )}
            
            {title && (
              <div>
                <h2 className="text-lg font-semibold text-text">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-text-muted mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {toolbar && (
            <div className="flex items-center gap-2">
              {toolbar}
            </div>
          )}
        </div>
      )}
      
      <div className={`p-6 ${contentClassName}`}>
        {loading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="skeleton h-4 w-3/4 rounded"></div>
              <div className="skeleton h-4 w-1/2 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-4 w-5/6 rounded"></div>
              <div className="skeleton h-4 w-2/3 rounded"></div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

interface PanelHeaderProps {
  children: ReactNode
  className?: string
}

export function PanelHeader({ children, className = '' }: PanelHeaderProps) {
  return (
    <div className={`p-6 border-b border-border-soft ${className}`}>
      {children}
    </div>
  )
}

interface PanelContentProps {
  children: ReactNode
  className?: string
}

export function PanelContent({ children, className = '' }: PanelContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

interface PanelFooterProps {
  children: ReactNode
  className?: string
}

export function PanelFooter({ children, className = '' }: PanelFooterProps) {
  return (
    <div className={`p-6 border-t border-border-soft ${className}`}>
      {children}
    </div>
  )
}
