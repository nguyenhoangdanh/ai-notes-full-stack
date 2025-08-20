import { PageMeta } from '../../components/seo/PageMeta'
import NotesClient from './NotesClient'

export const metadata = {
  title: 'Notes - AI Notes',
  description: 'Browse, search, and manage all your notes with AI-powered organization. Create, edit, and organize your thoughts efficiently with intelligent categorization and semantic search.',
  keywords: [
    'notes', 'note taking', 'AI organization', 'search notes', 'productivity', 
    'knowledge management', 'smart notes', 'intelligent search', 'note organization',
    'digital notes', 'cloud notes', 'collaborative notes', 'note sharing'
  ],
  openGraph: {
    title: 'Notes - AI Notes | Intelligent Note Management',
    description: 'Browse, search, and manage all your notes with AI-powered organization and smart categorization.',
    type: 'website',
    images: [
      {
        url: '/og-notes.png',
        width: 1200,
        height: 630,
        alt: 'AI Notes - Intelligent Note Management',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notes - AI Notes | Intelligent Note Management',
    description: 'Browse, search, and manage notes with AI-powered organization.',
    images: ['/twitter-notes.png'],
  },
  alternates: {
    canonical: '/notes',
  },
}

export default function NotesPage() {
  return (
    <>
      <PageMeta
        title="Notes"
        description="Browse, search, and manage all your notes with AI-powered organization. Create, edit, and organize your thoughts efficiently with intelligent categorization, semantic search, and collaborative features."
        keywords={[
          'notes', 'note taking', 'AI organization', 'search notes', 'productivity', 
          'knowledge management', 'smart notes', 'intelligent search', 'note organization',
          'digital workspace', 'collaborative editing', 'note synchronization', 'offline notes'
        ]}
        type="website"
        structuredData={{
          '@type': 'CollectionPage',
          name: 'Notes Collection',
          description: 'AI-powered note management and organization system',
          hasPart: {
            '@type': 'WebPageElement',
            name: 'Note List',
            description: 'Collection of user notes with AI-powered search and organization'
          }
        }}
      />
      <main 
        role="main" 
        aria-label="Notes Management - Browse and organize your notes"
        className="h-full"
        itemScope 
        itemType="https://schema.org/CollectionPage"
      >
        <meta itemProp="name" content="Notes Collection" />
        <meta itemProp="description" content="AI-powered note management and organization system" />
        
        <div className="h-full relative">
          {/* Modern background */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-surface to-brand-50/10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-100)_0%,_transparent_50%)] pointer-events-none opacity-30" />
          
          {/* Notes content */}
          <div className="relative z-10 h-full">
            <NotesClient />
          </div>
        </div>
      </main>
    </>
  )
}
