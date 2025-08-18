import React, { createContext, useContext, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getAuthToken, setAuthToken, clearAuthToken } from '../lib/api-config'
import { authService } from '../services/auth.service'
import { useAuth as useAuthHook } from '../hooks/useAuth'
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

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

// Auth provider component that uses React Query
function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook()

  // Check for existing token on mount
  useEffect(() => {
    const token = getAuthToken()
    if (token && !auth.user) {
      // Verify the token
      auth.verifyToken()
    }
  }, [])

  // Handle OAuth callback
  useEffect(() => {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export query client for use in other hooks
export { queryClient }