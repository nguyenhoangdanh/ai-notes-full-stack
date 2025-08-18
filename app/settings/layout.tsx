'use client'

import { useAuth } from '../../contexts/AuthContext'
import { NotesProvider } from '../../contexts/NotesContext'
import { OfflineNotesProvider } from '../../contexts/OfflineNotesContext'
import { AppLayout } from '../../components/layout/AppLayout'

interface AppLayoutProps {
  children: React.ReactNode
}

function ProtectedLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <NotesProvider>
      <OfflineNotesProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </OfflineNotesProvider>
    </NotesProvider>
  )
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}