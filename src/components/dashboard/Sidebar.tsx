import { useAuth } from '../../hooks/use-auth'
import { useNotes } from '../../contexts/NotesContext'
import { SearchBar } from './SearchBar'
import { UserMenu } from '../header/UserMenu'
import { ThemeToggle } from '../common/ThemeToggle'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import {
  Brain,
  LogOut,
  Tag,
  Calendar,
  FolderOpen,
  Sparkle,
  X,
  Settings
} from 'lucide-react'
import { useIsMobile } from '../../hooks/use-mobile'

interface SidebarProps {
  onClose?: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Sidebar({ onClose, searchQuery, onSearchChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const { notes } = useNotes()
  const isMobile = useIsMobile()

  // Get unique tags from all notes
  const primaryTags = Array.from(new Set(notes.map(note => note.tags[0]).filter(Boolean)))
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))
  const categories = allTags // Categories are represented by tags

  const getTagCount = (tag: string) => {
    return notes.filter(note => note.tags.includes(tag)).length
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="h-6 w-6 text-primary" />
              <Sparkle className="h-3 w-3 text-accent absolute -top-0.5 -right-0.5" />
            </div>
            <span className="font-semibold text-foreground">AI Notes</span>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isMobile && onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isMobile && (
          <SearchBar 
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search notes..."
            className="mb-4"
          />
        )}

        {/* User Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{notes.length}</div>
            <div className="text-xs text-muted-foreground">Total Notes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{categories.length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Categories */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Categories</h3>
          </div>
          <div className="space-y-2">
            {primaryTags.length > 0 ? (
              primaryTags.map(tag => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <span className="text-sm text-foreground capitalize">{tag}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getTagCount(tag)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags yet</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.length > 0 ? (
              allTags.slice(0, 20).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-secondary"
                >
                  {tag} ({getTagCount(tag)})
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags yet</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Recent Activity */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Recent</h3>
          </div>
          <div className="space-y-2">
            {notes
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map(note => (
                <div
                  key={note.id}
                  className="p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {note.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            AI Notes v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
