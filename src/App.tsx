import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotesProvider } from './contexts/NotesContext'
import { OfflineNotesProvider } from './contexts/OfflineNotesContext'
import { AIProvider } from './contexts/AIContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { Dashboard } from './components/dashboard/Dashboard'
import { MobileDashboard } from './components/mobile/MobileDashboard'
import { useIsMobile } from './hooks/use-mobile'
import { Toaster, toast } from 'sonner'
import { initializeApiClient } from './lib/api-config'

function AppContent() {
  const { user, isLoading } = useAuth()
  const isMobile = useIsMobile()

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
    <NotesProvider>
      <OfflineNotesProvider>
        <AIProvider>
          {isMobile ? <MobileDashboard /> : <Dashboard />}
        </AIProvider>
      </OfflineNotesProvider>
    </NotesProvider>
  )
}

function App() {
  const [isApiInitialized, setIsApiInitialized] = useState(false)

  useEffect(() => {
    // Initialize the API client
    initializeApiClient()

    // Show offline mode notification if no backend is configured
    const hasBackend = import.meta.env.VITE_API_BASE_URL
    if (!hasBackend && import.meta.env.DEV) {
      setTimeout(() => {
        toast.info('Running in offline mode - all data is stored locally', {
          duration: 5000,
          description: 'Connect a backend server to enable sync across devices'
        })
      }, 2000)
    }

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
