import { Dashboard } from '../../components/dashboard/Dashboard'
import { PageMeta } from '../../components/seo/PageMeta'

export const metadata = {
  title: 'Dashboard - AI Notes',
  description: 'Your AI-powered productivity dashboard. Manage notes, track progress, access intelligent features, and collaborate with advanced analytics and insights.',
  keywords: [
    'AI dashboard', 'note management', 'productivity tools', 'intelligent workspace', 
    'analytics', 'collaboration', 'smart organization', 'workflow optimization',
    'note taking', 'AI assistant', 'knowledge management', 'digital workspace'
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
  alternates: {
    canonical: '/dashboard',
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
          'collaboration tools', 'workflow analytics', 'note organization', 'AI insights',
          'task management', 'knowledge base', 'digital productivity', 'smart workspace'
        ]}
        type="website"
        structuredData={{
          '@type': 'WebApplication',
          name: 'AI Notes Dashboard',
          description: 'AI-powered productivity dashboard for intelligent note management',
          applicationCategory: 'ProductivityApplication',
          operatingSystem: 'Web Browser',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          permissions: 'Read/write access to notes and workspace data',
          featureList: [
            'AI-powered note organization',
            'Advanced analytics and insights',
            'Collaborative workspace features',
            'Smart search and categorization',
            'Real-time synchronization',
            'Offline capability'
          ]
        }}
      />
      <main 
        role="main" 
        aria-label="AI Notes Dashboard - Productivity Hub" 
        className="h-full"
        itemScope 
        itemType="https://schema.org/WebApplication"
      >
        <meta itemProp="name" content="AI Notes Dashboard" />
        <meta itemProp="description" content="AI-powered productivity dashboard for intelligent note management" />
        <meta itemProp="applicationCategory" content="ProductivityApplication" />
        
        <div className="h-full relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-elevated to-brand-50/20 pointer-events-none" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
          
          {/* Main Dashboard Content */}
          <div className="relative z-10 h-full">
            <Dashboard />
          </div>
        </div>
      </main>
    </>
  )
}
