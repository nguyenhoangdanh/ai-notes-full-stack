'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { AuthScreen } from '../../components/auth/AuthScreen'

export default function AuthPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !isLoading) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-text-muted">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show auth screen for non-authenticated users
  if (!user) {
    return <AuthScreen />
  }

  // This shouldn't render but just in case
  return null
}
