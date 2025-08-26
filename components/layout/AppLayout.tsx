'use client'

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { useAuthStore } from '../../stores/auth.store'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../lib/utils'
import { ChevronUp, Plus } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

// Separate scroll context to avoid re-renders
const useScrollState = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      const scrolled = window.scrollY > 10
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled)
      }
    }

    const throttledScroll = () => {
      if (scrollTimeoutRef.current) return
      scrollTimeoutRef.current = setTimeout(() => {
        handleScroll()
        scrollTimeoutRef.current = null
      }, 16) // ~60fps
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isScrolled])

  return isScrolled
}

// Optimized viewport hook
const useViewport = () => {
  const [viewport, setViewport] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0
  })

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setViewport({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      })
    }

    updateViewport()
    
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateViewport, 100)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  return viewport
}

// Memoized auth context
const useOptimizedAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  
  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user
  }), [user?.id, user?.email, isLoading])
}

export const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isMobile, isTablet, isDesktop } = useViewport()
  const isScrolled = useScrollState()
  const { user, isLoading, isAuthenticated } = useOptimizedAuth()

  // Memoized sidebar state management
  const sidebarState = useMemo(() => {
    if (isMobile) return { isOpen: sidebarOpen, isCompact: false }
    if (isTablet) return { isOpen: true, isCompact: true }
    return { isOpen: true, isCompact: false }
  }, [isMobile, isTablet, sidebarOpen])

  // Optimized sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Auto-manage sidebar on viewport changes
  useEffect(() => {
    if (isDesktop || isTablet) {
      setSidebarOpen(false) // Reset mobile state
    }
  }, [isDesktop, isTablet])

  // Optimized keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault()
        if (isMobile) {
          toggleSidebar()
        }
      }
      
      if (event.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, sidebarOpen, toggleSidebar])

  // Optimized click outside handler
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('app-sidebar')
      const target = event.target as Node
      
      if (sidebar && !sidebar.contains(target)) {
        setSidebarOpen(false)
      }
    }

    // Delay to avoid immediate closure
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, sidebarOpen])

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // Quick note creation
  const createNote = useCallback(() => {
    window.location.href = '/notes/create'
  }, [])

  // Memoized layout classes
  const layoutClasses = useMemo(() => cn(
    "h-screen flex overflow-hidden relative",
    "bg-bg transition-colors duration-300"
  ), [])

  const sidebarClasses = useMemo(() => cn(
    "relative z-30 flex-shrink-0 transition-all duration-300 ease-out",
    // Desktop & Tablet
    "lg:translate-x-0",
    isDesktop && sidebarState.isOpen && !sidebarState.isCompact && "lg:w-72",
    isDesktop && (!sidebarState.isOpen || sidebarState.isCompact) && "lg:w-16",
    isTablet && "lg:w-16",
    // Mobile
    "fixed lg:relative inset-y-0 left-0 z-40",
    isMobile && sidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0",
    // Enhanced shadows
    "shadow-xl lg:shadow-lg"
  ), [sidebarState, isMobile, isTablet, isDesktop, sidebarOpen])

  const mainContentClasses = useMemo(() => cn(
    "flex-1 flex flex-col min-w-0 overflow-hidden relative",
    "bg-neutral-1"
  ), [])

  const scrollButtonClasses = useMemo(() => cn(
    "fixed bottom-6 right-6 z-20",
    "w-12 h-12 rounded-xl",
    "bg-bg border border-neutral-6 shadow-lg",
    "flex items-center justify-center",
    "text-neutral-11 hover:text-accent-11",
    "transition-all duration-300 ease-out",
    "transform hover:scale-105 active:scale-95",
    isScrolled ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"
  ), [isScrolled])

  const fabClasses = useMemo(() => cn(
    "fixed z-20",
    isMobile ? "bottom-20 right-6" : "bottom-6 right-20",
    "w-14 h-14 rounded-xl",
    "bg-accent-9 hover:bg-accent-10 text-accent-contrast",
    "flex items-center justify-center shadow-lg hover:shadow-xl",
    "transition-all duration-300 ease-out",
    "transform hover:scale-105 active:scale-95",
    isAuthenticated ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"
  ), [isMobile, isAuthenticated])

  // Auth layout for non-authenticated users
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg relative overflow-hidden">
        {/* Modern background with proper design tokens */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-neutral-1 to-neutral-2" />
        <div className="absolute inset-0 bg-gradient-radial at-top-left from-accent-6/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial at-bottom-right from-accent-secondary-6/20 via-transparent to-transparent" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-neutral-6)_1px,_transparent_1px)] bg-[size:24px_24px]" />
        </div>
        
        <div className="relative z-10">{children}</div>
      </div>
    )
  }

  return (
    <div className={layoutClasses} role="application" aria-label="AI Notes Application">
      {/* Background layers with proper design tokens */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-neutral-1 to-neutral-2" />
      <div className="absolute inset-0 bg-gradient-radial at-top-left from-accent-6/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial at-bottom-right from-accent-secondary-6/10 via-transparent to-transparent" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-neutral-6)_1px,_transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-12/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={sidebarState.isOpen}
        aria-hidden={!sidebarState.isOpen && isMobile}
      >
        <Sidebar
          collapsed={!sidebarState.isOpen || sidebarState.isCompact}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          user={user}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarState.isOpen}
          isMobile={isMobile}
        />

        {/* Main content */}
        <main
          id="main-content"
          className={mainContentClasses}
          role="main"
          aria-label="Main content"
        >
          {/* Content container */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <div className="w-full animate-fade-in">
                {children}
              </div>
            </div>
          </div>

          {/* Scroll to top button */}
          <button
            className={scrollButtonClasses}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            type="button"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Floating action button for quick note creation */}
          <button
            className={fabClasses}
            onClick={createNote}
            aria-label="Create new note"
            type="button"
          >
            <Plus className="w-6 h-6" />
          </button>
        </main>
      </div>
    </div>
  )
})

AppLayout.displayName = 'AppLayout'
