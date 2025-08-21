'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({
    label,
    description,
    size = 'md',
    variant = 'default',
    className,
    disabled,
    checked,
    ...props
  }, ref) => {
    const sizes = {
      sm: {
        switch: 'w-9 h-5',
        thumb: 'w-4 h-4',
        translate: 'translate-x-4'
      },
      md: {
        switch: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5'
      },
      lg: {
        switch: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'translate-x-7'
      }
    }
    
    const variants = {
      default: checked ? 'bg-primary-600' : 'bg-bg-elev-2',
      success: checked ? 'bg-accent' : 'bg-bg-elev-2',
      warning: checked ? 'bg-warning' : 'bg-bg-elev-2',
      danger: checked ? 'bg-danger' : 'bg-bg-elev-2'
    }
    
    const sizeConfig = sizes[size]
    const variantClass = variants[variant]
    
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only focus-ring"
            disabled={disabled}
            checked={checked}
            {...props}
          />
          
          {/* Switch track */}
          <div className={cn(
            'relative inline-flex items-center rounded-full border-2 border-transparent transition-modern focus-ring',
            sizeConfig.switch,
            variantClass,
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}>
            {/* Switch thumb */}
            <div className={cn(
              'inline-block rounded-full bg-white shadow-1 transition-transform',
              sizeConfig.thumb,
              checked ? sizeConfig.translate : 'translate-x-0.5'
            )} />
          </div>
        </div>
        
        {(label || description) && (
          <div className="space-y-1">
            {label && (
              <div className="text-sm font-medium text-text">
                {label}
              </div>
            )}
            {description && (
              <div className="text-xs text-text-muted leading-relaxed">
                {description}
              </div>
            )}
          </div>
        )}
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'

export function FeatureToggle({
  enabled,
  onToggle,
  feature,
  description,
  beta = false
}: {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  feature: string
  description: string
  beta?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 panel rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-text">{feature}</h4>
          {beta && (
            <span className="px-2 py-0.5 text-xs bg-warning/10 text-warning border border-warning/20 rounded-full">
              Beta
            </span>
          )}
        </div>
        <p className="text-sm text-text-muted mt-1">{description}</p>
      </div>
      
      <Toggle
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        variant="default"
      />
    </div>
  )
}
