'use client'

import { ComponentProps, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ResponsiveContainerProps extends ComponentProps<'div'> {
  variant?: 'default' | 'wide' | 'narrow' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  mobilePadding?: 'none' | 'sm' | 'md' | 'lg'
}

const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    mobilePadding = 'sm',
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base container
          'w-full mx-auto',
          
          // Width variants
          {
            'max-w-7xl': variant === 'default',
            'max-w-full': variant === 'wide',
            'max-w-4xl': variant === 'narrow',
            'max-w-none w-full': variant === 'full',
          },
          
          // Desktop padding
          {
            'px-0': padding === 'none',
            'px-4': padding === 'sm',
            'px-6 lg:px-8': padding === 'md',
            'px-8 lg:px-12': padding === 'lg',
          },
          
          // Mobile padding override
          {
            'xs:px-0': mobilePadding === 'none',
            'xs:px-3 sm:px-4': mobilePadding === 'sm' && padding !== 'none',
            'xs:px-4 sm:px-6': mobilePadding === 'md' && padding !== 'none',
            'xs:px-6 sm:px-8': mobilePadding === 'lg' && padding !== 'none',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = 'ResponsiveContainer'

export { ResponsiveContainer }
