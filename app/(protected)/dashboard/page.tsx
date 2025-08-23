import { Dashboard } from '../../components/dashboard/Dashboard'
import { PageMeta } from '../../components/seo/PageMeta'

export const metadata = {
  title: 'Dashboard - AI Notes',
  description: 'Your AI-powered productivity dashboard. Manage notes, track progress, access intelligent features, and collaborate with advanced analytics and insights.',
  keywords: [
    'AI dashboard', 'note management', 'productivity tools', 'intelligent workspace', 
    'analytics', 'collaboration', 'smart organization', 'workflow optimization'
  ],
  openGraph: {
    title: 'AI Notes Dashboard - Intelligent Productivity Hub',
    description: 'Transform your productivity with AI-powered note management, advanced analytics, and intelligent workspace features.',
    type: 'website',
    images: [
      {
        url: '/og-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'AI Notes Dashboard - Intelligent Productivity Hub',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Notes Dashboard - Intelligent Productivity Hub',
    description: 'Transform your productivity with AI-powered note management and intelligent features.',
    images: ['/twitter-dashboard.png'],
  },
}

export default function DashboardPage() {
  return (
    <>
      <PageMeta
        title="Dashboard"
        description="Your AI-powered productivity dashboard with intelligent note management, advanced analytics, and collaborative features for enhanced workflow optimization."
        keywords={[
          'AI dashboard', 'smart notes', 'productivity hub', 'intelligent workspace',
          'collaboration tools', 'workflow analytics', 'note organization', 'AI insights'
        ]}
        type="website"
      />
      <main role="main" aria-label="AI Notes Dashboard - Productivity Hub" className="h-full">
        <Dashboard />
      </main>
    </>
  )
}
