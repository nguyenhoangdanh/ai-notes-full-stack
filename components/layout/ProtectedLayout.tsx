'use client'

import { memo, Suspense, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuthStore } from '../../stores/auth.store'
import { AppLayout } from './AppLayout'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

// Loading component for authenticated state
function AuthenticatedLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-text-muted">Loading your workspace...</p>
      </div>
    </div>
  )
}

// Memoized ProtectedLayout to prevent unnecessary re-renders across all pages
const ProtectedLayout = memo(function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, []) // Remove checkAuth from dependency to prevent infinite calls

  // Handle OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      // Set token and verify
      const { setAuthToken } = require('../../lib/api-config')
      setAuthToken(token)
      
      // Verify the token to get user data
      const { verifyToken } = useAuthStore.getState()
      verifyToken()
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Show loading state while auth is being checked
  if (isLoading) {
    return <AuthenticatedLoading />
  }

  // If user is not authenticated, render children without layout
  // This allows the AuthScreen to be displayed
  if (!user) {
    return <>{children}</>
  }

  // For authenticated users, wrap with AppLayout only
  // Store state management is now handled directly by components
  return (
    <ErrorBoundary
      fallback={<AuthenticatedLoading />}
      onError={(error) => {
        console.error('ProtectedLayout error:', error)
      }}
    >
      <Suspense fallback={<AuthenticatedLoading />}>
        <AppLayout>
          {children}
        </AppLayout>
      </Suspense>
    </ErrorBoundary>
  )
})

export { ProtectedLayout }
