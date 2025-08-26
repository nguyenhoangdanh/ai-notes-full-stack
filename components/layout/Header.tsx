'use client'

import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react'
import { Menu, X, Search, Bell, Settings, Sparkles, GitPullRequest, Command } from 'lucide-react'
import { Button, IconButton } from '../ui/Button'
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

// Optimized scroll state hook
const useHeaderScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        const scrolled = window.scrollY > 8
        if (scrolled !== isScrolled) {
          setIsScrolled(scrolled)
        }
        scrollTimeoutRef.current = undefined
      }, 16) // ~60fps throttling
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isScrolled])

  return isScrolled
}

// Memoized search state management
const SearchSection = memo(function SearchSection({ 
  isMobile, 
  onMobileSearchToggle 
}: { 
  isMobile: boolean
  onMobileSearchToggle: () => void 
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        if (isMobile) {
          onMobileSearchToggle()
        } else {
          const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
          searchInput?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, onMobileSearchToggle])

  if (isMobile) {
    return (
      <IconButton
        variant="ghost"
        size="md"
        icon={Search}
        onClick={onMobileSearchToggle}
        className="rounded-xl hover:bg-neutral-3 hover:text-accent-11"
        aria-label="Open search"
      />
    )
  }

  return (
    <div className={cn(
      "flex-1 max-w-md transition-all duration-200 ease-out",
      isSearchFocused && "max-w-lg"
    )}>
      <div className="relative">
        <GlobalSearch 
          onFocusChange={setIsSearchFocused}
          className={cn(
            "w-full transition-all duration-200 ease-out",
            isSearchFocused && "shadow-lg ring-2 ring-accent-6/20"
          )}
        />
        
        {/* Keyboard shortcut hint */}
        {!isSearchFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-neutral-3 text-neutral-11 rounded-md text-xs font-mono border border-neutral-6">
              <Command className="w-3 h-3" />
              K
            </kbd>
          </div>
        )}
      </div>
    </div>
  )
})

// Memoized brand section
const BrandSection = memo(function BrandSection({ 
  isMobile, 
  sidebarOpen 
}: { 
  isMobile: boolean
  sidebarOpen: boolean 
}) {
  if (!isMobile || sidebarOpen) return null

  return (
    <div className="flex items-center gap-2 ml-2">
      <div className="p-1.5 bg-gradient-to-br from-accent-3 to-accent-secondary-3 rounded-lg border border-neutral-6">
        <Sparkles className="h-4 w-4 text-accent-11" aria-hidden="true" />
      </div>
      <span className="font-bold text-lg text-gradient-primary">AI Notes</span>
    </div>
  )
})

// Memoized action buttons
const ActionButtons = memo(function ActionButtons({ isMobile }: { isMobile: boolean }) {
  const handleCreatePR = useCallback(() => {
    window.parent?.postMessage({ type: 'create-pr' }, '*')
  }, [])

  if (isMobile) {
    return (
      <div className="flex items-center gap-1">
        <IconButton
          variant="primary"
          size="md"
          icon={GitPullRequest}
          onClick={handleCreatePR}
          className="rounded-xl shadow-md hover:shadow-lg"
          aria-label="Create Pull Request"
        />
        <NotificationBell />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        icon={GitPullRequest}
        onClick={handleCreatePR}
        className="rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        aria-label="Create Pull Request"
      >
        Send PR
      </Button>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <IconButton
          variant="ghost"
          size="md"
          icon={Settings}
          className="rounded-xl hover:bg-neutral-3 hover:text-accent-11"
          aria-label="Settings"
          onClick={() => window.location.href = '/settings'}
        />
      </div>
    </div>
  )
})

// Mobile search overlay component
const MobileSearchOverlay = memo(function MobileSearchOverlay({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-neutral-1/95 backdrop-blur-lg lg:hidden">
      <div className="flex flex-col h-full">
        {/* Search header */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-6 bg-bg/80">
          <IconButton
            variant="ghost"
            size="md"
            icon={X}
            onClick={onClose}
            className="rounded-xl"
            aria-label="Close search"
          />
          
          <div className="flex-1">
            <GlobalSearch 
              autoFocus
              placeholder="Search notes, workspaces, and more..."
              value={searchValue}
              onChange={setSearchValue}
            />
          </div>
        </div>

        {/* Search content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            {/* Recent searches */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-11 mb-3">Recent searches</h3>
              <div className="space-y-2">
                <div className="text-sm text-neutral-10 p-3 rounded-lg bg-neutral-2 border border-neutral-6">
                  No recent searches
                </div>
              </div>
            </div>
            
            {/* Quick actions */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-11 mb-3">Quick actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={Sparkles} 
                  className="justify-start rounded-xl"
                  onClick={() => window.location.href = '/notes/create'}
                >
                  New Note
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={Settings} 
                  className="justify-start rounded-xl"
                  onClick={() => window.location.href = '/settings'}
                >
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export const Header = memo(function Header({ onMenuClick, sidebarOpen, isMobile }: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const isScrolled = useHeaderScroll()
  const headerRef = useRef<HTMLElement>(null)

  // Memoized handlers
  const handleMobileSearchToggle = useCallback(() => {
    setMobileSearchOpen(prev => !prev)
  }, [])

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false)
  }, [])

  // Memoized classes
  const headerClasses = useMemo(() => cn(
    "h-16 sticky top-0 z-40 border-b transition-all duration-300 ease-out",
    isScrolled 
      ? "bg-bg/80 backdrop-blur-xl border-neutral-6 shadow-lg" 
      : "bg-bg/60 border-neutral-4 shadow-md",
    isMobile && "supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]"
  ), [isScrolled, isMobile])

  const menuButtonClasses = useMemo(() => cn(
    "rounded-xl transition-all duration-200 ease-out",
    "hover:bg-neutral-3 hover:text-accent-11 hover:scale-105",
    "focus:ring-2 focus:ring-accent-6/20 focus:ring-offset-2 focus:ring-offset-bg"
  ), [])

  return (
    <>
      <header
        ref={headerRef}
        className={headerClasses}
        role="banner"
        aria-label="Application header"
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          {/* Left section */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Menu toggle */}
            <IconButton
              variant="ghost"
              size="md"
              icon={isMobile && sidebarOpen ? X : Menu}
              onClick={onMenuClick}
              className={menuButtonClasses}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
            />

            {/* Brand (mobile only when sidebar closed) */}
            <BrandSection isMobile={isMobile} sidebarOpen={sidebarOpen} />

            {/* Search */}
            <SearchSection 
              isMobile={isMobile} 
              onMobileSearchToggle={handleMobileSearchToggle}
            />
          </div>

          {/* Right section */}
          <nav 
            className="flex items-center gap-1" 
            role="navigation" 
            aria-label="User actions and settings"
          >
            <ActionButtons isMobile={isMobile} />

            {/* Separator */}
            <div className="w-px h-5 bg-neutral-6 mx-2" />

            {/* User menu */}
            <UserMenu />
          </nav>
        </div>

        {/* Loading progress bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-9 to-accent-secondary-9 scale-x-0 origin-left transition-transform duration-300" 
          data-loading-bar 
        />
      </header>

      {/* Mobile search overlay */}
      <MobileSearchOverlay 
        isOpen={mobileSearchOpen} 
        onClose={closeMobileSearch}
      />
    </>
  )
})

Header.displayName = 'Header'
