import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Summaries - AI Notes',
  description: 'Manage note summaries and AI-generated content',
}

export default function SummariesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
