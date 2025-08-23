import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '../stores/auth.store'
import type { User, LoginDto, RegisterDto } from '../types/auth.types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => Promise<void>
  demoLogin: () => Promise<void>
  isRegistering: boolean
  isLoggingIn: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isLoading,
    isAuthenticated,
    isRegistering,
    isLoggingIn,
    login,
    register,
    logout,
    googleLogin,
    demoLogin,
    checkAuth
  } = useAuthStore()

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Handle OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      // Set token and verify
      const { setAuthToken } = require('../lib/api-config')
      setAuthToken(token)
      
      // Verify the token to get user data
      const { verifyToken } = useAuthStore.getState()
      verifyToken()
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    googleLogin,
    demoLogin,
    isRegistering,
    isLoggingIn,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
