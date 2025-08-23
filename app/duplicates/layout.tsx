import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Duplicates - AI Notes',
  description: 'Detect and manage duplicate notes using AI analysis',
}

export default function DuplicatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
 return <ProtectedLayout>{children}</ProtectedLayout>
}