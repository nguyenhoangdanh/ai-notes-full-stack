'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { AuthScreen } from '../components/auth/AuthScreen'
import { toast } from 'sonner'
import { initializeApiClient } from '../lib/api-config'

function AppContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-2)_0%,_transparent_70%)] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent-secondary-2)_0%,_transparent_70%)] opacity-30" />

        <div className="relative text-center space-y-8 max-w-md mx-auto px-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary mx-auto shadow-glow"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-primary/60 animate-pulse mx-auto"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary/10 to-transparent"></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gradient">AI Notes</h1>
              <p className="text-lg font-semibold text-foreground">Loading your workspace...</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Preparing your intelligent workspace with AI-powered features</p>
            <div className="w-full bg-border/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  // Will redirect to dashboard
  return null
}

export default function HomePage() {
  const [isApiInitialized, setIsApiInitialized] = useState(false)

  useEffect(() => {
    // Initialize the API client
    initializeApiClient()

    // Show offline mode notification if no backend is configured
    const hasBackend = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!hasBackend && process.env.NODE_ENV === 'development') {
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-2)_0%,_transparent_70%)] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent-secondary-2)_0%,_transparent_70%)] opacity-30" />

        <div className="relative text-center space-y-8 max-w-md mx-auto px-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary mx-auto shadow-glow"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-primary/60 animate-pulse mx-auto"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary/10 to-transparent"></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gradient">AI Notes</h1>
              <p className="text-lg font-semibold text-foreground">Initializing platform...</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Setting up your intelligent workspace</p>
            <div className="w-full bg-border/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" style={{width: '45%'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-2)_0%,_transparent_70%)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent-secondary-2)_0%,_transparent_70%)] opacity-20" />
      <AppContent />
    </div>
  )
}
