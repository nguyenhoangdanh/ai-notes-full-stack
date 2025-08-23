'use client'

import { ProtectedLayout } from '../../components/layout/ProtectedLayout'

export default function ProtectedGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
