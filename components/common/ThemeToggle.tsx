'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { QuickTooltip } from '../ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'

interface ThemeOption {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean and bright interface'
    },
    {
      value: 'dark', 
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes in low light'
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Follows your device setting'
    }
  ]

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-xl opacity-50"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-xl transition-modern relative overflow-hidden",
            "hover:bg-surface-hover hover:scale-110 hover:shadow-2",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={resolvedTheme}
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 20,
                  duration: 0.3 
                }}
                className="flex items-center justify-center"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="h-4 w-4 text-blue-400" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Glow effect */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full",
                resolvedTheme === 'dark' 
                  ? "bg-blue-400/20" 
                  : "bg-yellow-500/20"
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-56 p-2 rounded-2xl glass border border-border-subtle shadow-5" 
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium text-text-secondary uppercase tracking-wider px-3 py-2">
          <div className="flex items-center gap-2">
            <Palette className="h-3 w-3" />
            Theme
          </div>
        </DropdownMenuLabel>
        
        <div className="space-y-1">
          {themeOptions.map((option) => {
            const isSelected = theme === option.value
            const Icon = option.icon
            
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "rounded-xl cursor-pointer transition-all duration-200 p-3",
                  "hover:bg-surface-hover focus:bg-surface-hover",
                  isSelected && "bg-brand-50 hover:bg-brand-100 text-brand-700"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    "p-2 rounded-lg transition-transform duration-200",
                    isSelected 
                      ? "bg-brand-100 text-brand-600 scale-110" 
                      : "bg-bg-muted text-text-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Check className="h-3 w-3 text-brand-600" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      {option.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="px-3 py-2">
          <div className="text-xs text-text-subtle">
            Current: <span className="font-medium text-text-muted">{currentTheme.label}</span>
            {theme === 'system' && (
              <span className="text-text-subtle"> ({resolvedTheme})</span>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simplified toggle for mobile/compact spaces
export function SimpleThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className="rounded-full opacity-50" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <QuickTooltip 
      content={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
      variant="dark"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleTheme}
        className={cn(
          "rounded-full transition-modern relative overflow-hidden",
          "hover:bg-surface-hover hover:scale-110",
          "active:scale-95"
        )}
      >
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedTheme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-blue-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Button>
    </QuickTooltip>
  )
}

// Theme picker for settings pages
interface ThemePickerProps {
  className?: string
}

export function ThemePicker({ className }: ThemePickerProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-video rounded-xl bg-bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean and bright'
    },
    {
      value: 'dark',
      label: 'Dark', 
      icon: Moon,
      description: 'Easy on the eyes'
    },
    {
      value: 'system',
      label: 'Auto',
      icon: Monitor,
      description: 'Follows system'
    }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-text mb-2">Theme</h3>
        <p className="text-sm text-text-muted">
          Choose how the interface looks and feels
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themeOptions.map((option) => {
          const isSelected = theme === option.value
          const Icon = option.icon

          return (
            <motion.button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isSelected 
                  ? "border-brand-500 bg-brand-50" 
                  : "border-border hover:border-border-strong"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Preview */}
              <div className={cn(
                "aspect-video rounded-lg mb-3 relative overflow-hidden",
                option.value === 'light' && "bg-white border border-neutral-200",
                option.value === 'dark' && "bg-neutral-900 border border-neutral-800", 
                option.value === 'system' && "bg-gradient-to-br from-white via-neutral-100 to-neutral-900"
              )}>
                {/* Mock interface elements */}
                <div className={cn(
                  "absolute top-1 left-1 right-1 h-1.5 rounded-full",
                  option.value === 'light' && "bg-neutral-100",
                  option.value === 'dark' && "bg-neutral-800",
                  option.value === 'system' && "bg-gradient-to-r from-neutral-200 to-neutral-700"
                )} />
                
                <div className={cn(
                  "absolute bottom-1 left-1 w-6 h-1 rounded-full",
                  option.value === 'light' && "bg-neutral-300",
                  option.value === 'dark' && "bg-neutral-600",
                  option.value === 'system' && "bg-neutral-400"
                )} />
                
                <div className={cn(
                  "absolute bottom-1 right-1 w-4 h-1 rounded-full",
                  option.value === 'light' && "bg-blue-500",
                  option.value === 'dark' && "bg-blue-400",
                  option.value === 'system' && "bg-blue-500"
                )} />
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className={cn(
                    "h-4 w-4",
                    isSelected ? "text-brand-600" : "text-text-muted"
                  )} />
                  <span className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-brand-700" : "text-text"
                  )}>
                    {option.label}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {option.description}
                </p>
              </div>

              {/* Selection indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {theme === 'system' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-surface border border-border-subtle"
        >
          <div className="flex items-center gap-2 text-sm">
            <Monitor className="h-4 w-4 text-brand-600" />
            <span className="text-text-muted">
              Currently following system: 
              <span className="font-medium text-text ml-1 capitalize">
                {resolvedTheme}
              </span>
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
