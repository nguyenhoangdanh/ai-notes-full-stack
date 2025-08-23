'use client'

import { memo, Suspense } from 'react'
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
    <Suspense fallback={<AuthenticatedLoading />}>
      <NotesProvider>
        <OfflineNotesProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </OfflineNotesProvider>
      </NotesProvider>
    </Suspense>
  )
})

export { ProtectedLayout }
