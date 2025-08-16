import React, { createContext, useContext, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useKV } from '@github/spark/hooks'
import { tokenUtils } from '../lib/api-config'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
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
  const [token, setToken] = useKV('auth-token', null)
  const [user, setUser] = useKV('current-user', null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync token with API client
  useEffect(() => {
    try {
      if (token) {
        tokenUtils.setToken(token)
      } else {
        tokenUtils.removeToken()
      }
    } catch (error) {
      console.error('Error syncing token:', error)
    }
    setIsInitialized(true)
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual login with backend
      const mockUser: User = { 
        id: '1', 
        email, 
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setToken('mock-token')
      setUser(mockUser)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      // TODO: Implement actual register with backend
      const mockUser: User = { 
        id: '1', 
        email, 
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setToken('mock-token')
      setUser(mockUser)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      setToken(null)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isLoading = !isInitialized

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    login,
    register,
    logout
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