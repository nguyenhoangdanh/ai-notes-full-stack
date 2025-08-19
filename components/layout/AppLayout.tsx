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

  // Responsive sidebar management
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

  // Scroll detection for enhanced UI effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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

  // Superhuman keyboard shortcuts
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

  // Auth layout for login/register
  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Superhuman auth background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-10" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "h-screen flex bg-background relative overflow-hidden",
        "superhuman-transition"
      )} 
      role="application" 
      aria-label="AI Notes Application"
    >
      {/* Superhuman background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-primary/3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--primary)_0%,_transparent_50%)] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_50%)] opacity-8" />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl lg:hidden animate-superhuman-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={cn(
          "relative z-50 flex-shrink-0 superhuman-transition",
          // Desktop behavior
          "lg:translate-x-0",
          sidebarOpen && !isMobile ? "lg:w-72" : "lg:w-16",
          // Mobile behavior
          "fixed lg:relative inset-y-0 left-0",
          isMobile && sidebarOpen ? "w-72 translate-x-0" : isMobile ? "w-72 -translate-x-full" : "",
          // Enhanced shadows
          "shadow-2xl lg:shadow-lg"
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

        {/* Main Content */}
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-auto focus:outline-none relative",
            "bg-background/30 backdrop-blur-sm",
            "safe-area-inset safe-area-inset-bottom",
            isScrolled ? "group-data-[scrolled]" : ""
          )}
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          {/* Content container */}
          <div className={cn(
            "w-full mx-auto min-h-full",
            "px-4 xs:px-3 sm:px-6 lg:px-8",
            "py-6 xs:py-4 sm:py-8",
            "max-w-7xl"
          )}>
            <div className="w-full h-full animate-superhuman-fade-in">
              {children}
            </div>
          </div>

          {/* Superhuman scroll to top button */}
          <button
            className={cn(
              "fixed bottom-6 right-6 z-30",
              "w-12 h-12 rounded-full",
              "bg-background/80 border border-border/30 backdrop-blur-xl",
              "flex items-center justify-center",
              "text-muted-foreground hover:text-primary",
              "shadow-lg hover:shadow-xl superhuman-hover superhuman-glow",
              "superhuman-transition",
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
        </main>
      </div>
    </div>
  )
}
