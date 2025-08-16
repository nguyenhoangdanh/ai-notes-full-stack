import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { OfflineNotesProvider } from './contexts/OfflineNotesContext'
import { AIProvider } from './contexts/AIContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { MobileDashboard } from './components/mobile/MobileDashboard'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'sonner'

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading AI Notes...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <OfflineNotesProvider>
      <AIProvider>
        <MobileDashboard />
      </AIProvider>
    </OfflineNotesProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppContent />
        <Toaster 
          position="top-center" 
          toastOptions={{
            className: 'mobile-toast',
            duration: 3000
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App