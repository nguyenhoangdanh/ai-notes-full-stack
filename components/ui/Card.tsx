'use client'

import { ReactNode, HTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'glass' | 'elevated' | 'outlined'
  interactive?: boolean
  loading?: boolean
}

export function Card({
  children,
  variant = 'default',
  interactive = false,
  loading = false,
  className,
  ...props
}: CardProps) {
  const variants = {
    default: 'card-modern',
    glass: 'glass border border-glass-border shadow-2',
    elevated: 'panel shadow-3 hover:shadow-4'
  }
  
  return (
    <div
      className={cn(
        variants[variant],
        interactive && 'interactive cursor-pointer',
        loading && 'opacity-50 pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = ''
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-6 border-b border-border-soft', className)}>
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <div className="p-2 rounded-lg bg-bg-elev-1">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-text">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-muted mt-0.5">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function CardContent({
  children,
  className = '',
  padding = true
}: CardContentProps) {
  return (
    <div className={cn(padding && 'p-6', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({
  children,
  className = ''
}: CardFooterProps) {
  return (
    <div className={cn('p-6 border-t border-border-soft', className)}>
      {children}
    </div>
  )
}

// Specialized card components
interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  badge?: {
    text: string
    variant?: 'default' | 'ai' | 'success' | 'warning'
  }
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  badge,
  action,
  className = ''
}: FeatureCardProps) {
  return (
    <Card variant="glass" interactive={!!action} className={className} onClick={action?.onClick}>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-600/10 to-purple/10 border border-primary-600/20">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text">{title}</h3>
              {badge && (
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full font-medium',
                  badge.variant === 'ai' && 'bg-primary-600/10 text-primary-600 border border-primary-600/20',
                  badge.variant === 'success' && 'bg-accent/10 text-accent border border-accent/20',
                  badge.variant === 'warning' && 'bg-warning/10 text-warning border border-warning/20',
                  (!badge.variant || badge.variant === 'default') && 'bg-bg-elev-1 text-text-muted border border-border-soft'
                )}>
                  {badge.text}
                </span>
              )}
            </div>
            
            <p className="text-sm text-text-muted leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {action && (
          <div className="pt-2">
            <span className="text-sm text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
              {action.label} →
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: LucideIcon
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  className = ''
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          {Icon && (
            <div className="p-1.5 rounded-md bg-bg-elev-1">
              <Icon className="w-4 h-4 text-text-subtle" />
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-text">{value}</p>
          
          {change && (
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                'font-medium',
                change.type === 'increase' && 'text-accent',
                change.type === 'decrease' && 'text-danger',
                change.type === 'neutral' && 'text-text-subtle'
              )}>
                {change.type === 'increase' && '+'}
                {change.type === 'decrease' && '-'}
                {Math.abs(change.value)}%
              </span>
              {change.period && (
                <span className="text-text-subtle">{change.period}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  action: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'cta'
  }
  className?: string
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  action,
  className = ''
}: ActionCardProps) {
  return (
    <Card variant="glass" className={className}>
      <CardContent className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-bg-elev-1 to-bg-elev-2 flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        </div>
        
        <button
          onClick={action.onClick}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg font-medium transition-modern focus-ring',
            action.variant === 'cta' && 'btn-cta text-white',
            action.variant === 'secondary' && 'btn-secondary',
            (!action.variant || action.variant === 'primary') && 'btn-primary text-white'
          )}
        >
          {action.label}
        </button>
      </CardContent>
    </Card>
  )
}
