'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'ai' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'secondary' | 'destructive' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  dot?: boolean
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  dot = false,
  className
}: BadgeProps) {
  const baseClasses = 'badge inline-flex items-center font-medium whitespace-nowrap'
  
  const variants = {
    default: 'badge-primary',
    ai: 'badge-ai animate-pulse-glow',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'bg-info/10 text-info border border-info/20',
    purple: 'bg-purple/10 text-purple border border-purple/20',
    secondary: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    destructive: 'bg-red-100 text-red-700 border border-red-200',
    gradient: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border border-brand-600/20'
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  }
  
  const iconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  }

  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }
  
  const badgeClasses = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )
  
  return (
    <span className={badgeClasses}>
      {dot && (
        <span className={`status-dot ${dotSizes[size]} flex-shrink-0`} />
      )}
      
      {Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizes[size]} flex-shrink-0`} />
      )}
      
      <span className="truncate">{children}</span>
      
      {Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizes[size]} flex-shrink-0`} />
      )}
    </span>
  )
}

// Specialized badge components
export function AIBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="ai" {...props}>{children}</Badge>
}

export function SuccessBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="success" {...props}>{children}</Badge>
}

export function WarningBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="danger" {...props}>{children}</Badge>
}

export function DangerBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="danger" {...props}>{children}</Badge>
}

export function CountBadge({ 
  count, 
  max = 99,
  ...props 
}: Omit<BadgeProps, 'children'> & { 
  count: number
  max?: number 
}) {
  const displayCount = count > max ? `${max}+` : count.toString()
  
  return (
    <Badge variant="danger" size="sm" {...props}>
      {displayCount}
    </Badge>
  )
}

export function StatusBadge({
  status,
  ...props
}: Omit<BadgeProps, 'children' | 'variant' | 'dot'> & {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active'
}) {
  const statusConfig = {
    online: { variant: 'success' as const, text: 'Online' },
    offline: { variant: 'default' as const, text: 'Offline' },
    away: { variant: 'warning' as const, text: 'Away' },
    busy: { variant: 'danger' as const, text: 'Busy' },
    active: { variant: 'success' as const, text: 'Active' }
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} dot {...props}>
      {config.text}
    </Badge>
  )
}

export const badgeVariants = {
  default: 'badge-primary',
  ai: 'badge-ai animate-pulse-glow',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'bg-info/10 text-info border border-info/20',
  purple: 'bg-purple/10 text-purple border border-purple/20',
  secondary: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  destructive: 'bg-red-100 text-red-700 border border-red-200',
  gradient: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border border-brand-600/20'
}
