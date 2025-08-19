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

  // Handle scroll detection for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
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
        "h-16 sticky top-0 z-40 border-b transition-all duration-300 ease-out",
        // Dynamic background based on scroll
        isScrolled 
          ? "glass-effect-strong border-border/80 shadow-lg" 
          : "glass-effect border-border/40 shadow-sm",
        // Enhanced mobile styling
        isMobile && "safe-area-inset-top"
      )}
      role="banner"
      aria-label="Application header"
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left section - Menu and Search */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Menu toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className={cn(
              "h-10 w-10 p-0 rounded-xl transition-all duration-200 group",
              "hover:bg-accent/80 hover:scale-105 active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-accent/30",
              "shadow-sm hover:shadow-md"
            )}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <div className="relative">
              {isMobile && sidebarOpen ? (
                <XMarkIcon 
                  className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" 
                  aria-hidden="true" 
                />
              ) : (
                <Bars3Icon 
                  className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" 
                  aria-hidden="true" 
                />
              )}
              
              {/* Visual indicator for keyboard shortcut */}
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </Button>

          {/* Search section */}
          <div className={cn(
            "flex-1 max-w-md transition-all duration-300 ease-out",
            isSearchFocused && "max-w-lg"
          )}>
            <div className="relative">
              <GlobalSearch 
                onFocusChange={setIsSearchFocused}
                className={cn(
                  "w-full transition-all duration-200",
                  isSearchFocused && "ring-2 ring-accent/30"
                )}
              />
              
              {/* Search keyboard shortcut hint */}
              {!isMobile && !isSearchFocused && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono">
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-xs font-mono">K</kbd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions and User Menu */}
        <nav 
          className="flex items-center gap-1" 
          role="navigation" 
          aria-label="User actions and settings"
        >
          {/* Desktop actions */}
          {!isMobile && (
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <div className="relative group">
                <ThemeToggle />
                
                {/* Enhanced tooltip on hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  Toggle theme
                </div>
              </div>

              {/* Notifications */}
              <div className="relative group">
                <NotificationBell />
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  Notifications
                </div>
              </div>

              {/* Quick settings shortcut */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 rounded-xl transition-all duration-200 group",
                  "hover:bg-accent/80 hover:scale-105 active:scale-95",
                  "focus-visible:ring-2 focus-visible:ring-accent/30"
                )}
                aria-label="Quick settings"
              >
                <Cog6ToothIcon 
                  className="h-5 w-5 transition-transform duration-200 group-hover:rotate-45" 
                  aria-hidden="true" 
                />
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  Settings
                </div>
              </Button>
            </div>
          )}

          {/* Mobile quick actions */}
          {isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl relative"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" aria-hidden="true" />
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
              </Button>
            </div>
          )}

          {/* Separator */}
          <div className="w-px h-6 bg-border/60 mx-2" />

          {/* User menu */}
          <div className="ml-2">
            <UserMenu />
          </div>
        </nav>
      </div>

      {/* Progress bar for loading states */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/50 via-accent to-accent-secondary/50 scale-x-0 origin-left transition-transform duration-300 ease-out" 
           data-loading-bar />

      {/* Mobile search overlay */}
      {isMobile && isSearchFocused && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/60 p-4 z-50">
          <GlobalSearch 
            onFocusChange={setIsSearchFocused}
            autoFocus
          />
        </div>
      )}
    </header>
  )
}
