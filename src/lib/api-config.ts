import { createApiClient, HTTPError } from './api-client'
import { toast } from 'sonner'

// Get token from localStorage or context
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ai-notes-token')
}

// Handle API errors globally
function handleApiError(error: HTTPError): void {
  console.error('API Error:', error)
  
  // Handle specific error cases
  switch (error.status) {
    case 401:
      // Unauthorized - redirect to login
      localStorage.removeItem('ai-notes-token')
      window.location.href = '/login'
      break
      
    case 403:
      toast.error('You do not have permission to perform this action')
      break
      
    case 404:
      toast.error('The requested resource was not found')
      break
      
    case 429:
      toast.error('Too many requests. Please try again later.')
      break
      
    case 500:
      toast.error('Server error. Please try again later.')
      break
      
    default:
      if (error.response?.message) {
        toast.error(error.response.message)
      } else if (error.isNetworkError) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('An unexpected error occurred')
      }
  }
}

// Initialize the API client
export function initializeApiClient() {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
  
  return createApiClient({
    baseURL,
    timeout: 30000, // 30 seconds
    getToken: getAuthToken,
    onError: handleApiError,
  })
}

// Export utility functions for token management
export const tokenUtils = {
  getToken: getAuthToken,
  
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-notes-token', token)
    }
  },
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-notes-token')
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!getAuthToken()
  },
}

// Initialize on import
export const apiClient = initializeApiClient()