import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { ScrollArea } from '../ui/scroll-area'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { 
  Clock, 
  MessageCircle, 
  Search,
  Trash,
  FileText,
  Filter,
  Calendar,
  Bot,
  User
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface ChatConversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  noteContext?: {
    id: string
    title: string
  }
  tags: string[]
}

interface AIChatHistoryProps {
  onSelectConversation: (conversationId: string) => void
  selectedConversationId?: string
  className?: string
}

export function AIChatHistory({ 
  onSelectConversation, 
  selectedConversationId,
  className 
}: AIChatHistoryProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'note-related' | 'general'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'most-messages'>('recent')

  // Mock conversations for demo (in real app, this would come from backend)
  useEffect(() => {
    if (conversations.length === 0) {
      const mockConversations: ChatConversation[] = [
        {
          id: 'conv-1',
          title: 'Project Planning Ideas',
          lastMessage: 'Great suggestions for organizing the project timeline!',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          messageCount: 12,
          noteContext: {
            id: 'note-1',
            title: 'Project Roadmap 2024'
          },
          tags: ['planning', 'project-management']
        },
        {
          id: 'conv-2',
          title: 'Writing Improvement Session',
          lastMessage: 'The revised introduction flows much better now.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          messageCount: 8,
          noteContext: {
            id: 'note-2',
            title: 'Blog Post Draft'
          },
          tags: ['writing', 'content']
        },
        {
          id: 'conv-3',
          title: 'Research Questions',
          lastMessage: 'Here are some additional research directions to explore...',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          messageCount: 15,
          tags: ['research', 'exploration']
        }
      ]
      setConversations(mockConversations)
    }
  }, [])

  const filteredAndSortedConversations = conversations
    .filter(conv => {
      const matchesSearch = !searchQuery || 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'note-related' && conv.noteContext) ||
        (filterBy === 'general' && !conv.noteContext)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime()
        case 'most-messages':
          return b.messageCount - a.messageCount
        default:
          return 0
      }
    })

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    toast.success('Conversation deleted')
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Chat History</h3>
          <Badge variant="secondary" className="text-xs">
            {conversations.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mb-2">
          <Button
            variant={filterBy === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('all')}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filterBy === 'note-related' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('note-related')}
            className="text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            Notes
          </Button>
          <Button
            variant={filterBy === 'general' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterBy('general')}
            className="text-xs"
          >
            General
          </Button>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('recent')}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Recent
          </Button>
          <Button
            variant={sortBy === 'most-messages' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('most-messages')}
            className="text-xs"
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {filteredAndSortedConversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">No conversations found</h4>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start a conversation with the AI assistant'}
                  </p>
                </div>
              </motion.div>
            ) : (
              filteredAndSortedConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "group cursor-pointer",
                    selectedConversationId === conversation.id && "ring-2 ring-primary/50 rounded-lg"
                  )}
                >
                  <Card className={cn(
                    "p-3 hover:shadow-sm transition-all duration-200",
                    selectedConversationId === conversation.id 
                      ? "bg-primary/5 border-primary/20" 
                      : "hover:bg-muted/30"
                  )}>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                        {conversation.noteContext ? (
                          <FileText className="h-4 w-4 text-primary" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {conversation.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteConversation(conversation.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 h-auto transition-opacity"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {conversation.lastMessage}
                        </p>

                        {conversation.noteContext && (
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {conversation.noteContext.title}
                            </Badge>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{conversation.messageCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(conversation.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        {conversation.tags.length > 0 && (
                          <div className="flex items-center space-x-1 flex-wrap">
                            {conversation.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {conversation.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{conversation.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash className="h-3 w-3 mr-1" />
            Clear all history
          </Button>
        </div>
      </div>
    </div>
  )
}
