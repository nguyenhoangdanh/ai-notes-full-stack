import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Send, 
  Bot, 
  User, 
  Zap, 
  Wand2,
  FileText,
  X,
  Sparkle,
  RotateCcw
} from 'lucide-react'
import { useAI } from '../../contexts/AIContext'
import { useAuth } from '../../hooks/useAuth'
import { useNotes } from '../../contexts/NotesContext'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  noteContext?: {
    id: string
    title: string
  }
}

interface AIChatInterfaceProps {
  selectedNoteId?: string | null
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

const QUICK_PROMPTS = [
  { icon: Zap, text: "Summarize this note", prompt: "Please provide a concise summary of this note" },
  { icon: Wand2, text: "Improve writing", prompt: "Please help improve the writing style and clarity of this note" },
  { icon: FileText, text: "Create outline", prompt: "Create a structured outline based on this note's content" },
  { icon: Sparkle, text: "Generate ideas", prompt: "Generate related ideas and concepts based on this note" }
]

export function AIChatInterface({ 
  selectedNoteId, 
  isOpen = true, 
  onClose,
  className 
}: AIChatInterfaceProps) {
  const { user } = useAuth()
  const { notes, getNote } = useNotes()
  const { 
    activeConversation: currentConversation, 
    sendMessage: askAI, 
    createConversation, 
    deleteConversation,
    isProcessing: isLoading,
    startNewChat
  } = useAI()
  
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentNote = selectedNoteId ? getNote(selectedNoteId) : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Ensure we have a conversation
    if (!currentConversation) {
      await createConversation({
        title: currentNote ? `Chat about: ${currentNote.title}` : 'General Chat',
        noteId: currentNote?.id,
        context: currentNote ? [currentNote.id] : []
      })
    }

    setInput('')
    
    // Send message through AI context
    await askAI(content, currentNote ? [currentNote.id] : undefined)
  }

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const clearConversation = () => {
    if (currentConversation) {
      deleteConversation(currentConversation.id)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={cn(
        "flex flex-col h-full bg-card border-l border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            {currentNote && (
              <p className="text-xs text-muted-foreground truncate max-w-40">
                Working on: {currentNote.title}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentConversation && currentConversation.messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {(!currentConversation || currentConversation.messages.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 py-8"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">AI Assistant Ready</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentNote 
                    ? "Ask me anything about your current note or try a quick action below."
                    : "I'm here to help with your notes and productivity. What can I assist you with?"
                  }
                </p>
              </div>
              
              {/* Quick Actions */}
              {currentNote && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map((prompt, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleQuickPrompt(prompt.prompt)}
                        className="p-3 text-left rounded-lg border border-border bg-background hover:bg-muted transition-colors group"
                      >
                        <prompt.icon className="h-4 w-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-medium text-foreground">{prompt.text}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentConversation && currentConversation.messages.map((message, index) => (
            <motion.div
              key={message.id || `message-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-start space-x-3",
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gradient-to-br from-accent/20 to-primary/20 text-primary'
              )}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={cn(
                "flex-1 space-y-2",
                message.role === 'user' ? 'text-right' : ''
              )}>
                <Card className={cn(
                  "p-3 max-w-[85%] inline-block",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
                
                <div className={cn(
                  "flex items-center space-x-2 text-xs text-muted-foreground",
                  message.role === 'user' ? 'justify-end' : ''
                )}>
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.noteContext && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {message.noteContext.title}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 text-primary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="p-3 bg-muted">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">AI is thinking...</span>
                </div>
              </Card>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentNote ? "Ask about this note..." : "Ask me anything..."}
              disabled={isLoading}
              className="pr-12 resize-none"
            />
          </div>
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {currentNote && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <FileText className="h-3 w-3 mr-1" />
            <span>Context: {currentNote.title}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}