'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { AuthScreen } from '../components/auth/AuthScreen'
import { toast } from 'sonner'
import { initializeApiClient } from '../lib/api-config'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/button'

function LoadingScreen({ title, description, progress }: { 
  title: string
  description: string 
  progress: number 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse animation-delay-2000" />
      </div>

      <div className="relative text-center space-y-8 max-w-md mx-auto px-6 z-10">
        {/* Loading spinner */}
        <div className="relative mx-auto">
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent-secondary/60 animate-spin animation-delay-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-accent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-accent-secondary to-accent bg-clip-text text-transparent">
              AI Notes
            </h1>
            <p className="text-xl font-semibold text-foreground">{title}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-border/20 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      </div>
    </div>
  )
}

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
      <LoadingScreen 
        title="Loading your workspace..."
        description="Preparing your intelligent workspace with AI-powered features"
        progress={75}
      />
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
  const [initProgress, setInitProgress] = useState(0)

  useEffect(() => {
    // Simulate initialization progress
    const progressSteps = [
      { progress: 20, delay: 200 },
      { progress: 45, delay: 400 },
      { progress: 70, delay: 600 },
      { progress: 100, delay: 800 },
    ]

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => setInitProgress(progress), delay)
    })

    // Initialize the API client
    setTimeout(() => {
      initializeApiClient()

      // Show offline mode notification if no backend is configured
      const hasBackend = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!hasBackend && process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          toast.info('Running in offline mode - all data is stored locally', {
            duration: 5000,
            description: 'Connect a backend server to enable sync across devices',
            action: {
              label: 'Learn more',
              onClick: () => window.open('/docs/offline-mode', '_blank')
            }
          })
        }, 2000)
      }

      setIsApiInitialized(true)
    }, 1000)
  }, [])

  if (!isApiInitialized) {
    return (
      <LoadingScreen 
        title="Initializing platform..."
        description="Setting up your intelligent workspace and connecting services"
        progress={initProgress}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-1000" />
      </div>
      
      <div className="relative z-10">
        <AppContent />
      </div>
    </div>
  )
}
