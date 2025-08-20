'use client'

import { ComponentProps, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ResponsiveContainerProps extends ComponentProps<'div'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  centered?: boolean
  fluid?: boolean
  breakout?: boolean
  safe?: boolean
}

const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    className, 
    size = 'xl',
    padding = 'responsive',
    centered = true,
    fluid = false,
    breakout = false,
    safe = false,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: 'max-w-xs',      // 320px
      sm: 'max-w-sm',      // 640px  
      md: 'max-w-md',      // 768px
      lg: 'max-w-lg',      // 1024px
      xl: 'max-w-xl',      // 1280px
      '2xl': 'max-w-2xl',  // 1536px
      '3xl': 'max-w-3xl',  // 1920px
      full: 'max-w-full'
    }

    const paddingClasses = {
      none: '',
      xs: 'px-2',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8',
      xl: 'px-12',
      responsive: 'px-4 sm:px-6 lg:px-8'
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base container styles
          'w-full',
          
          // Size constraints
          !fluid && !breakout && sizeClasses[size],
          
          // Centering
          centered && !breakout && 'mx-auto',
          
          // Padding
          paddingClasses[padding],
          
          // Breakout utility for full-width sections
          breakout && [
            'w-screen relative',
            'left-1/2 right-1/2',
            '-ml-[50vw] -mr-[50vw]'
          ],
          
          // Safe area support for mobile
          safe && [
            'safe-area-top',
            'safe-area-bottom'
          ],
          
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

// Specialized containers for common layouts
interface ContentContainerProps extends ResponsiveContainerProps {
  prose?: boolean
}

const ContentContainer = forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ className, prose = false, ...props }, ref) => {
    return (
      <ResponsiveContainer
        ref={ref}
        size="2xl"
        className={cn(
          prose && [
            'prose prose-neutral dark:prose-invert max-w-none',
            'prose-headings:font-semibold prose-headings:tracking-tight',
            'prose-a:text-brand-600 hover:prose-a:text-brand-700',
            'prose-code:text-brand-600 prose-code:bg-brand-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium',
            'prose-pre:bg-surface prose-pre:border prose-pre:border-border',
            'prose-blockquote:border-l-brand-500 prose-blockquote:bg-brand-50',
            'prose-th:text-text prose-td:text-text',
            'prose-hr:border-border',
            'prose-img:rounded-xl prose-img:shadow-2'
          ],
          className
        )}
        {...props}
      />
    )
  }
)

ContentContainer.displayName = 'ContentContainer'

// Grid container with responsive breakpoints
interface GridContainerProps extends ComponentProps<'div'> {
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  autoFit?: boolean
  minItemWidth?: string
}

const GridContainer = forwardRef<HTMLDivElement, GridContainerProps>(
  ({ 
    className, 
    cols = { default: 1, md: 2, lg: 3 },
    gap = 'responsive',
    autoFit = false,
    minItemWidth = '280px',
    ...props 
  }, ref) => {
    const gapClasses = {
      xs: 'gap-2',
      sm: 'gap-4', 
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
      responsive: 'gap-4 md:gap-6 lg:gap-8'
    }

    // Build responsive grid classes
    const gridCols = []
    if (cols.default) gridCols.push(`grid-cols-${cols.default}`)
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`)
    if (cols['2xl']) gridCols.push(`2xl:grid-cols-${cols['2xl']}`)

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          autoFit 
            ? `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`
            : gridCols,
          gapClasses[gap],
          className
        )}
        {...props}
      />
    )
  }
)

GridContainer.displayName = 'GridContainer'

// Flex container with common patterns
interface FlexContainerProps extends ComponentProps<'div'> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  responsive?: {
    sm?: { direction?: FlexContainerProps['direction'], align?: FlexContainerProps['align'], justify?: FlexContainerProps['justify'] }
    md?: { direction?: FlexContainerProps['direction'], align?: FlexContainerProps['align'], justify?: FlexContainerProps['justify'] }
    lg?: { direction?: FlexContainerProps['direction'], align?: FlexContainerProps['align'], justify?: FlexContainerProps['justify'] }
  }
}

const FlexContainer = forwardRef<HTMLDivElement, FlexContainerProps>(
  ({ 
    className,
    direction = 'row',
    align = 'center',
    justify = 'start',
    wrap = false,
    gap = 'md',
    responsive,
    ...props 
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse'
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }

    const gapClasses = {
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6', 
      lg: 'gap-8',
      xl: 'gap-12',
      responsive: 'gap-4 md:gap-6 lg:gap-8'
    }

    // Build responsive classes
    const responsiveClasses = []
    if (responsive?.sm) {
      if (responsive.sm.direction) responsiveClasses.push(`sm:${directionClasses[responsive.sm.direction]}`)
      if (responsive.sm.align) responsiveClasses.push(`sm:${alignClasses[responsive.sm.align]}`)
      if (responsive.sm.justify) responsiveClasses.push(`sm:${justifyClasses[responsive.sm.justify]}`)
    }
    if (responsive?.md) {
      if (responsive.md.direction) responsiveClasses.push(`md:${directionClasses[responsive.md.direction]}`)
      if (responsive.md.align) responsiveClasses.push(`md:${alignClasses[responsive.md.align]}`)
      if (responsive.md.justify) responsiveClasses.push(`md:${justifyClasses[responsive.md.justify]}`)
    }
    if (responsive?.lg) {
      if (responsive.lg.direction) responsiveClasses.push(`lg:${directionClasses[responsive.lg.direction]}`)
      if (responsive.lg.align) responsiveClasses.push(`lg:${alignClasses[responsive.lg.align]}`)
      if (responsive.lg.justify) responsiveClasses.push(`lg:${justifyClasses[responsive.lg.justify]}`)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          gapClasses[gap],
          wrap && 'flex-wrap',
          ...responsiveClasses,
          className
        )}
        {...props}
      />
    )
  }
)

FlexContainer.displayName = 'FlexContainer'

// Stack container for vertical layouts
interface StackProps extends ComponentProps<'div'> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive'
  align?: 'start' | 'center' | 'end' | 'stretch'
  dividers?: boolean
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    spacing = 'md',
    align = 'stretch',
    dividers = false,
    children,
    ...props 
  }, ref) => {
    const spacingClasses = {
      xs: 'space-y-2',
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8', 
      xl: 'space-y-12',
      responsive: 'space-y-4 md:space-y-6 lg:space-y-8'
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center', 
      end: 'items-end',
      stretch: 'items-stretch'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          spacingClasses[spacing],
          alignClasses[align],
          dividers && 'divide-y divide-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'

// Center utility for perfect centering
interface CenterProps extends ComponentProps<'div'> {
  axis?: 'both' | 'horizontal' | 'vertical'
  minHeight?: string
}

const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ className, axis = 'both', minHeight, ...props }, ref) => {
    const axisClasses = {
      both: 'flex items-center justify-center',
      horizontal: 'flex justify-center',
      vertical: 'flex items-center'
    }

    return (
      <div
        ref={ref}
        className={cn(
          axisClasses[axis],
          className
        )}
        style={{ minHeight }}
        {...props}
      />
    )
  }
)

Center.displayName = 'Center'

export { 
  ResponsiveContainer, 
  ContentContainer,
  GridContainer,
  FlexContainer,
  Stack,
  Center,
  type ResponsiveContainerProps,
  type ContentContainerProps,
  type GridContainerProps,
  type FlexContainerProps,
  type StackProps,
  type CenterProps
}
