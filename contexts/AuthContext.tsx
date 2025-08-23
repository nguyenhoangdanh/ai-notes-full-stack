import React, { createContext, useContext, useEffect } from 'react'
import { getAuthToken, setAuthToken, clearAuthToken } from '../lib/api-config'
import { authService } from '../services/auth.service'
import { useAuth as useAuthHook } from '../hooks/use-auth'
import type { User, LoginDto, RegisterDto } from '../types/auth.types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: LoginDto) => void
  register: (data: RegisterDto) => void
  logout: () => void
  googleLogin: () => void
  isRegistering: boolean
  isLoggingIn: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)


// Auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook()

  // Check for existing token on mount and when auth state changes
  useEffect(() => {
    const token = getAuthToken()
    if (token && !auth.user && !auth.isLoading) {
      // Verify the token - this will trigger the profile query
      auth.verifyToken()
    }
  }, [auth.user, auth.isLoading, auth.verifyToken]) // Added verifyToken dependency

  // Handle OAuth callback
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      setAuthToken(token)
      auth.verifyToken()
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const value: AuthContextType = {
    user: auth.user || null,
    isLoading: auth.isLoading,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    googleLogin: auth.googleLogin,
    isRegistering: auth.isRegistering,
    isLoggingIn: auth.isLoggingIn,
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

export { AuthProvider }
