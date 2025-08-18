'use client'

import { ComponentProps, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ResponsiveGridProps extends ComponentProps<'div'> {
  cols?: {
    default?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  mobileStack?: boolean
}

const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    cols = { default: 1, sm: 2, lg: 3 },
    gap = 'md',
    mobileStack = true,
    children,
    ...props 
  }, ref) => {
    const gridClasses = cn(
      // Base grid
      'grid w-full',
      
      // Grid columns
      {
        // Default (mobile-first)
        'grid-cols-1': cols.default === 1 || mobileStack,
        'grid-cols-2': cols.default === 2 && !mobileStack,
        'grid-cols-3': cols.default === 3 && !mobileStack,
        'grid-cols-4': cols.default === 4 && !mobileStack,
        'grid-cols-5': cols.default === 5 && !mobileStack,
        'grid-cols-6': cols.default === 6 && !mobileStack,
        
        // xs breakpoint
        'xs:grid-cols-1': cols.xs === 1,
        'xs:grid-cols-2': cols.xs === 2,
        'xs:grid-cols-3': cols.xs === 3,
        'xs:grid-cols-4': cols.xs === 4,
        
        // sm breakpoint
        'sm:grid-cols-1': cols.sm === 1,
        'sm:grid-cols-2': cols.sm === 2,
        'sm:grid-cols-3': cols.sm === 3,
        'sm:grid-cols-4': cols.sm === 4,
        'sm:grid-cols-5': cols.sm === 5,
        'sm:grid-cols-6': cols.sm === 6,
        
        // md breakpoint
        'md:grid-cols-1': cols.md === 1,
        'md:grid-cols-2': cols.md === 2,
        'md:grid-cols-3': cols.md === 3,
        'md:grid-cols-4': cols.md === 4,
        'md:grid-cols-5': cols.md === 5,
        'md:grid-cols-6': cols.md === 6,
        
        // lg breakpoint
        'lg:grid-cols-1': cols.lg === 1,
        'lg:grid-cols-2': cols.lg === 2,
        'lg:grid-cols-3': cols.lg === 3,
        'lg:grid-cols-4': cols.lg === 4,
        'lg:grid-cols-5': cols.lg === 5,
        'lg:grid-cols-6': cols.lg === 6,
        
        // xl breakpoint
        'xl:grid-cols-1': cols.xl === 1,
        'xl:grid-cols-2': cols.xl === 2,
        'xl:grid-cols-3': cols.xl === 3,
        'xl:grid-cols-4': cols.xl === 4,
        'xl:grid-cols-5': cols.xl === 5,
        'xl:grid-cols-6': cols.xl === 6,
        
        // 2xl breakpoint
        '2xl:grid-cols-1': cols['2xl'] === 1,
        '2xl:grid-cols-2': cols['2xl'] === 2,
        '2xl:grid-cols-3': cols['2xl'] === 3,
        '2xl:grid-cols-4': cols['2xl'] === 4,
        '2xl:grid-cols-5': cols['2xl'] === 5,
        '2xl:grid-cols-6': cols['2xl'] === 6,
      },
      
      // Gap sizes
      {
        'gap-3': gap === 'sm',
        'gap-6': gap === 'md',
        'gap-8': gap === 'lg',
        'gap-10': gap === 'xl',
      },
      
      className
    )

    return (
      <div
        ref={ref}
        className={gridClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = 'ResponsiveGrid'

export { ResponsiveGrid }
