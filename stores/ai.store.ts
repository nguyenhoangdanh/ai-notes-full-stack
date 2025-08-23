import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useSemanticSearch, useCompleteChat } from '../hooks/use-ai'
import { SemanticSearchDto, SemanticSearchResult, AIConversation, CreateConversationDto, AIMessage } from '../types'
import { toast } from 'sonner'

interface AIState {
  // Semantic Search
  searchResults: SemanticSearchResult[]
  isSearching: boolean
  
  // Chat/Conversation Management
  activeConversation: AIConversation | null
  conversations: AIConversation[]
  isProcessing: boolean
  
  // Actions
  setSearchResults: (results: SemanticSearchResult[]) => void
  clearSearchResults: () => void
  setActiveConversation: (conversation: AIConversation | null) => void
  addConversation: (conversation: AIConversation) => void
  removeConversation: (conversationId: string) => void
  setProcessing: (processing: boolean) => void
  startNewChat: () => void
  addMessageToConversation: (conversationId: string, message: AIMessage) => void
}

export const useAIStore = create<AIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      searchResults: [],
      isSearching: false,
      activeConversation: null,
      conversations: [],
      isProcessing: false,

      // Actions
      setSearchResults: (results: SemanticSearchResult[]) => {
        set({ searchResults: results, isSearching: false })
      },

      clearSearchResults: () => {
        set({ searchResults: [], isSearching: false })
      },

      setActiveConversation: (conversation: AIConversation | null) => {
        set({ activeConversation: conversation })
      },

      addConversation: (conversation: AIConversation) => {
        set((state) => ({
          conversations: [...state.conversations, conversation],
          activeConversation: conversation
        }))
      },

      removeConversation: (conversationId: string) => {
        set((state) => ({
          conversations: state.conversations.filter(c => c.id !== conversationId),
          activeConversation: state.activeConversation?.id === conversationId 
            ? null 
            : state.activeConversation
        }))
      },

      setProcessing: (processing: boolean) => {
        set({ isProcessing: processing })
      },

      startNewChat: () => {
        set({ activeConversation: null })
      },

      addMessageToConversation: (conversationId: string, message: AIMessage) => {
        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, messages: [...conv.messages, message] }
              : conv
          ),
          activeConversation: state.activeConversation?.id === conversationId
            ? { ...state.activeConversation, messages: [...state.activeConversation.messages, message] }
            : state.activeConversation
        }))
      }
    }),
    { name: 'ai-store' }
  )
)

// Convenient hook with business logic
export const useAI = () => {
  const {
    searchResults,
    isSearching,
    activeConversation,
    conversations,
    isProcessing,
    setSearchResults,
    clearSearchResults,
    setActiveConversation,
    addConversation,
    removeConversation,
    setProcessing,
    startNewChat,
    addMessageToConversation
  } = useAIStore()

  // Business logic functions that use the react-query hooks
  const semanticSearchMutation = useSemanticSearch()
  const completeChatMutation = useCompleteChat()

  const semanticSearch = async (params: SemanticSearchDto): Promise<SemanticSearchResult[]> => {
    try {
      const results = await semanticSearchMutation.mutateAsync(params)
      setSearchResults(results)
      return results
    } catch (error) {
      console.error('Semantic search failed:', error)
      toast.error('Search failed. Please try again.')
      clearSearchResults()
      return []
    }
  }

  const sendMessage = async (content: string, context?: string[]): Promise<void> => {
    if (!activeConversation) {
      // Create new conversation if none exists
      const newConversation: AIConversation = {
        id: Date.now().toString(),
        userId: 'current-user', // TODO: Get from auth store
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        context: context || [],
        totalTokens: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      addConversation(newConversation)
    }

    const conversationId = activeConversation?.id || conversations[conversations.length - 1]?.id
    if (!conversationId) return

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    addMessageToConversation(conversationId, userMessage)

    setProcessing(true)
    try {
      const response = await completeChatMutation.mutateAsync({
        message: content,
        context: context || [],
        conversationId
      })

      // Add AI response
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      }
      addMessageToConversation(conversationId, aiMessage)
    } catch (error) {
      console.error('Chat completion failed:', error)
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const createConversation = async (params: CreateConversationDto): Promise<void> => {
    const newConversation: AIConversation = {
      id: Date.now().toString(),
      userId: 'current-user', // TODO: Get from auth store
      title: params.title || 'New Conversation',
      messages: [],
      context: params.context || [],
      totalTokens: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addConversation(newConversation)
  }

  const deleteConversation = (conversationId: string): void => {
    removeConversation(conversationId)
    toast.success('Conversation deleted')
  }

  const askAI = async (prompt: string, context?: string[]): Promise<string> => {
    try {
      const response = await completeChatMutation.mutateAsync({
        message: prompt,
        context: context || [],
        conversationId: 'standalone' // For standalone requests
      })
      return response.response
    } catch (error) {
      console.error('AI request failed:', error)
      toast.error('AI request failed. Please try again.')
      throw error
    }
  }

  return {
    // State
    searchResults,
    isSearching: semanticSearchMutation.isPending,
    activeConversation,
    conversations,
    isProcessing,

    // Actions
    semanticSearch,
    clearSearchResults,
    sendMessage,
    createConversation,
    deleteConversation,
    startNewChat,
    askAI
  }
}