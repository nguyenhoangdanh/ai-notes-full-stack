'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, X, Search, Bell, Settings, Sparkles } from 'lucide-react'
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

  // Modern scroll detection with enhanced visual feedback
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10
      setIsScrolled(scrolled)
    }

    const throttledScroll = () => {
      requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])

  // Enhanced keyboard shortcuts for modern UX
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

      // Close search overlay on Escape
      if (event.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchFocused])

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "h-16 sticky top-0 z-40 transition-modern",
          // Enhanced modern glass effect with dynamic styling
          isScrolled 
            ? "glass border-b border-border-subtle shadow-3" 
            : "bg-surface/60 border-b border-border/20 shadow-1",
          // Modern gradient overlay for visual appeal
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-50/10 before:to-transparent before:pointer-events-none",
          isMobile && "safe-area-inset-top"
        )}
        role="banner"
        aria-label="Application header"
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto relative z-10">
          {/* Left section - Menu and Brand/Search */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Modern menu toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMenuClick}
              className={cn(
                "rounded-xl transition-modern hover-lift",
                "hover:bg-surface-hover hover:text-brand-600",
                "focus-visible:ring-2 focus-visible:ring-brand-200"
              )}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
            >
              {isMobile && sidebarOpen ? (
                <X className="h-4 w-4 transition-transform" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4 transition-transform" aria-hidden="true" />
              )}
            </Button>

            {/* Brand logo for mobile when sidebar is closed */}
            {isMobile && !sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg">
                  <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
                </div>
                <span className="font-bold text-lg text-gradient">AI Notes</span>
              </div>
            )}

            {/* Modern search */}
            <div className={cn(
              "flex-1 max-w-md transition-modern",
              isSearchFocused && "max-w-lg"
            )}>
              <div className="relative">
                <GlobalSearch 
                  onFocusChange={setIsSearchFocused}
                  className={cn(
                    "w-full transition-modern",
                    isSearchFocused && "ring-2 ring-brand-200 shadow-2"
                  )}
                />
                
                {/* Keyboard shortcut hint */}
                {!isMobile && !isSearchFocused && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-text-subtle">
                    <kbd className="px-1.5 py-0.5 bg-bg-muted rounded-md text-xs font-mono border border-border-subtle">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-bg-muted rounded-md text-xs font-mono border border-border-subtle">K</kbd>
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
                <ThemeToggle />
                <NotificationBell />
                
                {/* Quick settings */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl transition-modern hover-lift hover:bg-surface-hover hover:text-brand-600"
                  aria-label="Quick settings"
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}

            {/* Mobile quick actions */}
            {isMobile && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl transition-modern hover-lift hover:bg-surface-hover"
                  aria-label="Search"
                  onClick={() => setIsSearchFocused(true)}
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </Button>
                
                <NotificationBell />
              </div>
            )}

            {/* Modern separator */}
            <div className="w-px h-5 bg-border ml-2 mr-1" />

            {/* User menu */}
            <div className="ml-1">
              <UserMenu />
            </div>
          </nav>
        </div>

        {/* Modern progress indicator for loading states */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 scale-x-0 origin-left transition-transform duration-300" 
          data-loading-bar 
        />
      </header>

      {/* Mobile search overlay */}
      {isMobile && isSearchFocused && (
        <div className="fixed inset-0 z-50 bg-bg-overlay backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col h-full">
            {/* Search header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsSearchFocused(false)}
                className="rounded-xl"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <GlobalSearch 
                  onFocusChange={setIsSearchFocused}
                  autoFocus
                  placeholder="Search notes, workspaces, and more..."
                />
              </div>
            </div>

            {/* Search content area */}
            <div className="flex-1 overflow-auto p-4">
              {/* Search suggestions, recent searches, etc. would go here */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Recent searches</h3>
                  <div className="space-y-1">
                    {/* Recent search items */}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Quick actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Sparkles className="h-4 w-4 mr-2" />
                      New Note
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
