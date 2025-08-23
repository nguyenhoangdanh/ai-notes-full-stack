import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categories - AI Notes',
  description: 'Manage note categories and organization',
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
return <ProtectedLayout>{children}</ProtectedLayout>
}