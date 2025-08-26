'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, X, Search, Bell, Settings, Sparkles, GitPullRequest, Zap, Command, Palette } from 'lucide-react'
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

export function Header({ onMenuClick, sidebarOpen, isMobile }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const headerRef = useRef<HTMLElement>(null)

  // Enhanced scroll detection with throttling
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search with Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          setIsSearchFocused(true)
        }
      }

      // Close search overlay on Escape
      if (event.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false)
        setSearchQuery('')
      }

      // Toggle sidebar with Ctrl/Cmd + \
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault()
        onMenuClick()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchFocused, onMenuClick])

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    // Delay hiding to allow for click events
    setTimeout(() => setIsSearchFocused(false), 150)
  }

  const handlePRAction = () => {
    // Trigger platform's PR creation flow
    window.parent?.postMessage({ type: 'create-pr' }, '*')
  }

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "header-modern",
          isScrolled && "scrolled",
          isMobile && "safe-area-inset-top"
        )}
        role="banner"
        aria-label="Application header"
      >
        <div className="header-content relative z-10">
          {/* Left Section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Menu Toggle Button */}
            <button
              className="menu-toggle"
              onClick={onMenuClick}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
            >
              <div className={cn(
                "relative transition-transform duration-300",
                sidebarOpen && isMobile && "rotate-90"
              )}>
                {isMobile && sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Brand Logo for Mobile when Sidebar is Closed */}
            {isMobile && !sidebarOpen && (
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-200/30 dark:border-blue-800/30 transition-all group-hover:scale-105">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-lg brand-gradient">AI Notes</span>
              </Link>
            )}

            {/* Search Section */}
            <div className={cn(
              "flex-1 max-w-2xl transition-all duration-300",
              isSearchFocused && "max-w-3xl",
              isMobile && "max-w-sm"
            )}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                </div>
                
                <input
                  data-search-input
                  type="text"
                  placeholder="Search notes, workspaces, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className={cn(
                    "search-modern pl-10 pr-20",
                    "w-full transition-all duration-300",
                    isSearchFocused && "ring-2 ring-blue-500/20 bg-white dark:bg-slate-900"
                  )}
                />
                
                {/* Keyboard Shortcut Hint */}
                {!isMobile && !isSearchFocused && !searchQuery && (
                  <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <Command className="h-3 w-3 inline mr-1" />
                      K
                    </kbd>
                  </div>
                )}

                {/* Search Results Quick Preview */}
                {isSearchFocused && (searchQuery || true) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg backdrop-blur-xl z-50">
                    <div className="p-4">
                      {searchQuery ? (
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Search results for "{searchQuery}"
                          </div>
                          {/* Search results would go here */}
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Start typing to search...
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Recent searches</h3>
                            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                              <div className="hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer">Project planning</div>
                              <div className="hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer">Meeting notes</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Quick actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="ghost" size="sm" className="justify-start h-9">
                                <Sparkles className="h-4 w-4 mr-2" />
                                New Note
                              </Button>
                              <Button variant="ghost" size="sm" className="justify-start h-9">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <nav 
            className="flex items-center gap-2" 
            role="navigation" 
            aria-label="User actions and settings"
          >
            {/* Desktop Actions */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                {/* AI Assistant Quick Access */}
                <button className="header-action group" aria-label="AI Assistant">
                  <Zap className="h-5 w-5" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Theme Toggle */}
                <button className="header-action" aria-label="Toggle theme">
                  <Palette className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <NotificationBell />

                {/* Settings */}
                <button className="header-action" aria-label="Settings">
                  <Settings className="h-5 w-5" />
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                {/* PR/Push Button */}
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handlePRAction}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  aria-label="Create Pull Request"
                >
                  <GitPullRequest className="h-4 w-4 mr-2" />
                  Send PR
                </Button>
              </div>
            )}

            {/* Mobile Actions */}
            {isMobile && (
              <div className="flex items-center gap-2">
                {/* Mobile AI Assistant */}
                <button className="header-action" aria-label="AI Assistant">
                  <Zap className="h-5 w-5" />
                </button>

                {/* Mobile Notifications */}
                <NotificationBell />

                {/* Mobile PR Button */}
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handlePRAction}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-3"
                  aria-label="Create Pull Request"
                >
                  <GitPullRequest className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* User Menu */}
            <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <UserMenu />
            </div>
          </nav>
        </div>

        {/* Progress Bar for Loading States */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 origin-left transition-transform duration-300 opacity-0" data-loading-bar />
      </header>

      {/* Mobile Search Overlay */}
      {isMobile && isSearchFocused && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 h-full flex flex-col">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsSearchFocused(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Recent searches</h3>
                  <div className="space-y-2">
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                      <div className="font-medium">Project planning</div>
                      <div className="text-sm text-slate-500">in Workspace • 2 results</div>
                    </div>
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                      <div className="font-medium">Meeting notes</div>
                      <div className="text-sm text-slate-500">in Notes • 5 results</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Quick actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="ghost" size="sm" className="justify-start h-12 text-left">
                      <Sparkles className="h-5 w-5 mr-3" />
                      <div>
                        <div className="font-medium">Create New Note</div>
                        <div className="text-xs text-slate-500">Start writing instantly</div>
                      </div>
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start h-12 text-left">
                      <Settings className="h-5 w-5 mr-3" />
                      <div>
                        <div className="font-medium">Settings</div>
                        <div className="text-xs text-slate-500">Customize your experience</div>
                      </div>
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
