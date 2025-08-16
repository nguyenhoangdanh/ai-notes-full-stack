import { useState, useCallback } from 'react'
import { useAI } from '../contexts/AIContext'
import { toast } from 'sonner'

export function useAIFeatures() {
  const ai = useAI()
  const [isProcessing, setIsProcessing] = useState(false)

  const quickSummarize = useCallback(async (noteId: string, content: string) => {
    if (!content.trim()) {
      toast.error('No content to summarize')
      return null
    }

    setIsProcessing(true)
    try {
      const summary = await ai.summarizeNote(noteId, content)
      toast.success('Summary generated')
      return summary
    } catch (error) {
      toast.error('Failed to generate summary')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [ai])

  const quickImprove = useCallback(async (content: string) => {
    if (!content.trim()) {
      toast.error('No content to improve')
      return null
    }

    setIsProcessing(true)
    try {
      const improved = await ai.improveWriting(content)
      toast.success('Content improved')
      return improved
    } catch (error) {
      toast.error('Failed to improve content')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [ai])

  const quickSuggest = useCallback(async (noteId: string, content: string) => {
    if (!content.trim()) {
      toast.error('No content to analyze')
      return []
    }

    setIsProcessing(true)
    try {
      const suggestions = await ai.generateSuggestions(noteId, content)
      if (suggestions.length > 0) {
        toast.success(`${suggestions.length} suggestions generated`)
      } else {
        toast.info('No suggestions available')
      }
      return suggestions
    } catch (error) {
      toast.error('Failed to generate suggestions')
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [ai])

  const startConversation = useCallback((noteId?: string, noteTitle?: string) => {
    return ai.createConversation(noteId, noteTitle)
  }, [ai])

  const askAI = useCallback(async (
    question: string, 
    noteContext?: { id: string; title: string }
  ) => {
    setIsProcessing(true)
    try {
      await ai.sendMessage(question, noteContext)
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsProcessing(false)
    }
  }, [ai])

  return {
    // Core AI context
    ...ai,
    
    // Processing state
    isProcessing,
    
    // Quick actions
    quickSummarize,
    quickImprove,
    quickSuggest,
    startConversation,
    askAI,
    
    // Utility functions
    hasConversations: ai.conversations.length > 0,
    lastConversation: ai.conversations[0] || null,
    
    // Stats
    getStats: () => ({
      totalConversations: ai.conversations.length,
      totalMessages: ai.conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
      avgMessagesPerConversation: ai.conversations.length > 0 
        ? Math.round(ai.conversations.reduce((sum, conv) => sum + conv.messages.length, 0) / ai.conversations.length)
        : 0
    })
  }
}