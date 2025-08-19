import { Dashboard } from '../../components/dashboard/Dashboard'
import { PageMeta } from '../../components/seo/PageMeta'

export const metadata = {
  title: 'Dashboard - AI Notes',
  description: 'Your AI-powered note-taking dashboard. Manage notes, access productivity tools, and enhance your workflow with intelligent features.',
  keywords: ['dashboard', 'notes management', 'productivity', 'AI assistant', 'workspace'],
  openGraph: {
    title: 'Dashboard - AI Notes',
    description: 'Your AI-powered note-taking dashboard with intelligent features and productivity tools.',
    type: 'website',
  },
}

export default function DashboardPage() {
  return (
    <>
      <PageMeta
        title="Dashboard"
        description="Your AI-powered note-taking dashboard. Manage notes, access productivity tools, and enhance your workflow with intelligent features."
        keywords={['dashboard', 'notes management', 'productivity', 'AI assistant', 'workspace']}
        type="website"
      />
      <main role="main" aria-label="AI Notes Dashboard" className="h-full">
        <Dashboard />
      </main>
    </>
  )
}
