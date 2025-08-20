'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
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
  name: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  bgClass: string
  iconColor: string
}

const themeOptions: ThemeOption[] = [
  {
    name: 'Light',
    value: 'light',
    icon: Sun,
    description: 'Bright and clean',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    name: 'Dark',
    value: 'dark',
    icon: Moon,
    description: 'Easy on the eyes',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400'
  },
  {
    name: 'System',
    value: 'system',
    icon: Monitor,
    description: 'Follows device setting',
    bgClass: 'bg-brand-100 dark:bg-brand-900/30',
    iconColor: 'text-brand-600 dark:text-brand-400'
  }
]

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: string) => {
    if (isChanging) return
    
    setIsChanging(true)
    setTheme(newTheme)
    
    // Add visual feedback
    setTimeout(() => setIsChanging(false), 300)
  }

  const getCurrentThemeOption = () => {
    return themeOptions.find(option => option.value === theme) || themeOptions[2]
  }

  const currentTheme = getCurrentThemeOption()
  const CurrentIcon = currentTheme.icon

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-xl opacity-50"
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-xl transition-modern group relative overflow-hidden",
            "hover:bg-surface-hover hover:scale-105 active:scale-95",
            "shadow-1 hover:shadow-2 glass border border-border-subtle",
            isChanging && "animate-pulse"
          )}
          aria-label={`Current theme: ${currentTheme.name}. Click to change theme`}
          disabled={isChanging}
        >
          <CurrentIcon className={cn(
            "h-4 w-4 transition-modern",
            "group-hover:scale-110 group-hover:rotate-12",
            isChanging && "animate-spin"
          )} />
          
          {/* Theme indicator dot */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface transition-modern",
            resolvedTheme === 'dark' 
              ? 'bg-slate-700' 
              : resolvedTheme === 'light' 
              ? 'bg-amber-400' 
              : 'bg-brand-500'
          )} />

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-100/20 to-brand-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 glass border border-border-subtle shadow-3 animate-scale-in"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="opacity-60" />
        
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleThemeChange(option.value)}
            className={cn(
              "gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-modern",
              "hover:bg-surface-hover focus:bg-surface-hover",
              theme === option.value && "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-modern",
              option.bgClass
            )}>
              <option.icon className={cn("h-4 w-4", option.iconColor)} />
            </div>
            
            <div className="flex-1">
              <div className="font-medium">{option.name}</div>
              <div className="text-xs text-text-muted">
                {option.value === 'system' && resolvedTheme 
                  ? `${option.description} (${resolvedTheme})`
                  : option.description
                }
              </div>
            </div>
            
            {theme === option.value && (
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            )}
          </DropdownMenuItem>
        ))}
        
        {/* Quick preview */}
        <DropdownMenuSeparator className="opacity-60 my-2" />
        <div className="px-3 py-2">
          <div className="text-xs text-text-muted mb-2">Preview</div>
          <div className="flex gap-2">
            <div className="w-6 h-4 rounded bg-bg border border-border"></div>
            <div className="w-6 h-4 rounded bg-surface border border-border"></div>
            <div className="w-6 h-4 rounded bg-brand-100 border border-brand-200"></div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact toggle for mobile or space-constrained layouts
export function CompactThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(nextTheme)
  }

  const getCurrentIcon = () => {
    const current = themeOptions.find(option => option.value === theme)
    return current ? current.icon : Monitor
  }

  const Icon = getCurrentIcon()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className="rounded-lg opacity-50" disabled>
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className={cn(
        "rounded-lg transition-modern group",
        "hover:bg-surface-hover hover:scale-105 active:scale-95"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
    </Button>
  )
}

// Quick theme switcher for settings pages
export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {themeOptions.map((option) => (
          <div key={option.value} className="w-16 h-16 rounded-xl bg-bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-text">Theme Preference</div>
      <div className="flex gap-3">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl transition-modern",
              "border-2 hover:scale-105 active:scale-95",
              theme === option.value
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/50"
                : "border-border hover:border-brand-300 bg-surface hover:bg-surface-hover"
            )}
            aria-label={`Set theme to ${option.name}`}
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg",
              option.bgClass
            )}>
              <option.icon className={cn("h-4 w-4", option.iconColor)} />
            </div>
            
            <div className="text-center">
              <div className="text-xs font-medium">{option.name}</div>
              {option.value === 'system' && resolvedTheme && (
                <div className="text-xs text-text-muted">({resolvedTheme})</div>
              )}
            </div>
            
            {theme === option.value && (
              <div className="w-2 h-2 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
