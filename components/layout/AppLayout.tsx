'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../lib/utils'
import { useHighContrastMode, useReducedMotion } from '../accessibility/A11y'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const { user } = useAuth()

  // Initialize accessibility features
  useHighContrastMode()
  const isReducedMotion = useReducedMotion()

  // Memoized resize handler for performance
  const handleResize = useCallback(() => {
    setIsResizing(true)
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    
    // Auto-open sidebar on desktop, close on mobile
    if (mobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }

    // Debounce resize end
    setTimeout(() => setIsResizing(false), 100)
  }, [])

  // Handle responsive sidebar state
  useEffect(() => {
    handleResize()

    // Throttled resize listener for performance
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

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('app-sidebar')
        const target = event.target as Node
        if (sidebar && !sidebar.contains(target) && target !== sidebar) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, sidebarOpen])

  // Handle keyboard navigation
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-accent/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent-2)_0%,_transparent_70%)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent-secondary-2)_0%,_transparent_70%)] opacity-20" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "h-screen flex bg-gradient-to-br from-background via-background/98 to-accent/3 relative overflow-hidden",
        isReducedMotion ? "" : "transition-all duration-300 ease-out",
        isResizing && "pointer-events-none"
      )} 
      role="application" 
      aria-label="AI Notes Application"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-accent-2)_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent-secondary-2)_0%,_transparent_50%)] opacity-15" />

      {/* Mobile overlay with improved backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden",
            isReducedMotion 
              ? "opacity-100" 
              : "animate-in fade-in duration-300"
          )}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={cn(
          "relative z-50 flex-shrink-0",
          // Desktop behavior
          "lg:translate-x-0",
          sidebarOpen && !isMobile ? "lg:w-72" : "lg:w-16",
          // Mobile behavior
          "fixed lg:relative inset-y-0 left-0",
          isMobile && sidebarOpen ? "w-72 translate-x-0" : isMobile ? "w-72 -translate-x-full" : "",
          // Transitions
          isReducedMotion 
            ? "" 
            : "transition-all duration-300 ease-out",
          // Enhanced shadows for depth
          "shadow-2xl lg:shadow-lg",
          isMobile && sidebarOpen ? "shadow-colored" : ""
        )}
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={sidebarOpen}
        aria-hidden={!sidebarOpen && isMobile}
        style={{ 
          willChange: isResizing ? 'transform, width' : 'auto'
        }}
      >
        <Sidebar
          collapsed={!sidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
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
            "bg-gradient-to-br from-background/95 via-background/98 to-background",
            // Safe area insets for mobile
            "safe-area-inset safe-area-inset-bottom"
          )}
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          {/* Content container with responsive padding */}
          <div className={cn(
            "w-full mx-auto min-h-full",
            "px-4 xs:px-3 sm:px-6 lg:px-8",
            "py-6 xs:py-4 sm:py-8",
            "max-w-7xl",
            "responsive-padding"
          )}>
            <div className={cn(
              "w-full h-full",
              isReducedMotion 
                ? "" 
                : "animate-in fade-in slide-in-from-bottom-4 duration-500"
            )}>
              {children}
            </div>
          </div>

          {/* Scroll to top button for better UX */}
          <button
            className={cn(
              "fixed bottom-6 right-6 z-30",
              "w-12 h-12 rounded-full",
              "glass-effect-strong",
              "flex items-center justify-center",
              "text-foreground/80 hover:text-foreground",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-200 ease-out",
              "opacity-0 pointer-events-none",
              "focus-visible:opacity-100 focus-visible:pointer-events-auto",
              // Show on scroll
              "group-data-[scrolled]:opacity-100 group-data-[scrolled]:pointer-events-auto"
            )}
            onClick={() => {
              document.getElementById('main-content')?.scrollTo({
                top: 0,
                behavior: isReducedMotion ? 'auto' : 'smooth'
              })
            }}
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
        </main>
      </div>
    </div>
  )
}
