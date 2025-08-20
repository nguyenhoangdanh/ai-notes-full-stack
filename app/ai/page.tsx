'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Search,
  FileText,
  Zap,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'
import { PageMeta } from '../../components/seo/PageMeta'
import { useStreamChat, useCompleteChat, useGenerateSuggestion, useSemanticSearch } from '../../hooks/use-ai'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Suggestion {
  id: string
  title: string
  content: string
  type: 'writing' | 'research' | 'organization'
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [conversationId] = useState(() => `conv-${Date.now()}`) // Generate a conversation ID

  const streamChat = useStreamChat()
  const completeChat = useCompleteChat()
  const generateSuggestion = useGenerateSuggestion()
  const semanticSearch = useSemanticSearch()

  // Sample suggestions for better UX
  const suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Summarize my notes',
      content: 'Create a comprehensive summary of all my notes from the past week',
      type: 'organization'
    },
    {
      id: '2', 
      title: 'Writing assistance',
      content: 'Help me improve the writing style and clarity of my latest note',
      type: 'writing'
    },
    {
      id: '3',
      title: 'Research ideas',
      content: 'Suggest related topics I should research based on my existing notes',
      type: 'research'
    }
  ]

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    try {
      // Use complete chat for now (streaming can be implemented later)
      const response = await completeChat.mutateAsync({
        conversationId,
        message: input.trim()
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.content)
    setSelectedSuggestion(suggestion.id)
  }

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const results = await semanticSearch.mutateAsync({
        query: searchQuery,
        limit: 5
      })
      
      toast.success(`Found ${results?.length || 0} semantically related notes`)
      
      // Add search results as a message
      const searchMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I found ${results?.length || 0} notes related to "${searchQuery}". These notes have semantic similarity to your search query.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, searchMessage])
    } catch (error) {
      toast.error('Failed to perform semantic search')
    }
  }

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const clearChat = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  return (
    <>
      <PageMeta
        title="AI Assistant"
        description="Enhance your productivity with AI-powered features. Get intelligent suggestions, automated summaries, and smart content generation."
        keywords={['AI assistant', 'artificial intelligence', 'smart suggestions', 'content generation', 'productivity', 'automation']}
        type="website"
      />
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">AI Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    Enhance your productivity with intelligent features
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearChat}
                  disabled={messages.length === 0}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
                    <p className="text-muted-foreground mb-6">
                      Ask me anything about your notes, get writing help, or explore your knowledge base.
                    </p>
                    
                    {/* Quick suggestions */}
                    <div className="grid gap-3 max-w-lg mx-auto">
                      {suggestions.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          className="justify-start text-left h-auto p-4"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1 rounded bg-primary/10 flex-shrink-0">
                              {suggestion.type === 'writing' && <FileText className="h-3 w-3 text-primary" />}
                              {suggestion.type === 'research' && <Search className="h-3 w-3 text-primary" />}
                              {suggestion.type === 'organization' && <Zap className="h-3 w-3 text-primary" />}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{suggestion.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {suggestion.content}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "max-w-[80%] rounded-lg p-3 relative group",
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        )}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className={cn(
                              "text-xs opacity-70",
                              message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                            )}>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0",
                                message.role === 'user' ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''
                              )}
                              onClick={() => copyToClipboard(message.content, message.id)}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Streaming indicator */}
                    {isStreaming && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce animation-delay-100" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce animation-delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-card/50 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about your notes..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isStreaming}
                      className="pr-12"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge variant="secondary" className="text-xs">
                        {input.length}/1000
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isStreaming}
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-card/30 backdrop-blur-sm p-4 space-y-6">
            {/* Semantic Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Semantic Search
                </CardTitle>
                <CardDescription className="text-xs">
                  Find related notes using AI understanding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search concepts..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSemanticSearch()
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleSemanticSearch}
                    disabled={!searchQuery.trim() || semanticSearch.isPending}
                  >
                    {semanticSearch.isPending ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant={selectedSuggestion === suggestion.id ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start h-auto text-left p-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'writing' && <FileText className="h-3 w-3" />}
                      {suggestion.type === 'research' && <Search className="h-3 w-3" />}
                      {suggestion.type === 'organization' && <Zap className="h-3 w-3" />}
                      <span className="text-xs font-medium">{suggestion.title}</span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span>GPT-4 Turbo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages:</span>
                    <span>{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={isStreaming ? "default" : "secondary"} className="text-xs">
                      {isStreaming ? "Processing" : "Ready"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
