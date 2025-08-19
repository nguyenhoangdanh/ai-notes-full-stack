'use client'

import { ComponentProps, forwardRef, useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

// Skip Links Component for keyboard navigation
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link fixed top-2 left-2 z-[9999] bg-accent text-accent-contrast px-6 py-3 rounded-xl font-semibold shadow-lg transform -translate-y-16 focus:translate-y-0 transition-transform duration-200"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link fixed top-2 left-44 z-[9999] bg-accent text-accent-contrast px-6 py-3 rounded-xl font-semibold shadow-lg transform -translate-y-16 focus:translate-y-0 transition-transform duration-200"
      >
        Skip to navigation
      </a>
      <a
        href="#search"
        className="skip-link fixed top-2 left-80 z-[9999] bg-accent text-accent-contrast px-6 py-3 rounded-xl font-semibold shadow-lg transform -translate-y-16 focus:translate-y-0 transition-transform duration-200"
      >
        Skip to search
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

// Enhanced Focus Trap component
interface FocusTrapProps {
  children: React.ReactNode
  enabled?: boolean
  initialFocus?: React.RefObject<HTMLElement>
  restoreFocus?: boolean
  onEscape?: () => void
}

export function FocusTrap({ 
  children, 
  enabled = true, 
  initialFocus, 
  restoreFocus = true,
  onEscape 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'button:not([disabled]):not([aria-hidden="true"])',
        'input:not([disabled]):not([aria-hidden="true"])',
        'textarea:not([disabled]):not([aria-hidden="true"])',
        'select:not([disabled]):not([aria-hidden="true"])',
        'a[href]:not([aria-hidden="true"])',
        '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
        '[contenteditable="true"]:not([aria-hidden="true"])',
        'summary:not([aria-hidden="true"])'
      ].join(',')
      
      return Array.from(container.querySelectorAll(selector)).filter(
        el => el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'
      ) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

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
    requestAnimationFrame(() => {
      if (initialFocus?.current) {
        initialFocus.current.focus()
      } else {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        }
      }
    })

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        requestAnimationFrame(() => {
          previouslyFocusedElement.current?.focus()
        })
      }
    }
  }, [enabled, initialFocus, restoreFocus, onEscape])

  return (
    <div ref={containerRef} data-focus-trap={enabled}>
      {children}
    </div>
  )
}

// Live Region for announcements
interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  clearAfter?: number
}

export function LiveRegion({ message, politeness = 'polite', clearAfter }: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    setCurrentMessage(message)
    
    if (clearAfter && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('')
      }, clearAfter)
      
      return () => clearTimeout(timer)
    }
  }, [message, clearAfter])

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      role="status"
      className="sr-only"
    >
      {currentMessage}
    </div>
  )
}

// Enhanced Loading Indicator
interface LoadingIndicatorProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  className?: string
}

export function LoadingIndicator({ 
  message = 'Loading...', 
  size = 'md', 
  variant = 'spinner',
  className 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const SpinnerVariant = () => (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted/40 border-t-accent',
        sizeClasses[size]
      )}
      aria-hidden="true"
    />
  )

  const DotsVariant = () => (
    <div className="flex space-x-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-accent animate-pulse',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-3 h-3',
            size === 'lg' && 'w-4 h-4'
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )

  const PulseVariant = () => (
    <div
      className={cn(
        'rounded-full bg-accent animate-pulse',
        sizeClasses[size]
      )}
      aria-hidden="true"
    />
  )

  const variants = {
    spinner: SpinnerVariant,
    dots: DotsVariant,
    pulse: PulseVariant
  }

  const VariantComponent = variants[variant]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn("flex items-center justify-center", className)}
    >
      <VariantComponent />
      <ScreenReaderOnly>{message}</ScreenReaderOnly>
    </div>
  )
}

// Progress indicator
interface ProgressIndicatorProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  className
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          heightClasses[size]
        )}
      >
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Accessible error boundary
interface AccessibleErrorProps {
  error: Error
  retry?: () => void
  className?: string
}

export function AccessibleError({ error, retry, className }: AccessibleErrorProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-destructive/20 rounded-xl bg-destructive/5",
        className
      )}
    >
      <div className="space-y-2">
        <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto">
          <svg
            className="w-6 h-6 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-3 bg-accent text-accent-contrast rounded-xl hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/40 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl font-medium"
          aria-label="Retry the failed action"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Keyboard navigation helpers
export const keyboardHelpers = {
  isEnterOrSpace: (event: React.KeyboardEvent) => 
    event.key === 'Enter' || event.key === ' ',
  
  isEscape: (event: React.KeyboardEvent) => 
    event.key === 'Escape',
  
  isArrowKey: (event: React.KeyboardEvent) =>
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key),
  
  isNavigationKey: (event: React.KeyboardEvent) =>
    ['Tab', 'Enter', ' ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key),
  
  preventDefault: (event: React.KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
  },

  handleRoleButton: (event: React.KeyboardEvent, onClick: () => void) => {
    if (keyboardHelpers.isEnterOrSpace(event)) {
      keyboardHelpers.preventDefault(event)
      onClick()
    }
  }
}

// Accessibility preferences hooks
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
      if (e.matches) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
    }
    
    // Initial check
    setIsHighContrast(mediaQuery.matches)
    if (mediaQuery.matches) {
      document.documentElement.classList.add('high-contrast')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isHighContrast
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion')
      } else {
        document.documentElement.classList.remove('reduce-motion')
      }
    }
    
    // Initial check
    setPrefersReducedMotion(mediaQuery.matches)
    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Focus management hook
export function useFocusManagement() {
  const focusHistory = useRef<HTMLElement[]>([])

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      focusHistory.current.push(activeElement)
    }
  }, [])

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory.current.pop()
    if (lastFocused && document.contains(lastFocused)) {
      requestAnimationFrame(() => {
        lastFocused.focus()
      })
    }
  }, [])

  const clearFocusHistory = useCallback(() => {
    focusHistory.current = []
  }, [])

  return {
    saveFocus,
    restoreFocus,
    clearFocusHistory
  }
}

// Announce messages to screen readers
export function useAnnounce() {
  const [message, setMessage] = useState('')

  const announce = useCallback((text: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setMessage('')
    // Brief delay to ensure screen readers notice the change
    setTimeout(() => {
      setMessage(text)
    }, 100)
  }, [])

  const clear = useCallback(() => {
    setMessage('')
  }, [])

  return {
    announce,
    clear,
    LiveRegion: () => (
      <LiveRegion message={message} politeness="polite" clearAfter={5000} />
    )
  }
}

// Roving tabindex pattern for lists and grids
export function useRovingTabindex(itemsLength: number, orientation: 'horizontal' | 'vertical' = 'vertical') {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    let newIndex = index

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault()
          newIndex = (index + 1) % itemsLength
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault()
          newIndex = (index - 1 + itemsLength) % itemsLength
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault()
          newIndex = (index + 1) % itemsLength
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault()
          newIndex = (index - 1 + itemsLength) % itemsLength
        }
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = itemsLength - 1
        break
    }

    if (newIndex !== index) {
      setFocusedIndex(newIndex)
    }
  }, [itemsLength, orientation])

  const getTabIndex = useCallback((index: number) => {
    return index === focusedIndex ? 0 : -1
  }, [focusedIndex])

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getTabIndex
  }
}
