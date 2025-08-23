'use client'

import { ProtectedLayout } from '../../components/layout/ProtectedLayout'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
