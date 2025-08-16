import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { OfflineNotesProvider } from './contexts/OfflineNotesContext'
import { AIProvider } from './contexts/AIContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { MobileDashboard } from './components/mobile/MobileDashboard'
import { Toaster } from 'sonner'
import { initializeApiClient } from './lib/api-config'

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
  const [isApiInitialized, setIsApiInitialized] = useState(false)

  useEffect(() => {
    // Initialize the API client
    initializeApiClient()
    setIsApiInitialized(true)
  }, [])

  if (!isApiInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing AI Notes...</p>
        </div>
      </div>
    )
  }

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