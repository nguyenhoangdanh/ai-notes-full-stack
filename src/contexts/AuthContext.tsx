import React, { createContext, useContext, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useKV } from '@github/spark/hooks'
import { tokenUtils } from '../lib/api-config'
import { useAuthProfile, useLogin, useRegister, useLogout } from '../hooks'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync token with API client
  useEffect(() => {
    if (token) {
      tokenUtils.setToken(token)
    } else {
      tokenUtils.removeToken()
    }
    setIsInitialized(true)
  }, [token])

  const { 
    data: user, 
    isLoading: isProfileLoading,
    error: profileError 
  } = useAuthProfile()

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()

  // Clear token if profile fetch fails with auth error
  useEffect(() => {
    if (profileError && (profileError as any)?.status === 401) {
      setToken(null)
    }
  }, [profileError, setToken])

  const login = async (email: string, password: string) => {
    const response = await loginMutation.mutateAsync({ email, password })
    setToken(response.access_token)
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await registerMutation.mutateAsync({ email, password, name })
    setToken(response.access_token)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
    setToken(null)
  }

  const isLoading = !isInitialized || 
    (!!token && isProfileLoading) || 
    loginMutation.isPending || 
    registerMutation.isPending ||
    logoutMutation.isPending

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export query client for use in other hooks
export { queryClient }