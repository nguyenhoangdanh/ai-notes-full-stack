import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Relations - AI Notes',
  description: 'Visualize and manage note relationships and connections',
}

export default function RelationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
 return <ProtectedLayout>{children}</ProtectedLayout>
}