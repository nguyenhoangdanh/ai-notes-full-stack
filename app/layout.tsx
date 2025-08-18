import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { SkipLinks } from '../components/accessibility/A11y'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  title: {
    default: 'AI Notes - Intelligent Note Taking & Productivity Platform',
    template: '%s | AI Notes'
  },
  description: 'Transform your productivity with AI-powered note taking. Features offline capabilities, semantic search, intelligent organization, collaboration tools, and advanced analytics for modern professionals.',
  keywords: [
    'AI notes', 'intelligent note taking', 'productivity platform',
    'semantic search', 'offline notes', 'collaboration',
    'knowledge management', 'digital workspace', 'smart organization',
    'voice notes', 'mobile notes', 'note templates', 'task management'
  ],
  authors: [{ name: 'AI Notes Team', url: 'https://ainotes.app' }],
  creator: 'AI Notes',
  publisher: 'AI Notes',
  category: 'productivity',
  classification: 'productivity software',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'),

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Notes - Intelligent Note Taking & Productivity Platform',
    description: 'Transform your productivity with AI-powered note taking, semantic search, and intelligent organization.',
    siteName: 'AI Notes',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Notes - Intelligent Note Taking Platform',
        type: 'image/png',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@ainotes',
    creator: '@ainotes',
    title: 'AI Notes - Intelligent Note Taking Platform',
    description: 'Transform your productivity with AI-powered note taking and smart organization.',
    images: ['/twitter-image.png'],
  },

  // App metadata
  applicationName: 'AI Notes',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Notes',
  },

  // PWA
  manifest: '/manifest.json',

  // Icons
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },

  // Other
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Additional SEO
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="//api.ainotes.app" />
      </head>
      <body className="h-full font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <SkipLinks />
        <div id="root" className="h-full">
          <div id="spark-app" className="h-full">
            <Providers>
              {children}
            </Providers>
          </div>
        </div>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'AI Notes',
              description: 'AI-powered note taking and productivity platform',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              author: {
                '@type': 'Organization',
                name: 'AI Notes Team',
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
