import React, { createContext, useContext, useState, useCallback } from 'react'
import { useSemanticSearch } from '../hooks/use-ai'
import { SemanticSearchDto, SemanticSearchResult } from '../types'
import { toast } from 'sonner'

interface AIContextType {
  // Semantic Search
  searchResults: SemanticSearchResult[]
  isSearching: boolean
  semanticSearch: (params: SemanticSearchDto) => Promise<SemanticSearchResult[]>
  clearSearchResults: () => void
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
  
  const semanticSearchMutation = useSemanticSearch()

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

  const contextValue: AIContextType = {
    searchResults,
    isSearching: semanticSearchMutation.isPending,
    semanticSearch,
    clearSearchResults,
  }

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  )
}