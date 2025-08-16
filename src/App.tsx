import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { NotesProvider } from './contexts/NotesContext'
import { AuthScreen } from './components/auth/AuthScreen'
import { Dashboard } from './components/dashboard/Dashboard'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'sonner'

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <NotesProvider>
      <Dashboard />
    </NotesProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppContent />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  )
}

export default App