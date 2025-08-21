'use client'

import { ReactNode } from 'react'
import { LucideIcon, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'

interface GradientCalloutProps {
  title: string
  description: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: 'ai' | 'success' | 'warning' | 'info'
  }
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    variant?: 'primary' | 'cta'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  variant?: 'ai' | 'success' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  children?: ReactNode
  className?: string
}

export function GradientCallout({
  title,
  description,
  icon: Icon = Sparkles,
  badge,
  action,
  secondaryAction,
  variant = 'ai',
  size = 'md',
  children,
  className = ''
}: GradientCalloutProps) {
  const gradients = {
    ai: 'bg-gradient-to-r from-primary-600/10 via-purple/10 to-primary-600/10 border-primary-600/20',
    success: 'bg-gradient-to-r from-accent/10 via-green-400/10 to-accent/10 border-accent/20',
    info: 'bg-gradient-to-r from-info/10 via-blue-400/10 to-info/10 border-info/20',
    purple: 'bg-gradient-to-r from-purple/10 via-violet-400/10 to-purple/10 border-purple/20'
  }
  
  const glowEffects = {
    ai: 'shadow-glow',
    success: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    info: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    purple: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]'
  }
  
  const iconColors = {
    ai: 'text-primary-600',
    success: 'text-accent',
    info: 'text-info',
    purple: 'text-purple'
  }
  
  const sizes = {
    sm: {
      container: 'p-4',
      icon: 'w-5 h-5',
      iconContainer: 'w-10 h-10',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'gap-3'
    },
    md: {
      container: 'p-6',
      icon: 'w-6 h-6',
      iconContainer: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-base',
      spacing: 'gap-4'
    },
    lg: {
      container: 'p-8',
      icon: 'w-8 h-8',
      iconContainer: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-lg',
      spacing: 'gap-6'
    }
  }
  
  const sizeConfig = sizes[size]
  
  return (
    <div className={`
      panel border ${gradients[variant]} ${glowEffects[variant]} 
      transition-modern hover:shadow-2 ${sizeConfig.container} ${className}
    `}>
      <div className={`flex items-start ${sizeConfig.spacing}`}>
        {/* Icon */}
        <div className={`
          ${sizeConfig.iconContainer} rounded-xl bg-gradient-to-br from-bg-elev-1 to-bg-elev-2 
          flex items-center justify-center flex-shrink-0 animate-float-subtle
        `}>
          <Icon className={`${sizeConfig.icon} ${iconColors[variant]}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-text ${sizeConfig.title}`}>
                {title}
              </h3>
              {badge && (
                <Badge variant={badge.variant || 'ai'} size="sm">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            <p className={`text-text-muted leading-relaxed ${sizeConfig.description}`}>
              {description}
            </p>
          </div>
          
          {/* Actions */}
          {(action || secondaryAction || children) && (
            <div className="flex items-center gap-3 flex-wrap">
              {action && (
                <Button
                  variant={action.variant || 'primary'}
                  icon={action.icon}
                  onClick={action.onClick}
                  size={size === 'lg' ? 'lg' : 'md'}
                >
                  {action.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button
                  variant="ghost"
                  icon={secondaryAction.icon}
                  onClick={secondaryAction.onClick}
                  size={size === 'lg' ? 'lg' : 'md'}
                >
                  {secondaryAction.label}
                </Button>
              )}
              
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Specialized callout components
export function AIFeatureCallout({
  title,
  description,
  onGetStarted,
  onLearnMore
}: {
  title: string
  description: string
  onGetStarted: () => void
  onLearnMore?: () => void
}) {
  return (
    <GradientCallout
      variant="ai"
      title={title}
      description={description}
      badge={{ text: 'AI-Powered', variant: 'ai' }}
      action={{
        label: 'Get Started',
        onClick: onGetStarted,
        icon: Sparkles,
        variant: 'primary'
      }}
      secondaryAction={onLearnMore ? {
        label: 'Learn More',
        onClick: onLearnMore
      } : undefined}
    />
  )
}

export function SuccessCallout({
  title,
  description,
  action
}: {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <GradientCallout
      variant="success"
      title={title}
      description={description}
      action={action ? {
        ...action,
        variant: 'cta' as const
      } : undefined}
      size="sm"
    />
  )
}

export function InfoCallout({
  title,
  description,
  action
}: {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <GradientCallout
      variant="info"
      title={title}
      description={description}
      action={action}
      size="sm"
    />
  )
}
