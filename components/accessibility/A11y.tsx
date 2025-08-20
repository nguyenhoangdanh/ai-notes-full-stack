'use client'

import { ComponentProps, forwardRef, useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

// Enhanced Skip Links Component for keyboard navigation
export function SkipLinks() {
  return (
    <div className="skip-links" role="navigation" aria-label="Skip navigation links">
      <a
        href="#main-content"
        className="skip-link fixed top-4 left-4 z-[9999] bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold shadow-3 transform -translate-y-20 focus:translate-y-0 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link fixed top-4 left-48 z-[9999] bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold shadow-3 transform -translate-y-20 focus:translate-y-0 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2"
      >
        Skip to navigation
      </a>
      <a
        href="#search"
        className="skip-link fixed top-4 left-80 z-[9999] bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold shadow-3 transform -translate-y-20 focus:translate-y-0 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2"
      >
        Skip to search
      </a>
    </div>
  )
}

// Screen Reader Only text with enhanced styling
interface ScreenReaderOnlyProps extends ComponentProps<'span'> {
  children: React.ReactNode
}

export const ScreenReaderOnly = forwardRef<HTMLSpanElement, ScreenReaderOnlyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
          '[clip:rect(0,0,0,0)]',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

ScreenReaderOnly.displayName = 'ScreenReaderOnly'

// Enhanced Focus Trap component with improved accessibility
interface FocusTrapProps {
  children: React.ReactNode
  enabled?: boolean
  initialFocus?: React.RefObject<HTMLElement>
  restoreFocus?: boolean
  onEscape?: () => void
  className?: string
}

export function FocusTrap({ 
  children, 
  enabled = true, 
  initialFocus, 
  restoreFocus = true,
  onEscape,
  className 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    // Enhanced focusable elements selector
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'button:not([disabled]):not([aria-hidden="true"]):not([inert])',
        'input:not([disabled]):not([aria-hidden="true"]):not([inert])',
        'textarea:not([disabled]):not([aria-hidden="true"]):not([inert])',
        'select:not([disabled]):not([aria-hidden="true"]):not([inert])',
        'a[href]:not([aria-hidden="true"]):not([inert])',
        '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"]):not([inert])',
        '[contenteditable="true"]:not([aria-hidden="true"]):not([inert])',
        'summary:not([aria-hidden="true"]):not([inert])',
        'audio[controls]:not([aria-hidden="true"]):not([inert])',
        'video[controls]:not([aria-hidden="true"]):not([inert])',
        'details:not([aria-hidden="true"]):not([inert])'
      ].join(',')
      
      return Array.from(container.querySelectorAll(selector)).filter(
        el => {
          const element = el as HTMLElement
          const isVisible = element.offsetParent !== null && 
                          getComputedStyle(element).visibility !== 'hidden' &&
                          getComputedStyle(element).display !== 'none'
          
          // Check if element is within viewport or scrollable container
          const rect = element.getBoundingClientRect()
          const isInViewport = rect.width > 0 && rect.height > 0
          
          return isVisible && isInViewport
        }
      ) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        event.stopPropagation()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement

      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (activeElement === firstElement || !focusableElements.includes(activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forward)
        if (activeElement === lastElement || !focusableElements.includes(activeElement)) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Set initial focus with proper timing
    const setInitialFocus = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus()
      } else {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        }
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const focusTimer = requestAnimationFrame(setInitialFocus)

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    
    return () => {
      cancelAnimationFrame(focusTimer)
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      
      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        const elementToFocus = previouslyFocusedElement.current
        // Ensure element is still in DOM and focusable
        if (document.contains(elementToFocus)) {
          requestAnimationFrame(() => {
            elementToFocus.focus()
          })
        }
      }
    }
  }, [enabled, initialFocus, restoreFocus, onEscape])

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <div 
      ref={containerRef} 
      data-focus-trap={enabled}
      className={className}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

// Enhanced Live Region for announcements
interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  clearAfter?: number
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  busy?: boolean
}

export function LiveRegion({ 
  message, 
  politeness = 'polite', 
  clearAfter,
  atomic = true,
  relevant = 'all',
  busy = false
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message)
  const [isAnnouncing, setIsAnnouncing] = useState(false)

  useEffect(() => {
    if (message) {
      setIsAnnouncing(true)
      setCurrentMessage(message)
      
      if (clearAfter) {
        const timer = setTimeout(() => {
          setCurrentMessage('')
          setIsAnnouncing(false)
        }, clearAfter)
        
        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfter])

  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      aria-busy={busy}
      role={politeness === 'assertive' ? 'alert' : 'status'}
      className="sr-only"
    >
      {isAnnouncing && currentMessage}
    </div>
  )
}

// Enhanced Loading Indicator with better accessibility
interface LoadingIndicatorProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  delay?: number
}

export function LoadingIndicator({ 
  message = 'Loading content, please wait...', 
  size = 'md', 
  variant = 'spinner',
  className,
  delay = 0
}: LoadingIndicatorProps) {
  const [isVisible, setIsVisible] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    }
  }, [delay])

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const SpinnerVariant = () => (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-border border-t-brand-500',
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
            'rounded-full bg-brand-500 animate-pulse',
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-3 h-3'
          )}
          style={{ 
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  )

  const PulseVariant = () => (
    <div
      className={cn(
        'rounded-full bg-brand-500 animate-pulse',
        sizeClasses[size]
      )}
      aria-hidden="true"
    />
  )

  const SkeletonVariant = () => (
    <div
      className={cn(
        'rounded-lg bg-bg-muted skeleton',
        size === 'sm' && 'h-4 w-24',
        size === 'md' && 'h-6 w-32',
        size === 'lg' && 'h-8 w-40'
      )}
      aria-hidden="true"
    />
  )

  const variants = {
    spinner: SpinnerVariant,
    dots: DotsVariant,
    pulse: PulseVariant,
    skeleton: SkeletonVariant
  }

  const VariantComponent = variants[variant]

  if (!isVisible) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
      className={cn("flex items-center justify-center", className)}
    >
      <VariantComponent />
      <ScreenReaderOnly>{message}</ScreenReaderOnly>
    </div>
  )
}

// Enhanced Progress indicator with better ARIA support
interface ProgressIndicatorProps {
  value: number
  max?: number
  label?: string
  description?: string
  showValue?: boolean
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'bar' | 'circle' | 'ring'
  className?: string
  color?: 'brand' | 'success' | 'warning' | 'danger'
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  description,
  showValue = true,
  showPercentage = true,
  size = 'md',
  variant = 'bar',
  className,
  color = 'brand'
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const id = useRef(`progress-${Math.random().toString(36).substr(2, 9)}`)
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses = {
    brand: 'bg-brand-500',
    success: 'bg-success',
    warning: 'bg-warning', 
    danger: 'bg-danger'
  }

  const BarVariant = () => (
    <div className={cn("w-full", className)}>
      {(label || showValue || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label htmlFor={id.current} className="text-sm font-medium text-text">
              {label}
            </label>
          )}
          {(showValue || showPercentage) && (
            <div className="text-sm text-text-muted" aria-live="polite">
              {showValue && showPercentage && `${value}/${max} (${Math.round(percentage)}%)`}
              {showValue && !showPercentage && `${value}/${max}`}
              {!showValue && showPercentage && `${Math.round(percentage)}%`}
            </div>
          )}
        </div>
      )}
      <div
        id={id.current}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${Math.round(percentage)} percent complete`}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
        aria-describedby={description ? `${id.current}-desc` : undefined}
        className={cn(
          "w-full bg-bg-muted rounded-full overflow-hidden",
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p id={`${id.current}-desc`} className="text-xs text-text-muted mt-1">
          {description}
        </p>
      )}
    </div>
  )

  const CircleVariant = () => {
    const radius = size === 'sm' ? 16 : size === 'md' ? 20 : 24
    const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <div className="relative">
          <svg
            width={radius * 2}
            height={radius * 2}
            className="transform -rotate-90"
            role="img"
            aria-labelledby={`${id.current}-title`}
          >
            <title id={`${id.current}-title`}>
              {label || `Progress: ${Math.round(percentage)}%`}
            </title>
            <circle
              stroke="currentColor"
              className="text-bg-muted"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="currentColor"
              className={cn("transition-all duration-500 ease-out", 
                color === 'brand' && 'text-brand-500',
                color === 'success' && 'text-success',
                color === 'warning' && 'text-warning',
                color === 'danger' && 'text-danger'
              )}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuetext={`${Math.round(percentage)} percent complete`}
            />
          </svg>
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-text" aria-live="polite">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const variants = {
    bar: BarVariant,
    circle: CircleVariant,
    ring: CircleVariant
  }

  const VariantComponent = variants[variant]
  return <VariantComponent />
}

// Enhanced error component with better accessibility
interface AccessibleErrorProps {
  error: Error
  retry?: () => void
  className?: string
  severity?: 'error' | 'warning' | 'info'
}

export function AccessibleError({ 
  error, 
  retry, 
  className,
  severity = 'error' 
}: AccessibleErrorProps) {
  const id = useRef(`error-${Math.random().toString(36).substr(2, 9)}`)

  const severityStyles = {
    error: {
      border: 'border-danger/20',
      bg: 'bg-danger-bg',
      icon: 'text-danger',
      text: 'text-danger'
    },
    warning: {
      border: 'border-warning/20', 
      bg: 'bg-warning-bg',
      icon: 'text-warning',
      text: 'text-warning'
    },
    info: {
      border: 'border-info/20',
      bg: 'bg-info-bg', 
      icon: 'text-info',
      text: 'text-info'
    }
  }

  const styles = severityStyles[severity]

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-labelledby={`${id.current}-title`}
      aria-describedby={`${id.current}-desc`}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 rounded-xl",
        styles.border,
        styles.bg,
        className
      )}
    >
      <div className="space-y-3">
        <div className={cn("p-3 rounded-full w-fit mx-auto", styles.bg)}>
          <svg
            className={cn("w-6 h-6", styles.icon)}
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
        
        <h2 id={`${id.current}-title`} className={cn("text-lg font-semibold", styles.text)}>
          {severity === 'error' && 'Something went wrong'}
          {severity === 'warning' && 'Warning'}
          {severity === 'info' && 'Information'}
        </h2>
        
        <p id={`${id.current}-desc`} className="text-sm text-text-muted max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 focus:ring-offset-2 transition-modern shadow-2 hover:shadow-3 font-medium"
          aria-label="Retry the failed action"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Enhanced keyboard navigation helpers
export const keyboardHelpers = {
  isEnterOrSpace: (event: React.KeyboardEvent) => 
    event.key === 'Enter' || event.key === ' ',
  
  isEscape: (event: React.KeyboardEvent) => 
    event.key === 'Escape',
  
  isArrowKey: (event: React.KeyboardEvent) =>
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key),
  
  isNavigationKey: (event: React.KeyboardEvent) =>
    ['Tab', 'Enter', ' ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key),
  
  preventDefault: (event: React.KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
  },

  handleRoleButton: (event: React.KeyboardEvent, onClick: () => void) => {
    if (keyboardHelpers.isEnterOrSpace(event)) {
      keyboardHelpers.preventDefault(event)
      onClick()
    }
  },

  handleMenuNavigation: (
    event: React.KeyboardEvent, 
    currentIndex: number, 
    itemCount: number,
    onSelect: (index: number) => void,
    onClose?: () => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        keyboardHelpers.preventDefault(event)
        onSelect((currentIndex + 1) % itemCount)
        break
      case 'ArrowUp':
        keyboardHelpers.preventDefault(event)
        onSelect((currentIndex - 1 + itemCount) % itemCount)
        break
      case 'Home':
        keyboardHelpers.preventDefault(event)
        onSelect(0)
        break
      case 'End':
        keyboardHelpers.preventDefault(event)
        onSelect(itemCount - 1)
        break
      case 'Escape':
        keyboardHelpers.preventDefault(event)
        onClose?.()
        break
    }
  }
}

// Enhanced accessibility preference hooks
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
      document.documentElement.classList.toggle('high-contrast', e.matches)
    }
    
    setIsHighContrast(mediaQuery.matches)
    document.documentElement.classList.toggle('high-contrast', mediaQuery.matches)
    
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
      document.documentElement.classList.toggle('reduce-motion', e.matches)
    }
    
    setPrefersReducedMotion(mediaQuery.matches)
    document.documentElement.classList.toggle('reduce-motion', mediaQuery.matches)
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Enhanced focus management hook
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

// Enhanced announcement hook
export function useAnnounce() {
  const [message, setMessage] = useState('')
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite')

  const announce = useCallback((text: string, level: 'polite' | 'assertive' = 'polite') => {
    setMessage('')
    setPoliteness(level)
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
      <LiveRegion 
        message={message} 
        politeness={politeness} 
        clearAfter={5000}
        atomic={true}
      />
    )
  }
}

// Enhanced roving tabindex pattern
export function useRovingTabindex(
  itemsLength: number, 
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical',
  loop: boolean = true
) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    let newIndex = index

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = loop ? (index + 1) % itemsLength : Math.min(index + 1, itemsLength - 1)
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = loop ? (index - 1 + itemsLength) % itemsLength : Math.max(index - 1, 0)
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = loop ? (index + 1) % itemsLength : Math.min(index + 1, itemsLength - 1)
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = loop ? (index - 1 + itemsLength) % itemsLength : Math.max(index - 1, 0)
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
  }, [itemsLength, orientation, loop])

  const getTabIndex = useCallback((index: number) => {
    return index === focusedIndex ? 0 : -1
  }, [focusedIndex])

  const getAriaSelected = useCallback((index: number) => {
    return index === focusedIndex
  }, [focusedIndex])

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getTabIndex,
    getAriaSelected
  }
}

// ARIA live region provider for global announcements
export function AriaLiveProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="polite-announcer" />
      <div aria-live="assertive" aria-atomic="true" className="sr-only" id="assertive-announcer" />
    </>
  )
}

// Global announce function
export function globalAnnounce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const announcer = document.getElementById(`${politeness}-announcer`)
  if (announcer) {
    announcer.textContent = ''
    setTimeout(() => {
      announcer.textContent = message
    }, 100)
  }
}
