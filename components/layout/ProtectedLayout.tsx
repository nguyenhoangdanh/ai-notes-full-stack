'use client'

import { memo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { NotesProvider } from '../../contexts/NotesContext'
import { OfflineNotesProvider } from '../../contexts/OfflineNotesContext'
import { AppLayout } from './AppLayout'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

// Memoized ProtectedLayout to prevent unnecessary re-renders across all pages
const ProtectedLayout = memo(function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user } = useAuth()

  // If user is not authenticated, render children without layout
  // This allows the AuthScreen to be displayed
  if (!user) {
    return <>{children}</>
  }

  // For authenticated users, wrap with providers and AppLayout
  // This ensures consistent sidebar state management across all pages
  return (
    <NotesProvider>
      <OfflineNotesProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </OfflineNotesProvider>
    </NotesProvider>
  )
})

export { ProtectedLayout }
