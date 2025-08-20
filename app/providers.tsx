'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'
import { useState, useEffect } from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import { AIProvider } from '../contexts/AIContext'
import { NotesProvider } from '../contexts/NotesContext'
import { ErrorFallback } from '../ErrorFallback'
import { DemoModeIndicator } from '../components/common/DemoModeIndicator'
import { initializeApiClient } from '../lib/api-config'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 1
            },
          },
        },
      })
  )

  // Initialize API client early
  useEffect(() => {
    initializeApiClient()
  }, [])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange={false}
          themes={['light', 'dark', 'system']}
          storageKey="ai-notes-theme"
        >
          <AuthProvider>
            <NotesProvider>
              <AIProvider>
                {children}
                <DemoModeIndicator />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className: "glass border border-border-subtle shadow-3",
                    style: {
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border-subtle)',
                    },
                  }}
                  theme="system"
                />
              </AIProvider>
            </NotesProvider>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-left"
          panelProps={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
