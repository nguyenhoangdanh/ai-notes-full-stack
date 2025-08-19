'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../lib/utils'
import { useHighContrastMode, useReducedMotion } from '../accessibility/A11y'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start collapsed on mobile
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()

  // Initialize accessibility features
  useHighContrastMode()
  useReducedMotion()

  // Handle responsive sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('app-sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, sidebarOpen])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background relative" role="application" aria-label="AI Notes Application">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-all duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="navigation"
        className={cn(
          "relative z-50 transition-all duration-300 ease-in-out",
          // Desktop behavior
          "lg:translate-x-0",
          sidebarOpen && !isMobile ? "lg:w-64" : "lg:w-16",
          // Mobile behavior
          "fixed lg:relative inset-y-0 left-0",
          isMobile && sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full",
          "shadow-2xl lg:shadow-lg"
        )}
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={sidebarOpen}
        aria-hidden={!sidebarOpen && isMobile}
      >
        <Sidebar
          collapsed={!sidebarOpen || (isMobile && !sidebarOpen)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        <main
          id="main-content"
          className="flex-1 overflow-auto focus:outline-none safe-area-inset bg-gradient-to-br from-background to-background/95"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          <div className="w-full mx-auto px-4 xs:px-3 sm:px-6 lg:px-8 py-6 xs:py-4 sm:py-8 max-w-7xl min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
