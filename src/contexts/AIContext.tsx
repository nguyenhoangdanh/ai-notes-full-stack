import React, { createContext, useContext, useState, useCallback } from 'react'
import { useConversations, useCreateConversation, useSendMessage, useSemanticSearch } from '../hooks/useAI'
import { CreateConversationDto, SendMessageDto, SemanticSearchDto, AIConversation, SemanticSearchResult } from '../types/ai.types'
import { toast } from 'sonner'

interface AIContextType {
  // Conversation state
  conversations: AIConversation[]
  activeConversation: AIConversation | null
  isLoadingConversations: boolean
  
  // Processing states
  isProcessing: boolean
  isSending: boolean
  isSearching: boolean
  
  // Conversation operations
  createConversation: (data: CreateConversationDto) => Promise<AIConversation | undefined>
  selectConversation: (conversation: AIConversation | null) => void
  sendMessage: (message: string, context?: string[]) => Promise<void>
  
  // Search operations
  performSemanticSearch: (query: string, options?: Partial<SemanticSearchDto>) => Promise<SemanticSearchResult[]>
  
  // Helper functions
  startNewChat: (noteId?: string) => Promise<void>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Use the AI hooks
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations()
  const createConversationMutation = useCreateConversation()
  const sendMessageMutation = useSendMessage()
  const semanticSearchMutation = useSemanticSearch()

  const createConversation = useCallback(async (data: CreateConversationDto): Promise<AIConversation | undefined> => {
    try {
      setIsProcessing(true)
      const conversation = await createConversationMutation.mutateAsync(data)
      setActiveConversation(conversation)
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      return undefined
    } finally {
      setIsProcessing(false)
    }
  }, [createConversationMutation])

  const selectConversation = useCallback((conversation: AIConversation | null) => {
    setActiveConversation(conversation)
  }, [])

  const sendMessage = useCallback(async (message: string, context?: string[]): Promise<void> => {
    if (!activeConversation) {
      throw new Error('No active conversation')
    }

    try {
      setIsProcessing(true)
      const response = await sendMessageMutation.mutateAsync({
        conversationId: activeConversation.id,
        data: { content: message, context }
      })
      
      // Update active conversation with the response
      setActiveConversation(response.conversation)
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [activeConversation, sendMessageMutation])

  const performSemanticSearch = useCallback(async (
    query: string, 
    options: Partial<SemanticSearchDto> = {}
  ): Promise<SemanticSearchResult[]> => {
    try {
      setIsProcessing(true)
      const results = await semanticSearchMutation.mutateAsync({
        query,
        limit: 10,
        threshold: 0.7,
        ...options
      })
      return results
    } catch (error) {
      console.error('Semantic search failed:', error)
      toast.error('Search failed')
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [semanticSearchMutation])

  const startNewChat = useCallback(async (noteId?: string): Promise<void> => {
    const conversation = await createConversation({
      title: noteId ? 'Note Chat' : 'New Chat',
      noteId,
      context: noteId ? [noteId] : []
    })
    
    if (conversation) {
      setActiveConversation(conversation)
    }
  }, [createConversation])

  const value: AIContextType = {
    conversations,
    activeConversation,
    isLoadingConversations,
    isProcessing,
    isSending: sendMessageMutation.isPending,
    isSearching: semanticSearchMutation.isPending,
    createConversation,
    selectConversation,
    sendMessage,
    performSemanticSearch,
    startNewChat
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}