import { createContext, useContext, useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  noteContext?: {
    id: string
    title: string
  }
}

interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  noteContext?: {
    id: string
    title: string
  }
  createdAt: Date
  updatedAt: Date
}

interface AIContextType {
  // Conversations
  conversations: AIConversation[]
  currentConversation: AIConversation | null
  createConversation: (noteId?: string, title?: string) => AIConversation
  selectConversation: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  
  // Messages
  sendMessage: (content: string, noteContext?: { id: string; title: string }) => Promise<void>
  isLoading: boolean
  
  // AI Features
  generateSuggestions: (noteId: string, content: string) => Promise<any[]>
  summarizeNote: (noteId: string, content: string) => Promise<string>
  improveWriting: (content: string) => Promise<string>
  
  // Settings
  aiModel: string
  setAIModel: (model: string) => void
  autoSuggest: boolean
  setAutoSuggest: (enabled: boolean) => void
}

const AIContext = createContext<AIContextType | null>(null)

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

interface AIProviderProps {
  children: React.ReactNode
}

export function AIProvider({ children }: AIProviderProps) {
  const [conversations, setConversations] = useKV<AIConversation[]>('ai-conversations', [])
  const [currentConversationId, setCurrentConversationId] = useKV<string | null>('ai-current-conversation', null)
  const [aiModel, setAIModel] = useKV<string>('ai-model', 'gpt-4o')
  const [autoSuggest, setAutoSuggest] = useKV<boolean>('ai-auto-suggest', true)
  const [isLoading, setIsLoading] = useState(false)

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null

  const createConversation = useCallback((noteId?: string, title?: string): AIConversation => {
    const newConversation: AIConversation = {
      id: `conv-${Date.now()}`,
      title: title || 'New Conversation',
      messages: [],
      noteContext: noteId ? { id: noteId, title: title || 'Untitled Note' } : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    
    return newConversation
  }, [setConversations, setCurrentConversationId])

  const selectConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId)
  }, [setCurrentConversationId])

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null)
    }
    
    toast.success('Conversation deleted')
  }, [conversations, currentConversationId, setConversations, setCurrentConversationId])

  const sendMessage = useCallback(async (
    content: string, 
    noteContext?: { id: string; title: string }
  ) => {
    if (!content.trim()) return

    let conversation = currentConversation
    
    // Create conversation if none exists
    if (!conversation) {
      conversation = createConversation(noteContext?.id, noteContext?.title)
    }

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      noteContext
    }

    // Add user message
    setConversations(prev => prev.map(c => 
      c.id === conversation!.id 
        ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date() }
        : c
    ))

    setIsLoading(true)

    try {
      // Build AI prompt
      let prompt = content.trim()
      
      if (noteContext) {
        prompt = spark.llmPrompt`
Context: I'm working with a note titled "${noteContext.title}" in my AI Notes application.

User Request: ${content.trim()}

Please provide a helpful response. You can assist with:
- Analyzing and improving note content
- Generating summaries and outlines
- Suggesting related topics
- Writing assistance
- Note organization tips

Be concise but thorough in your response.
        `
      } else {
        prompt = spark.llmPrompt`
You are an AI assistant for note-taking and knowledge management.

User Request: ${content.trim()}

Provide helpful assistance with:
- Note organization and writing
- Content creation and editing
- Research and ideation
- Productivity tips
- General knowledge questions

Be helpful and concise.
        `
      }

      const response = await spark.llm(prompt, aiModel)

      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        noteContext
      }

      // Add assistant message
      setConversations(prev => prev.map(c => 
        c.id === conversation!.id 
          ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() }
          : c
      ))

    } catch (error) {
      console.error('AI message error:', error)
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, createConversation, aiModel, setConversations])

  const generateSuggestions = useCallback(async (noteId: string, content: string) => {
    try {
      const prompt = spark.llmPrompt`
Analyze this note content and provide improvement suggestions:

Content: ${content}

Provide suggestions as JSON array with objects containing:
- type: "title" | "content" | "tags" | "structure"
- title: brief description
- description: detailed explanation
- suggestion: specific recommendation
- confidence: 0-1 score

Focus on actionable improvements with high confidence.
      `

      const response = await spark.llm(prompt, aiModel, true)
      return JSON.parse(response)
    } catch (error) {
      console.error('Suggestions error:', error)
      return []
    }
  }, [aiModel])

  const summarizeNote = useCallback(async (noteId: string, content: string) => {
    try {
      const prompt = spark.llmPrompt`
Create a concise summary of this note:

${content}

Provide a clear, structured summary that captures the main points and key insights.
      `

      const response = await spark.llm(prompt, aiModel)
      return response
    } catch (error) {
      console.error('Summarize error:', error)
      throw error
    }
  }, [aiModel])

  const improveWriting = useCallback(async (content: string) => {
    try {
      const prompt = spark.llmPrompt`
Improve the writing style, clarity, and flow of this content:

${content}

Maintain the original meaning while enhancing readability, grammar, and organization.
      `

      const response = await spark.llm(prompt, aiModel)
      return response
    } catch (error) {
      console.error('Writing improvement error:', error)
      throw error
    }
  }, [aiModel])

  const value: AIContextType = {
    conversations,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    isLoading,
    generateSuggestions,
    summarizeNote,
    improveWriting,
    aiModel,
    setAIModel,
    autoSuggest,
    setAutoSuggest
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}