import { PageMeta } from '../../components/seo/PageMeta'

export const metadata = {
  title: 'Notes - AI Notes',
  description: 'Browse, search, and manage all your notes with AI-powered organization. Create, edit, and organize your thoughts efficiently.',
  keywords: ['notes', 'note taking', 'AI organization', 'search notes', 'productivity', 'knowledge management'],
  openGraph: {
    title: 'Notes - AI Notes',
    description: 'Browse, search, and manage all your notes with AI-powered organization.',
    type: 'website',
  },
}

export default function NotesPage() {
  return (
    <>
      <PageMeta
        title="Notes"
        description="Browse, search, and manage all your notes with AI-powered organization. Create, edit, and organize your thoughts efficiently."
        keywords={['notes', 'note taking', 'AI organization', 'search notes', 'productivity', 'knowledge management']}
        type="website"
      />
      <div role="main" aria-label="Notes management">
        <h1 className="text-3xl font-bold mb-6">Your Notes</h1>
        <p className="text-muted-foreground">
          Manage and organize your notes with AI-powered features.
        </p>
      </div>
    </>
  )
}
