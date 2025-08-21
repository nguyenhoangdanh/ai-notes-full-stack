'use client'

import { ReactNode } from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  delta?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: LucideIcon
  iconColor?: string
  loading?: boolean
  children?: ReactNode
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  subtitle,
  delta,
  icon: Icon,
  iconColor = 'text-primary-600',
  loading = false,
  children,
  className = '',
  onClick
}: StatCardProps) {
  const Component = onClick ? 'button' : 'div'
  
  if (loading) {
    return (
      <div className={`panel p-6 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-8 w-16 rounded"></div>
            <div className="skeleton h-3 w-20 rounded"></div>
          </div>
          <div className="skeleton w-10 h-10 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <Component
      className={`panel p-6 transition-modern hover-lift group ${
        onClick ? 'cursor-pointer focus-ring' : ''
      } ${className}`}
      onClick={onClick}
      {...(onClick ? { 
        role: 'button', 
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }
      } : {})}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h3 className="text-sm font-medium text-text-muted">
            {title}
          </h3>
          
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-text">
              {value}
            </p>
            
            {subtitle && (
              <p className="text-sm text-text-subtle">
                {subtitle}
              </p>
            )}
            
            {delta && (
              <div className="flex items-center gap-1 text-xs">
                {delta.type === 'increase' && (
                  <>
                    <TrendingUp className="w-3 h-3 text-accent" />
                    <span className="text-accent font-medium">
                      +{Math.abs(delta.value)}%
                    </span>
                  </>
                )}
                
                {delta.type === 'decrease' && (
                  <>
                    <TrendingDown className="w-3 h-3 text-danger" />
                    <span className="text-danger font-medium">
                      -{Math.abs(delta.value)}%
                    </span>
                  </>
                )}
                
                {delta.type === 'neutral' && (
                  <span className="text-text-subtle font-medium">
                    {delta.value > 0 ? '+' : ''}{delta.value}%
                  </span>
                )}
                
                {delta.period && (
                  <span className="text-text-subtle">
                    {delta.period}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {children}
        </div>
        
        {Icon && (
          <div className={`p-2.5 rounded-lg bg-bg-elev-1 group-hover:bg-bg-elev-2 transition-fast`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </Component>
  )
}
