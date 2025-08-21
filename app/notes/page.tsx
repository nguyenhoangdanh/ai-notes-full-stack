import { PageMeta } from '../../components/seo/PageMeta'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/Badge'
import { Separator } from '../../components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen, 
  Calendar, 
  Tag, 
  Sparkles,
  Clock,
  Star,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
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
    <>
      <PageMeta
        title="Notes"
        description="Browse, search, and manage all your notes with AI-powered organization. Create, edit, and organize your thoughts efficiently."
        keywords={['notes', 'note taking', 'AI organization', 'search notes', 'productivity', 'knowledge management']}
        type="website"
      />
      <NotesClient />
    </>
  )
}
