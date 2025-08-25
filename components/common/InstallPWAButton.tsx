'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Smartphone, X, Check, ArrowDown, Share, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { QuickTooltip } from '../ui/tooltip'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallPWAButtonProps {
  variant?: 'button' | 'banner' | 'floating' | 'minimal'
  className?: string
  autoShow?: boolean
  showAfterDelay?: number
}

export function InstallPWAButton({ 
  variant = 'floating',
  className,
  autoShow = true,
  showAfterDelay = 10000 // 10 seconds
}: InstallPWAButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Check if app is installed or running in standalone mode
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      
      setIsStandalone(isStandaloneMode)
      setIsInstalled(isStandaloneMode)
    }

    checkStandalone()
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkStandalone)
    
    return () => mediaQuery.removeEventListener('change', checkStandalone)
  }, [])

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      
      // Auto-show after delay if not dismissed
      if (autoShow && !dismissed) {
        setTimeout(() => {
          setShowPrompt(true)
        }, showAfterDelay)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setShowPrompt(false)
      toast.success('App installed successfully! 🎉', {
        description: 'You can now use AI Notes from your home screen'
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [autoShow, dismissed, showAfterDelay])

  // Handle installation
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // Fallback for iOS or other browsers
      if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        toast.info('To install on iOS:', {
          description: 'Tap the share button and select "Add to Home Screen"',
          duration: 6000
        })
      } else {
        toast.info('Installation not available', {
          description: 'Your browser doesn\'t support app installation'
        })
      }
      return
    }

    try {
      setIsInstalling(true)
      await deferredPrompt.prompt()
      
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowPrompt(false)
        toast.success('Installing app...', {
          description: 'The app will appear on your home screen shortly'
        })
      } else {
        toast.info('Installation cancelled')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Installation failed:', error)
      toast.error('Installation failed')
    } finally {
      setIsInstalling(false)
    }
  }, [deferredPrompt])

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    setDismissed(true)
    
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  // Check if previously dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      if (parseInt(dismissedTime) > oneWeekAgo) {
        setDismissed(true)
      }
    }
  }, [])

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || dismissed) {
    return null
  }

  // Button variant
  if (variant === 'button') {
    return (
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        loading={isInstalling}
        variant="outline"
        className={cn("gap-2 rounded-xl", className)}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    )
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <QuickTooltip content="Install as app">
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          variant="ghost"
          size="icon-sm"
          className={cn("rounded-full", className)}
        >
          {isInstalling ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </QuickTooltip>
    )
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-4 left-4 right-4 z-50 mx-auto max-w-lg",
              className
            )}
          >
            <Card variant="glass" className="p-4 border border-border-subtle shadow-5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-brand-100 rounded-xl">
                  <Smartphone className="h-5 w-5 text-brand-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-text">Install AI Notes</h3>
                  <p className="text-sm text-text-muted">
                    Get quick access and work offline
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    loading={isInstalling}
                    variant="gradient"
                    size="sm"
                    className="rounded-xl"
                  >
                    Install
                  </Button>
                  
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Floating variant (default)
  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 200 
          }}
          className={cn(
            "fixed bottom-20 right-4 z-40 max-w-xs",
            className
          )}
        >
          <Card variant="glass" className="p-4 border border-border-subtle shadow-5">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-100 rounded-xl">
                    <Smartphone className="h-5 w-5 text-brand-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-text">Install App</h3>
                    <Badge variant="feature" size="xs" className="mt-1">
                      Recommended
                    </Badge>
                  </div>
                </div>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full -mr-2 -mt-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-text-secondary">Work offline</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-text-secondary">Faster access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-text-secondary">Native experience</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  loading={isInstalling}
                  variant="gradient"
                  size="sm"
                  className="flex-1 rounded-xl gap-2"
                >
                  <Download className="h-3 w-3" />
                  Install
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  Later
                </Button>
              </div>
            </div>
          </Card>

          {/* iOS-specific instruction */}
          {typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2"
            >
              <Card variant="ghost" className="p-3 text-center">
                <p className="text-xs text-text-muted mb-2">
                  On iOS: Tap
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Share className="h-4 w-4 text-brand-600" />
                  <ArrowRight className="h-3 w-3 text-text-muted" />
                  <span className="text-xs font-medium">"Add to Home Screen"</span>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for PWA installation state
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      
      setIsInstalled(isStandaloneMode)
    }

    checkStandalone()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      setDeferredPrompt(null)
      setIsInstallable(false)
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }, [deferredPrompt])

  return {
    isInstallable,
    isInstalled,
    install
  }
}
