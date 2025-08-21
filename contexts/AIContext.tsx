import React, { createContext, useContext, useState, useCallback } from 'react'
import { useSemanticSearch, useCompleteChat } from '../hooks/use-ai'
import { SemanticSearchDto, SemanticSearchResult, AIConversation, CreateConversationDto, AIMessage } from '../types'
import { toast } from 'sonner'

interface AIContextType {
  // Semantic Search
  searchResults: SemanticSearchResult[]
  isSearching: boolean
  semanticSearch: (params: SemanticSearchDto) => Promise<SemanticSearchResult[]>
  clearSearchResults: () => void

  // Chat/Conversation Management
  activeConversation: AIConversation | null
  conversations: AIConversation[]
  sendMessage: (content: string, context?: string[]) => Promise<void>
  createConversation: (params: CreateConversationDto) => Promise<void>
  deleteConversation: (conversationId: string) => void
  isProcessing: boolean
  startNewChat: () => void

  // AI Assistant
  askAI: (prompt: string, context?: string[]) => Promise<string>
}

const AIContext = createContext<AIContextType | null>(null)

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([])
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null)
  const [conversations, setConversations] = useState<AIConversation[]>([])
  
  const semanticSearchMutation = useSemanticSearch()
  const completeChatMutation = useCompleteChat()

  const semanticSearch = useCallback(async (params: SemanticSearchDto): Promise<SemanticSearchResult[]> => {
    try {
      const results = await semanticSearchMutation.mutateAsync(params)
      setSearchResults(results)
      return results
    } catch (error) {
      console.error('Semantic search failed:', error)
      toast.error('Failed to perform semantic search')
      return []
    }
  }, [semanticSearchMutation])

  const clearSearchResults = useCallback(() => {
    setSearchResults([])
  }, [])

  const createConversation = useCallback(async (params: CreateConversationDto) => {
    const newConversation: AIConversation = {
      id: `conv_${Date.now()}`,
      userId: 'current-user', // TODO: Get from auth context
      noteId: params.noteId,
      title: params.title,
      messages: [],
      context: params.context || [],
      totalTokens: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setActiveConversation(newConversation)
    setConversations(prev => [...prev, newConversation])
  }, [])

  const sendMessage = useCallback(async (content: string, context?: string[]) => {
    if (!activeConversation) {
      // Create a conversation if none exists
      await createConversation({
        title: 'New Chat',
        context: context || []
      })
    }

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    // Add user message to conversation
    setActiveConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: new Date().toISOString()
    } : null)

    try {
      // Send to AI service
      const response = await completeChatMutation.mutateAsync({
        message: content,
        conversationId: activeConversation?.id || '',
        context: context || []
      })

      const aiMessage: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.response || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date().toISOString()
      }

      // Add AI response to conversation
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage],
        updatedAt: new Date().toISOString(),
        totalTokens: prev.totalTokens // Backend doesn't return token count currently
      } : null)

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
      
      // Add error message
      const errorMessage: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      }

      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date().toISOString()
      } : null)
    }
  }, [activeConversation, createConversation, completeChatMutation])

  const deleteConversation = useCallback((conversationId: string) => {
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null)
    }
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
  }, [activeConversation])

  const startNewChat = useCallback(() => {
    setActiveConversation(null)
  }, [])

  const askAI = useCallback(async (prompt: string, context?: string[]): Promise<string> => {
    try {
      const response = await completeChatMutation.mutateAsync({
        message: prompt,
        conversationId: `temp_${Date.now()}`,
        context: context || []
      })
      return response.response || 'I apologize, but I couldn\'t generate a response.'
    } catch (error) {
      console.error('askAI failed:', error)
      toast.error('Failed to get AI response')
      throw new Error('AI request failed')
    }
  }, [completeChatMutation])

  const contextValue: AIContextType = {
    searchResults,
    isSearching: semanticSearchMutation.isPending,
    semanticSearch,
    clearSearchResults,
    activeConversation,
    conversations,
    sendMessage,
    createConversation,
    deleteConversation,
    isProcessing: completeChatMutation.isPending,
    startNewChat,
    askAI
  }

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  )
}
