import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - AI Notes',
  description: 'Sign in or register for AI Notes - your intelligent note-taking companion',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth pages don't need the ProtectedLayout wrapper
  // since users are not authenticated yet
  return <>{children}</>
}
