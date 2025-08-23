'use client'

import { memo, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuth } from '../../contexts/AuthContext'
import { NotesProvider } from '../../contexts/NotesContext'
import { OfflineNotesProvider } from '../../contexts/OfflineNotesContext'
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

// Error fallback for context issues
function ContextErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833-.192 2.5 1.582 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text">Context Error</h2>
        <p className="text-text-muted">
          {error.message || 'Failed to initialize workspace context.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Reload Application
        </button>
      </div>
    </div>
  )
}

// Memoized ProtectedLayout to prevent unnecessary re-renders across all pages
const ProtectedLayout = memo(function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth()

  // Show loading state while auth is being checked
  if (isLoading) {
    return <AuthenticatedLoading />
  }

  // If user is not authenticated, render children without layout
  // This allows the AuthScreen to be displayed
  if (!user) {
    return <>{children}</>
  }

  // For authenticated users, wrap with providers and AppLayout
  // This ensures consistent sidebar state management across all pages
  // Use Suspense to handle any async loading states
  return (
    <ErrorBoundary
      fallback={<AuthenticatedLoading />}
      onError={(error) => {
        console.error('ProtectedLayout error:', error)
      }}
    >
      <Suspense fallback={<AuthenticatedLoading />}>
        <ErrorBoundary
          fallback={ContextErrorFallback}
          onError={(error) => {
            console.error('NotesProvider context error:', error)
          }}
        >
          <NotesProvider>
            <OfflineNotesProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </OfflineNotesProvider>
          </NotesProvider>
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  )
})

export { ProtectedLayout }
