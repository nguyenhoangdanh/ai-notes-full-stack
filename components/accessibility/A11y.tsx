'use client'

import { ComponentProps, forwardRef, useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

// Skip Links Component for keyboard navigation
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-32 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
      >
        Skip to navigation
      </a>
    </div>
  )
}

// Screen Reader Only text
interface ScreenReaderOnlyProps extends ComponentProps<'span'> {
  children: React.ReactNode
}

export const ScreenReaderOnly = forwardRef<HTMLSpanElement, ScreenReaderOnlyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('sr-only', className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

ScreenReaderOnly.displayName = 'ScreenReaderOnly'

// Focus Trap component for modals and dialogs
interface FocusTrapProps {
  children: React.ReactNode
  enabled?: boolean
  initialFocus?: React.RefObject<HTMLElement>
}

export function FocusTrap({ children, enabled = true, initialFocus }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(',')
      
      return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Set initial focus
    if (initialFocus?.current) {
      initialFocus.current.focus()
    } else {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [enabled, initialFocus])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Announce live updates to screen readers
interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
}

export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Accessible loading indicator
interface LoadingIndicatorProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingIndicator({ message = 'Loading...', size = 'md' }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex items-center justify-center"
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <ScreenReaderOnly>{message}</ScreenReaderOnly>
    </div>
  )
}

// Accessible tooltip wrapper
interface TooltipWrapperProps {
  children: React.ReactNode
  tooltip: string
  id?: string
}

export function TooltipWrapper({ children, tooltip, id }: TooltipWrapperProps) {
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`

  return (
    <>
      <div
        aria-describedby={tooltipId}
        className="inline-block"
      >
        {children}
      </div>
      <div
        id={tooltipId}
        role="tooltip"
        className="sr-only"
      >
        {tooltip}
      </div>
    </>
  )
}

// Error boundary with accessibility features
interface AccessibleErrorProps {
  error: Error
  retry?: () => void
}

export function AccessibleError({ error, retry }: AccessibleErrorProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center p-8 text-center space-y-4"
    >
      <div className="text-destructive">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Retry the failed action"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Keyboard navigation helper
export const keyboardHelpers = {
  isEnterOrSpace: (event: React.KeyboardEvent) => 
    event.key === 'Enter' || event.key === ' ',
  
  isEscape: (event: React.KeyboardEvent) => 
    event.key === 'Escape',
  
  isArrowKey: (event: React.KeyboardEvent) =>
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key),
  
  preventDefault: (event: React.KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }
}

// High contrast mode detection
export function useHighContrastMode() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    }
    
    // Initial check
    if (mediaQuery.matches) {
      document.documentElement.classList.add('high-contrast')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
}

// Reduced motion detection
export function useReducedMotion() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion')
      } else {
        document.documentElement.classList.remove('reduce-motion')
      }
    }
    
    // Initial check
    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
}
