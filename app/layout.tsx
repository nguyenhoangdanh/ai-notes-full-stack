import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'AI Notes - Intelligent Note Taking',
    template: '%s | AI Notes'
  },
  description: 'AI-powered note taking with offline capabilities, semantic search, and intelligent organization.',
  keywords: ['notes', 'AI', 'productivity', 'organization', 'offline', 'semantic search'],
  authors: [{ name: 'AI Notes Team' }],
  creator: 'AI Notes',
  publisher: 'AI Notes',
  metadataBase: new URL('http://localhost:5000'),
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:5000',
    title: 'AI Notes - Intelligent Note Taking',
    description: 'AI-powered note taking with offline capabilities',
    siteName: 'AI Notes',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'AI Notes Logo',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'AI Notes - Intelligent Note Taking',
    description: 'AI-powered note taking with offline capabilities',
    images: ['/icon-512.png'],
  },
  
  // PWA
  manifest: '/manifest.json',
  
  // Icons
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  
  // Theme
  themeColor: '#7c3aed',
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
  },
  
  // Other
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}