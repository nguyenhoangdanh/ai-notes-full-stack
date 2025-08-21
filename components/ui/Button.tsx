'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta' | 'danger' | 'gradient' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  children?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    children,
    fullWidth = false,
    disabled,
    className,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-modern focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
    
    const variants = {
      primary: 'btn-primary text-white shadow-lg hover:shadow-xl',
      secondary: 'btn-secondary hover:text-text',
      ghost: 'btn-ghost hover:text-text',
      cta: 'btn-cta text-white shadow-lg hover:shadow-xl',
      danger: 'bg-danger text-white border-none hover:bg-red-600 hover:shadow-lg',
      gradient: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:from-brand-600 hover:to-brand-700',
      outline: 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md',
      md: 'px-4 py-2 text-sm gap-2 rounded-md',
      lg: 'px-6 py-3 text-base gap-2.5 rounded-lg'
    }
    
    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    
    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    )
    
    const iconClasses = iconSizes[size]
    
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconClasses}`} />
            {children && <span>Loading...</span>}
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className={iconClasses} />
            )}
            
            {children}
            
            {Icon && iconPosition === 'right' && (
              <Icon className={iconClasses} />
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-2.5'
    }
    
    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(sizes[size], className)}
        {...props}
      >
        <Icon className={iconSizes[size]} />
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// Specialized button components
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />
}

export function CTAButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="cta" {...props} />
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />
}
