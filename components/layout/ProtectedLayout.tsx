'use client'

import { memo, Suspense, useEffect, useMemo, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuthStore } from '../../stores/auth.store'
import { AppLayout } from './AppLayout'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

// Optimized loading component with better UX
const AuthenticatedLoading = memo(function AuthenticatedLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-neutral-1 to-neutral-2" />
      <div className="absolute inset-0 bg-gradient-radial at-top-left from-accent-6/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-radial at-bottom-right from-accent-secondary-6/10 via-transparent to-transparent" />
      
      {/* Loading content */}
      <div className="relative z-10 text-center space-y-6 p-8">
        {/* Animated logo */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-3 to-accent-secondary-3 rounded-2xl border border-neutral-6 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-6 to-accent-secondary-6 rounded-2xl opacity-20 animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-accent-11 animate-pulse" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gradient-primary">AI Notes</h1>
          <p className="text-neutral-11 font-medium">Loading your workspace...</p>
        </div>
        
        {/* Progress indicators */}
        <div className="space-y-3">
          <div className="w-64 h-1 bg-neutral-3 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-accent-9 to-accent-secondary-9 rounded-full animate-pulse" 
                 style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-neutral-10">Setting up your environment...</p>
        </div>
      </div>
    </div>
  )
})

// Error fallback component
const ErrorFallback = memo(function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-neutral-1 to-neutral-2" />
      <div className="absolute inset-0 bg-gradient-radial at-center from-error-1 via-transparent to-transparent opacity-50" />
      
      {/* Error content */}
      <div className="relative z-10 text-center space-y-6 p-8 max-w-md">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 bg-error-3 rounded-2xl border border-error-6 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-error-11" />
        </div>
        
        {/* Error text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-12">Something went wrong</h1>
          <p className="text-neutral-11">
            We encountered an error while loading your workspace. Please try again.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-neutral-2 rounded-lg border border-neutral-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-neutral-11 mb-2">
                Error details
              </summary>
              <pre className="text-xs text-neutral-10 whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            icon={RefreshCw}
            onClick={resetErrorBoundary}
            className="w-full rounded-xl"
          >
            Try Again
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            onClick={() => window.location.href = '/auth'}
            className="w-full rounded-xl"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )
})

// Optimized auth hook to minimize re-renders
const useOptimizedAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const verifyToken = useAuthStore((state) => state.verifyToken)

  // Memoize the auth state to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email
  }), [user?.id, user?.email, isLoading])

  // Memoized auth check
  const handleAuthCheck = useCallback(async () => {
    try {
      await checkAuth()
    } catch (error) {
      console.error('Auth check failed:', error)
      // Don't throw here, let the component handle the loading state
    }
  }, [checkAuth])

  // OAuth callback handler
  const handleOAuthCallback = useCallback(async () => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      try {
        // Set token and verify
        const { setAuthToken } = await import('../../lib/api-config')
        setAuthToken(token)
        
        // Verify the token to get user data
        await verifyToken()
        
        // Clean up URL without page reload
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      } catch (error) {
        console.error('OAuth callback failed:', error)
      }
    }
  }, [verifyToken])

  return {
    ...authState,
    handleAuthCheck,
    handleOAuthCallback
  }
}

// Main ProtectedLayout component with optimized re-rendering
const ProtectedLayout = memo(function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, isLoading, isAuthenticated, handleAuthCheck, handleOAuthCallback } = useOptimizedAuth()

  // Handle authentication check on mount
  useEffect(() => {
    handleAuthCheck()
  }, [handleAuthCheck])

  // Handle OAuth callback
  useEffect(() => {
    handleOAuthCallback()
  }, [handleOAuthCallback])

  // Error boundary reset handler
  const handleErrorReset = useCallback(() => {
    // Reset auth state and try again
    handleAuthCheck()
  }, [handleAuthCheck])

  // Show loading state while auth is being checked
  if (isLoading) {
    return <AuthenticatedLoading />
  }

  // If user is not authenticated, render children without layout
  // This allows the AuthScreen to be displayed
  if (!isAuthenticated) {
    return <>{children}</>
  }

  // For authenticated users, wrap with AppLayout
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={handleErrorReset}
      onError={(error, errorInfo) => {
        console.error('ProtectedLayout error:', error, errorInfo)
        
        // In production, you might want to send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
          // Example: sendErrorToService(error, errorInfo)
        }
      }}
      resetKeys={[user?.id]} // Reset error boundary when user changes
    >
      <Suspense fallback={<AuthenticatedLoading />}>
        <AppLayout>
          {children}
        </AppLayout>
      </Suspense>
    </ErrorBoundary>
  )
})

ProtectedLayout.displayName = 'ProtectedLayout'

export { ProtectedLayout }
