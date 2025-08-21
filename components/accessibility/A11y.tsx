'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  MousePointer, 
  Keyboard,
  Volume2,
  VolumeX,
  Settings,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
  RotateCcw,
  Zap,
  Shield
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'

interface AccessibilityState {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  focusVisible: boolean
  soundEnabled: boolean
  keyboardNavigation: boolean
  announcements: boolean
}

interface AccessibilityIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  element?: string
  fix?: string
}

export function A11y() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilityState>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true,
    soundEnabled: true,
    keyboardNavigation: true,
    announcements: true
  })
  const [issues, setIssues] = useState<AccessibilityIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        applyAccessibilitySettings(parsed)
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
      }
    }

    // Check for system preferences
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-font-size: large)')
    }

    const updateFromSystem = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches
      }))
    }

    updateFromSystem()

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateFromSystem)
    })

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateFromSystem)
      })
    }
  }, [])

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = useCallback((newSettings: AccessibilityState) => {
    const root = document.documentElement
    
    // Reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--duration-fast', '0.01ms')
      root.style.setProperty('--duration-normal', '0.01ms')
      root.style.setProperty('--duration-slow', '0.01ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--duration-fast')
      root.style.removeProperty('--duration-normal')
      root.style.removeProperty('--duration-slow')
      root.classList.remove('reduce-motion')
    }

    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast')
      root.style.setProperty('--color-border', 'oklch(0.3 0 0)')
      root.style.setProperty('--color-text', 'oklch(0.1 0 0)')
      root.style.setProperty('--color-bg', 'oklch(1 0 0)')
    } else {
      root.classList.remove('high-contrast')
      root.style.removeProperty('--color-border')
      root.style.removeProperty('--color-text')
      root.style.removeProperty('--color-bg')
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('large-text')
      root.style.fontSize = '120%'
    } else {
      root.classList.remove('large-text')
      root.style.fontSize = ''
    }

    // Focus visible
    if (newSettings.focusVisible) {
      root.classList.add('focus-visible-enhanced')
    } else {
      root.classList.remove('focus-visible-enhanced')
    }

    // Keyboard navigation enhancements
    if (newSettings.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
    } else {
      root.classList.remove('keyboard-navigation')
    }

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
  }, [])

  // Update a specific setting
  const updateSetting = useCallback((key: keyof AccessibilityState, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    applyAccessibilitySettings(newSettings)
  }, [settings, applyAccessibilitySettings])

  // Scan for accessibility issues
  const scanForIssues = useCallback(async () => {
    setIsScanning(true)
    const foundIssues: AccessibilityIssue[] = []

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      foundIssues.push({
        id: 'missing-alt',
        type: 'error',
        message: `${images.length} images without alt text`,
        element: 'img',
        fix: 'Add descriptive alt text to all images'
      })
    }

    // Check for missing headings
    const h1Elements = document.querySelectorAll('h1')
    if (h1Elements.length === 0) {
      foundIssues.push({
        id: 'missing-h1',
        type: 'warning',
        message: 'No H1 heading found on page',
        element: 'h1',
        fix: 'Add a main H1 heading to establish page hierarchy'
      })
    }

    // Check for low contrast
    const buttons = document.querySelectorAll('button')
    let lowContrastCount = 0
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button)
      const bgColor = styles.backgroundColor
      const textColor = styles.color
      
      // Simple contrast check (in real implementation, use proper contrast calculation)
      if (bgColor === textColor) {
        lowContrastCount++
      }
    })

    if (lowContrastCount > 0) {
      foundIssues.push({
        id: 'low-contrast',
        type: 'warning',
        message: `${lowContrastCount} elements may have insufficient contrast`,
        element: 'button',
        fix: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)'
      })
    }

    // Check for missing ARIA labels
    const interactiveElements = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
    if (interactiveElements.length > 0) {
      foundIssues.push({
        id: 'missing-aria',
        type: 'info',
        message: `${interactiveElements.length} interactive elements could use ARIA labels`,
        element: 'button',
        fix: 'Add aria-label or aria-labelledby attributes for screen readers'
      })
    }

    // Check for keyboard focus
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]')
    let nonFocusableCount = 0
    focusableElements.forEach(element => {
      if (element.getAttribute('tabindex') === '-1' && !element.hasAttribute('disabled')) {
        nonFocusableCount++
      }
    })

    if (nonFocusableCount > 0) {
      foundIssues.push({
        id: 'keyboard-focus',
        type: 'warning',
        message: `${nonFocusableCount} interactive elements not keyboard accessible`,
        element: 'focusable',
        fix: 'Ensure all interactive elements are keyboard accessible'
      })
    }

    setIssues(foundIssues)
    setIsScanning(false)
  }, [])

  // Reset all settings
  const resetSettings = useCallback(() => {
    const defaultSettings: AccessibilityState = {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      focusVisible: true,
      soundEnabled: true,
      keyboardNavigation: true,
      announcements: true
    }
    
    setSettings(defaultSettings)
    applyAccessibilitySettings(defaultSettings)
  }, [applyAccessibilitySettings])

  // Accessibility options
  const accessibilityOptions = [
    {
      key: 'reducedMotion' as const,
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: Zap,
      enabled: settings.reducedMotion
    },
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: Contrast,
      enabled: settings.highContrast
    },
    {
      key: 'largeText' as const,
      label: 'Large Text',
      description: 'Increase font size throughout the app',
      icon: Type,
      enabled: settings.largeText
    },
    {
      key: 'focusVisible' as const,
      label: 'Enhanced Focus',
      description: 'Make keyboard focus indicators more prominent',
      icon: Eye,
      enabled: settings.focusVisible
    },
    {
      key: 'soundEnabled' as const,
      label: 'Sound Effects',
      description: 'Enable audio feedback for interactions',
      icon: settings.soundEnabled ? Volume2 : VolumeX,
      enabled: settings.soundEnabled
    },
    {
      key: 'keyboardNavigation' as const,
      label: 'Keyboard Navigation',
      description: 'Enhanced keyboard shortcuts and navigation',
      icon: Keyboard,
      enabled: settings.keyboardNavigation
    }
  ]

  return (
    <>
      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="icon-sm"
        className={cn(
          "fixed bottom-4 left-4 z-50 rounded-full shadow-3",
          "bg-surface border-border hover:shadow-4 hover:scale-110",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label="Accessibility settings"
      >
        <Shield className="h-4 w-4" />
      </Button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-overlay backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-4 md:inset-8 lg:inset-16 max-w-4xl mx-auto"
            >
              <Card variant="glass" className="h-full flex flex-col border border-border-subtle shadow-5 rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 rounded-xl">
                      <Shield className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text">Accessibility</h2>
                      <p className="text-sm text-text-muted">Customize your experience</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={scanForIssues}
                      disabled={isScanning}
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-xl"
                    >
                      {isScanning ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {isScanning ? 'Scanning...' : 'Scan Page'}
                    </Button>
                    
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-8">
                  {/* Quick Settings */}
                  <div>
                    <h3 className="font-semibold text-text mb-4">Quick Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {accessibilityOptions.map((option) => (
                        <Card 
                          key={option.key}
                          variant="glass"
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-200 border",
                            option.enabled 
                              ? "border-brand-300 bg-brand-50" 
                              : "border-border hover:border-border-strong"
                          )}
                          onClick={() => updateSetting(option.key, !option.enabled)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-all",
                              option.enabled 
                                ? "bg-brand-100 text-brand-600" 
                                : "bg-bg-muted text-text-muted"
                            )}>
                              <option.icon className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-text">{option.label}</h4>
                                {option.enabled && (
                                  <Check className="h-3 w-3 text-brand-600" />
                                )}
                              </div>
                              <p className="text-sm text-text-muted">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Issues Report */}
                  {issues.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-text">Accessibility Issues</h3>
                        <Badge variant="outline" className="gap-1">
                          {issues.length} found
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {issues.map((issue) => (
                          <Card key={issue.id} variant="outlined" className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                issue.type === 'error' && "bg-danger-bg text-danger",
                                issue.type === 'warning' && "bg-warning-bg text-warning",
                                issue.type === 'info' && "bg-info-bg text-info"
                              )}>
                                {issue.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                                {issue.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                {issue.type === 'info' && <Info className="h-4 w-4" />}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-text mb-1">
                                  {issue.message}
                                </h4>
                                {issue.fix && (
                                  <p className="text-sm text-text-muted">
                                    Fix: {issue.fix}
                                  </p>
                                )}
                                {issue.element && (
                                  <Badge variant="outline" size="xs" className="mt-2">
                                    {issue.element}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keyboard Shortcuts */}
                  <div>
                    <h3 className="font-semibold text-text mb-4">Keyboard Shortcuts</h3>
                    <Card variant="glass" className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Toggle accessibility</span>
                            <Badge variant="outline" size="xs">Alt + A</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Skip to main content</span>
                            <Badge variant="outline" size="xs">Tab</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Open search</span>
                            <Badge variant="outline" size="xs">Ctrl + K</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Navigate menu</span>
                            <Badge variant="outline" size="xs">Arrow keys</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Close dialogs</span>
                            <Badge variant="outline" size="xs">Escape</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Toggle theme</span>
                            <Badge variant="outline" size="xs">Ctrl + T</Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle bg-surface/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                      Settings are automatically saved
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={resetSettings}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="gradient"
                        size="sm"
                        className="rounded-xl"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Link */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50",
          "bg-brand-600 text-white px-4 py-2 rounded-lg font-medium",
          "focus:outline-none focus:ring-2 focus:ring-brand-200"
        )}
      >
        Skip to main content
      </a>

      {/* Screen Reader Announcements */}
      <div
        id="sr-announcements"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      <div
        id="sr-announcements-assertive"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      />
    </>
  )
}

// Screen reader announcement utility
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const elementId = priority === 'assertive' ? 'sr-announcements-assertive' : 'sr-announcements'
  const element = document.getElementById(elementId)
  
  if (element) {
    element.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      element.textContent = ''
    }, 1000)
  }
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

export function restoreFocus(previousElement?: HTMLElement) {
  if (previousElement) {
    previousElement.focus()
  } else {
    // Focus main content area
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
    }
  }
}

// Additional exports for components index
export function SkipLinks() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50",
        "bg-brand-600 text-white px-4 py-2 rounded-lg font-medium",
        "focus:outline-none focus:ring-2 focus:ring-brand-200"
      )}
    >
      Skip to main content
    </a>
  )
}

export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}

export function FocusTrap({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const cleanup = trapFocus(containerRef.current)
    return cleanup
  }, [enabled])

  return <div ref={containerRef}>{children}</div>
}

export function LiveRegion({ children, level = 'polite' }: { children: ReactNode; level?: 'polite' | 'assertive' }) {
  return (
    <div
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}

export function LoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2" role="status" aria-label={label}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function AccessibleError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="text-danger">
      {children}
    </div>
  )
}

// Keyboard helpers
export const keyboardHelpers = {
  isEnterOrSpace: (event: KeyboardEvent) => event.key === 'Enter' || event.key === ' ',
  handleEnterOrSpace: (event: KeyboardEvent, callback: () => void) => {
    if (keyboardHelpers.isEnterOrSpace(event)) {
      event.preventDefault()
      callback()
    }
  }
}

// Custom hooks
export function useHighContrastMode() {
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => setHighContrast(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return highContrast
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return reducedMotion
}

export function useAnnounce() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority)
  }, [])
}

export function useRovingTabindex(items: HTMLElement[]) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    items.forEach((item, index) => {
      item.tabIndex = index === currentIndex ? 0 : -1
    })
  }, [items, currentIndex])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        setCurrentIndex((prev) => (prev + 1) % items.length)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
        break
      case 'Home':
        event.preventDefault()
        setCurrentIndex(0)
        break
      case 'End':
        event.preventDefault()
        setCurrentIndex(items.length - 1)
        break
    }
  }, [items])

  return { currentIndex, handleKeyDown }
}
