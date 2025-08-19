'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Button } from '../ui/button'
import { ThemeToggle } from '../common/ThemeToggle'
import { UserMenu } from '../header/UserMenu'
import { NotificationBell } from '../notifications/NotificationBell'
import { GlobalSearch } from '../search/GlobalSearch'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
  isMobile: boolean
}

export function Header({ onMenuClick, sidebarOpen, isMobile }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Superhuman-style scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search with Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header
      ref={headerRef}
      className={cn(
        "h-14 sticky top-0 z-40 border-b superhuman-transition",
        // Superhuman dynamic glass effect
        isScrolled 
          ? "bg-background/80 border-border/60 shadow-lg backdrop-blur-2xl" 
          : "bg-background/60 border-border/30 shadow-sm backdrop-blur-xl",
        "superhuman-glass",
        isMobile && "safe-area-inset-top"
      )}
      role="banner"
      aria-label="Application header"
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left section - Menu and Search */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Superhuman menu toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuClick}
            className={cn(
              "rounded-full superhuman-transition superhuman-hover",
              "hover:bg-primary/10 hover:text-primary active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            {isMobile && sidebarOpen ? (
              <XMarkIcon className="h-4 w-4 superhuman-transition" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-4 w-4 superhuman-transition" aria-hidden="true" />
            )}
          </Button>

          {/* Superhuman search */}
          <div className={cn(
            "flex-1 max-w-md superhuman-transition",
            isSearchFocused && "max-w-lg"
          )}>
            <div className="relative">
              <GlobalSearch 
                onFocusChange={setIsSearchFocused}
                className={cn(
                  "w-full superhuman-transition",
                  isSearchFocused && "ring-2 ring-primary/20"
                )}
              />
              
              {/* Superhuman keyboard shortcut hint */}
              {!isMobile && !isSearchFocused && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground/60">
                  <kbd className="px-1.5 py-0.5 bg-muted/30 rounded-md text-xs font-mono border border-border/30">
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-muted/30 rounded-md text-xs font-mono border border-border/30">K</kbd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Superhuman actions */}
        <nav 
          className="flex items-center gap-1" 
          role="navigation" 
          aria-label="User actions and settings"
        >
          {/* Desktop actions */}
          {!isMobile && (
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationBell />

              {/* Quick settings */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full superhuman-transition superhuman-hover hover:bg-primary/10 hover:text-primary"
                aria-label="Quick settings"
              >
                <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          {/* Mobile quick actions */}
          {isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full superhuman-transition superhuman-hover hover:bg-primary/10"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full superhuman-transition superhuman-hover hover:bg-primary/10 relative"
                aria-label="Notifications"
              >
                <BellIcon className="h-4 w-4" aria-hidden="true" />
                {/* Superhuman notification badge */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-primary to-accent rounded-full border border-background" />
              </Button>
            </div>
          )}

          {/* Superhuman separator */}
          <div className="w-px h-5 bg-border/40 mx-2" />

          {/* User menu */}
          <div className="ml-1">
            <UserMenu />
          </div>
        </nav>
      </div>

      {/* Superhuman progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-accent/50 scale-x-0 origin-left superhuman-transition" 
           data-loading-bar />

      {/* Mobile search overlay */}
      {isMobile && isSearchFocused && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30 p-4 z-50 superhuman-glass">
          <GlobalSearch 
            onFocusChange={setIsSearchFocused}
            autoFocus
          />
        </div>
      )}
    </header>
  )
}
