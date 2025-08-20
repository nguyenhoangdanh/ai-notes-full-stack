'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()

  // Responsive sidebar management with improved UX
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    
    if (mobile) {
      setSidebarOpen(false)
    } else {
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

  // Enhanced scroll detection for modern visual feedback
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const throttledScroll = () => {
      requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])

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

  // Modern keyboard shortcuts
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

  // Auth layout for login/register with modern design
  if (!user) {
    return (
      <div className="min-h-screen bg-bg relative overflow-hidden">
        {/* Enhanced modern auth background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-elevated to-brand-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-100)_0%,_transparent_70%)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-brand-200)_0%,_transparent_70%)] opacity-20" />
        
        {/* Modern geometric patterns */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        
        {/* Floating geometric shapes for modern appeal */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "h-screen flex bg-bg relative overflow-hidden",
        "transition-modern"
      )} 
      role="application" 
      aria-label="AI Notes Application"
    >
      {/* Enhanced modern background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-elevated to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-brand-50)_0%,_transparent_50%)] opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-brand-100)_0%,_transparent_50%)] opacity-30" />
      
      {/* Modern grid pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:60px_60px]" />
      
      {/* Subtle animated elements for visual interest */}
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-brand-50/50 rounded-full blur-3xl animate-pulse opacity-50" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl animate-pulse delay-1000 opacity-50" />

      {/* Mobile overlay with improved backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg-overlay backdrop-blur-xl lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={cn(
          "relative z-50 flex-shrink-0 transition-modern",
          // Desktop behavior
          "lg:translate-x-0",
          sidebarOpen && !isMobile ? "lg:w-72" : "lg:w-16",
          // Mobile behavior
          "fixed lg:relative inset-y-0 left-0",
          isMobile && sidebarOpen ? "w-72 translate-x-0" : isMobile ? "w-72 -translate-x-full" : "",
          // Enhanced shadows
          "shadow-4 lg:shadow-2"
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

        {/* Main Content with enhanced styling */}
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-auto focus:outline-none relative",
            "bg-bg-muted/20",
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
            "max-w-7xl"
          )}>
            <div className="w-full h-full animate-fade-in">
              {children}
            </div>
          </div>

          {/* Modern scroll to top button */}
          <button
            className={cn(
              "fixed bottom-6 right-6 z-30",
              "w-12 h-12 rounded-2xl",
              "glass border border-border-subtle",
              "flex items-center justify-center",
              "text-text-muted hover:text-brand-600",
              "shadow-3 hover:shadow-4 hover-lift",
              "transition-modern",
              "opacity-0 pointer-events-none scale-90",
              isScrolled && "opacity-100 pointer-events-auto scale-100"
            )}
            onClick={() => {
              document.getElementById('main-content')?.scrollTo({
                top: 0,
                behavior: 'smooth'
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

          {/* Floating action button for quick note creation */}
          <button
            className={cn(
              "fixed bottom-20 right-6 z-30",
              "w-14 h-14 rounded-2xl",
              "bg-gradient-to-r from-brand-500 to-brand-600 text-white",
              "flex items-center justify-center",
              "shadow-3 hover:shadow-4 hover-lift",
              "transition-modern border border-brand-400/20",
              "opacity-0 pointer-events-none scale-90",
              !isMobile && "opacity-100 pointer-events-auto scale-100"
            )}
            onClick={() => {
              // Navigate to new note creation
              window.location.href = '/notes/create'
            }}
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
        </main>
      </div>
    </div>
  )
}
