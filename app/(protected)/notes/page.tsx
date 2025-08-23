
import ProtectedGroupLayout from '../layout'
import NotesClient from './NotesClient'

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
    <ProtectedGroupLayout>
      <NotesClient />
    </ProtectedGroupLayout>
  )
}
  //     <PageMeta
  //       title="Notes"
  //       description="Browse, search, and manage all your notes with AI-powered organization. Create, edit, and organize your thoughts efficiently."
  //       keywords={['notes', 'note taking', 'AI organization', 'search notes', 'productivity', 'knowledge management']}
  //       type="website"
  //     />
  //     <NotesClient />
  //   </>
