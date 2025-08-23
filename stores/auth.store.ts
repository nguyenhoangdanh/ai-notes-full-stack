import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '../services/auth.service'
import { demoModeService } from '../services/demo.service'
import { setAuthToken, clearAuthToken, getAuthToken } from '../lib/api-config'
import type { User, LoginDto, RegisterDto, AuthResponseDto } from '../types/auth.types'
import { toast } from 'sonner'

interface AuthState {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isRegistering: boolean
  isLoggingIn: boolean
  
  // Actions
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => Promise<void>
  demoLogin: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  verifyToken: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isRegistering: false,
      isLoggingIn: false,

      // Set user
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false
        })
      },

      // Set loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Login
      login: async (data: LoginDto) => {
        set({ isLoggingIn: true, isLoading: true })
        
        try {
          const response: AuthResponseDto = await authService.login(data)
          
          // Set auth token
          setAuthToken(response.access_token)
          
          // Update state
          set({
            user: response.user,
            isAuthenticated: true,
            isLoggingIn: false,
            isLoading: false
          })
          
          toast.success('Logged in successfully!')
        } catch (error: any) {
          set({ isLoggingIn: false, isLoading: false })
          const message = error?.response?.data?.message || error?.message || 'Login failed'
          toast.error(message)
          throw error
        }
      },

      // Register
      register: async (data: RegisterDto) => {
        set({ isRegistering: true, isLoading: true })
        
        try {
          const response: AuthResponseDto = await authService.register(data)
          
          // Set auth token
          setAuthToken(response.access_token)
          
          // Update state
          set({
            user: response.user,
            isAuthenticated: true,
            isRegistering: false,
            isLoading: false
          })
          
          toast.success('Account created successfully!')
        } catch (error: any) {
          set({ isRegistering: false, isLoading: false })
          const message = error?.response?.data?.message || error?.message || 'Registration failed'
          toast.error(message)
          throw error
        }
      },

      // Demo login
      demoLogin: async () => {
        set({ isLoading: true })
        
        try {
          demoModeService.setDemoMode(true)
          const response: AuthResponseDto = await authService.demoLogin()
          
          // Update state
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success('Welcome to AI Notes Demo! 🎉', {
            description: 'Explore all features with sample data. Changes won\'t be saved permanently.'
          })
        } catch (error: any) {
          set({ isLoading: false })
          const message = error?.message || 'Demo mode failed to initialize'
          toast.error(message)
          throw error
        }
      },

      // Google login
      googleLogin: async () => {
        try {
          await authService.googleLogin()
        } catch (error: any) {
          const message = error?.message || 'Google login failed'
          toast.error(message)
          throw error
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
        } catch (error) {
          console.warn('Server logout failed, proceeding with client-side cleanup:', error)
        } finally {
          // Clear client-side state regardless of server response
          clearAuthToken()
          demoModeService.setDemoMode(false)
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isRegistering: false,
            isLoggingIn: false
          })
          
          toast.success('Logged out successfully')
        }
      },

      // Verify token
      verifyToken: async () => {
        const token = getAuthToken()
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
          return
        }

        set({ isLoading: true })
        
        try {
          const response = await authService.verifyToken()
          
          if (response.valid && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            clearAuthToken()
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          clearAuthToken()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      // Check authentication on app start
      checkAuth: async () => {
        const token = getAuthToken()
        
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
          return
        }

        // If demo mode is enabled, get demo user
        if (demoModeService.isDemoMode()) {
          const demoUser = demoModeService.getDemoUser()
          set({
            user: demoUser,
            isAuthenticated: true,
            isLoading: false
          })
          return
        }

        // Otherwise verify token
        await get().verifyToken()
      }
    }),
    {
      name: 'ai-notes-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
