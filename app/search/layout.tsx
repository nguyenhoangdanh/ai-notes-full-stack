'use client'

import { useAuth } from '../../contexts/AuthContext'
import { NotesProvider } from '../../contexts/NotesContext'
import { OfflineNotesProvider } from '../../contexts/OfflineNotesContext'
import { AppLayout } from '../../components/layout/AppLayout'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <>{children}</>
  return (
    <NotesProvider>
      <OfflineNotesProvider>
        <AppLayout>{children}</AppLayout>
      </OfflineNotesProvider>
    </NotesProvider>
  )
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}