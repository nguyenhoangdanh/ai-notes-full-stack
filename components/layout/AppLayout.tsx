'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useAuthStore } from '../../stores/auth.store'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  // Memoize user to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [user?.id, user?.email])

  // Enhanced responsive sidebar management
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    
    if (mobile) {
      setSidebarOpen(false)
    } else {
      // Auto-open sidebar on desktop
      setSidebarOpen(true)
    }
  }, [])

  useEffect(() => {
    handleResize()
    
    let resizeTimer: NodeJS.Timeout
    const throttledResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', throttledResize, { passive: true })
    return () => {
      window.removeEventListener('resize', throttledResize)
      clearTimeout(resizeTimer)
    }
  }, [handleResize])

  // Enhanced scroll detection
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Enhanced click outside handler for mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('app-sidebar')
      const target = event.target as Node
      
      if (sidebar && !sidebar.contains(target)) {
        setSidebarOpen(false)
      }
    }

    // Add a small delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, sidebarOpen])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + \
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      
      // Close sidebar with Escape on mobile
      if (event.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, sidebarOpen])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [])

  // Quick note creation
  const createNote = useCallback(() => {
    window.location.href = '/notes/create'
  }, [])

  // Enhanced auth layout for better user experience
  if (!isLoading && !memoizedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 relative overflow-hidden">
        {/* Modern background patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-indigo-950/50" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
        
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="h-screen flex bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden"
      role="application" 
      aria-label="AI Notes Application"
    >
      {/* Enhanced background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/30 to-indigo-50/50 dark:from-slate-900/80 dark:via-slate-800/30 dark:to-indigo-950/50" />
      
      {/* Subtle animated elements */}
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Modern geometric pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.1) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }} />

      {/* Mobile Overlay with enhanced backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="mobile-overlay active"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={cn(
          "relative z-50 flex-shrink-0 transition-all duration-300 ease-out",
          // Desktop behavior
          "lg:translate-x-0",
          sidebarOpen && !isMobile ? "lg:w-72" : "lg:w-16",
          // Mobile behavior
          "fixed lg:relative inset-y-0 left-0",
          isMobile && sidebarOpen ? "w-72 translate-x-0" : isMobile ? "w-72 -translate-x-full" : "",
          // Enhanced shadows and borders
          "shadow-xl lg:shadow-lg border-r border-slate-200/60 dark:border-slate-700/60"
        )}
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={sidebarOpen}
        aria-hidden={!sidebarOpen && isMobile}
      >
        <Sidebar
          collapsed={!sidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          user={memoizedUser}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-auto focus:outline-none relative",
            "bg-white/30 dark:bg-slate-900/30",
            "backdrop-blur-sm",
            isMobile && "safe-area-inset-bottom"
          )}
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          {/* Content Container */}
          <div className="container-modern min-h-full py-6">
            <div className="w-full h-full animate-in fade-in duration-500">
              {children}
            </div>
          </div>

          {/* Modern Scroll to Top Button */}
          <button
            className={cn(
              "fixed bottom-6 right-6 z-30 w-12 h-12 rounded-2xl",
              "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
              "border border-slate-200/60 dark:border-slate-700/60",
              "flex items-center justify-center",
              "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "opacity-0 pointer-events-none scale-90 translate-y-4",
              isScrolled && "opacity-100 pointer-events-auto scale-100 translate-y-0",
              "hover:-translate-y-1"
            )}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>

          {/* Enhanced Floating Action Button */}
          <button
            className={cn(
              "fixed bottom-20 right-6 z-30 w-14 h-14 rounded-2xl",
              "bg-gradient-to-br from-blue-500 to-indigo-600",
              "text-white shadow-lg hover:shadow-xl",
              "flex items-center justify-center",
              "transition-all duration-300 hover:-translate-y-1",
              "opacity-0 pointer-events-none scale-90",
              !isMobile && "opacity-100 pointer-events-auto scale-100",
              "hover:from-blue-600 hover:to-indigo-700"
            )}
            onClick={createNote}
            aria-label="Create new note"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* AI Assistant Quick Access (Desktop) */}
          {!isMobile && (
            <button
              className={cn(
                "fixed bottom-36 right-6 z-30 w-12 h-12 rounded-xl",
                "bg-gradient-to-br from-purple-500 to-indigo-600",
                "text-white shadow-lg hover:shadow-xl",
                "flex items-center justify-center",
                "transition-all duration-300 hover:-translate-y-1",
                "opacity-90 hover:opacity-100",
                "hover:from-purple-600 hover:to-indigo-700"
              )}
              onClick={() => window.location.href = '/ai/chat'}
              aria-label="Open AI Assistant"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </button>
          )}
        </main>
      </div>
    </div>
  )
})

AppLayout.displayName = 'AppLayout'

export { AppLayout }
