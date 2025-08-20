'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { QuickTooltip } from '../ui/tooltip'
import {
  Sparkles,
  Wand2,
  FileText,
  Lightbulb,
  TrendingUp,
  Target,
  BookOpen,
  PenTool,
  Brain,
  Zap,
  ArrowRight,
  X,
  RefreshCw,
  Clock,
  Tag,
  Star,
  Check,
  ChevronRight,
  Bot
} from 'lucide-react'
import { useAI } from '../../contexts/AIContext'
import { useNotes } from '../../contexts/NotesContext'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface AISuggestion {
  id: string
  type: 'enhance' | 'summarize' | 'expand' | 'organize' | 'relate' | 'template' | 'insight'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: string
  confidence: number
  estimatedTime?: string
  category: 'writing' | 'organization' | 'productivity' | 'analysis'
  premium?: boolean
}

interface AISuggestionsProps {
  noteId?: string
  content?: string
  context?: 'note' | 'workspace' | 'dashboard'
  limit?: number
  showCategory?: boolean
  className?: string
}

export function AISuggestions({
  noteId,
  content = '',
  context = 'note',
  limit = 6,
  showCategory = true,
  className
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const { askAI, isProcessing } = useAI()
  const { notes } = useNotes()

  // Generate contextual suggestions based on content and context
  const generateSuggestions = useMemo(() => {
    const baseSuggestions: AISuggestion[] = []

    // Content-based suggestions
    if (content.length > 0) {
      if (content.length < 100) {
        baseSuggestions.push({
          id: 'expand-content',
          type: 'expand',
          title: 'Expand Your Ideas',
          description: 'Add more details and depth to your note',
          icon: Lightbulb,
          action: 'Please expand on the ideas in this note with more details and examples',
          confidence: 85,
          estimatedTime: '30s',
          category: 'writing'
        })
      }

      if (content.length > 200) {
        baseSuggestions.push({
          id: 'summarize-content',
          type: 'summarize',
          title: 'Create Summary',
          description: 'Generate a concise summary of key points',
          icon: FileText,
          action: 'Please create a concise summary of the main points in this note',
          confidence: 90,
          estimatedTime: '15s',
          category: 'analysis'
        })
      }

      if (content.includes('TODO') || content.includes('task') || content.includes('action')) {
        baseSuggestions.push({
          id: 'organize-tasks',
          type: 'organize',
          title: 'Organize Tasks',
          description: 'Structure action items and priorities',
          icon: Target,
          action: 'Please organize the tasks and action items mentioned in this note into a structured format',
          confidence: 88,
          estimatedTime: '20s',
          category: 'productivity'
        })
      }

      baseSuggestions.push({
        id: 'enhance-writing',
        type: 'enhance',
        title: 'Improve Writing',
        description: 'Enhance clarity and readability',
        icon: PenTool,
        action: 'Please improve the writing style and clarity of this note while preserving the original meaning',
        confidence: 80,
        estimatedTime: '25s',
        category: 'writing'
      })
    }

    // Context-based suggestions
    switch (context) {
      case 'workspace':
        baseSuggestions.push({
          id: 'workspace-insights',
          type: 'insight',
          title: 'Workspace Insights',
          description: 'Analyze patterns across your notes',
          icon: TrendingUp,
          action: 'Analyze the patterns and themes across notes in this workspace',
          confidence: 75,
          estimatedTime: '45s',
          category: 'analysis',
          premium: true
        })
        break
      
      case 'dashboard':
        baseSuggestions.push({
          id: 'daily-summary',
          type: 'summarize',
          title: 'Daily Summary',
          description: 'Summarize today\'s notes and activities',
          icon: Clock,
          action: 'Create a summary of today\'s notes and key activities',
          confidence: 82,
          estimatedTime: '30s',
          category: 'productivity'
        })
        break
    }

    // Related notes suggestions
    if (noteId && notes.length > 1) {
      baseSuggestions.push({
        id: 'find-connections',
        type: 'relate',
        title: 'Find Connections',
        description: 'Discover related notes and concepts',
        icon: Brain,
        action: 'Find connections between this note and other notes in my collection',
        confidence: 70,
        estimatedTime: '35s',
        category: 'analysis'
      })
    }

    // Template suggestions
    baseSuggestions.push({
      id: 'create-template',
      type: 'template',
      title: 'Create Template',
      description: 'Turn this into a reusable template',
      icon: BookOpen,
      action: 'Create a reusable template based on the structure of this note',
      confidence: 65,
      estimatedTime: '40s',
      category: 'organization'
    })

    return baseSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)
  }, [content, context, noteId, notes.length, limit])

  useEffect(() => {
    setSuggestions(generateSuggestions)
  }, [generateSuggestions])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(suggestions.map(s => s.category)))
    return cats.map(cat => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: suggestions.filter(s => s.category === cat).length,
      icon: {
        writing: PenTool,
        organization: BookOpen,
        productivity: Target,
        analysis: Brain
      }[cat] || Sparkles
    }))
  }, [suggestions])

  const filteredSuggestions = useMemo(() => {
    if (!selectedCategory) return suggestions
    return suggestions.filter(s => s.category === selectedCategory)
  }, [suggestions, selectedCategory])

  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    if (appliedSuggestions.has(suggestion.id)) return

    try {
      setIsGenerating(true)
      
      // Apply the suggestion
      await askAI(suggestion.action, noteId ? [noteId] : undefined)
      
      // Mark as applied
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]))
      
      toast.success(`Applied: ${suggestion.title}`, {
        description: 'AI is processing your request...'
      })
    } catch (error) {
      toast.error('Failed to apply suggestion')
    } finally {
      setIsGenerating(false)
    }
  }

  const refreshSuggestions = () => {
    setIsGenerating(true)
    // Simulate regeneration delay
    setTimeout(() => {
      setSuggestions(generateSuggestions)
      setAppliedSuggestions(new Set())
      setIsGenerating(false)
      toast.success('Suggestions refreshed!')
    }, 1000)
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-text">AI Suggestions</h3>
            <p className="text-xs text-text-muted">
              {suggestions.length} smart recommendations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <QuickTooltip content="Refresh suggestions">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={refreshSuggestions}
              disabled={isGenerating}
              className="rounded-lg"
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isGenerating && "animate-spin"
              )} />
            </Button>
          </QuickTooltip>
        </div>
      </div>

      {/* Category Filters */}
      {showCategory && categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap rounded-xl"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            All
            <Badge variant="secondary" size="xs" className="ml-2">
              {suggestions.length}
            </Badge>
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap rounded-xl gap-1"
            >
              <category.icon className="h-3 w-3" />
              {category.label}
              <Badge variant="secondary" size="xs" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence>
          {filteredSuggestions.map((suggestion, index) => {
            const isApplied = appliedSuggestions.has(suggestion.id)
            const isProcessingSuggestion = isGenerating && !isApplied
            
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="glass"
                  className={cn(
                    "p-4 border border-border-subtle hover:border-brand-200 transition-all duration-200 group cursor-pointer",
                    isApplied && "border-success-border bg-success-bg/30",
                    isProcessingSuggestion && "border-warning-border bg-warning-bg/30"
                  )}
                  onClick={() => !isApplied && handleApplySuggestion(suggestion)}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-transform group-hover:scale-110",
                          isApplied 
                            ? "bg-success-bg text-success" 
                            : "bg-brand-100 text-brand-600"
                        )}>
                          {isApplied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <suggestion.icon className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              "font-medium text-text group-hover:text-brand-700 transition-colors",
                              isApplied && "text-success"
                            )}>
                              {suggestion.title}
                            </h4>
                            
                            {suggestion.premium && (
                              <Badge variant="gradient" size="xs">
                                Pro
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-text-muted leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Arrow */}
                      <motion.div
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          isApplied && "opacity-100"
                        )}
                        whileHover={{ x: 2 }}
                      >
                        {isApplied ? (
                          <div className="text-success">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-text-subtle" />
                        )}
                      </motion.div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-text-subtle">
                        <div className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          <span>{suggestion.confidence}% confidence</span>
                        </div>
                        
                        {suggestion.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{suggestion.estimatedTime}</span>
                          </div>
                        )}
                      </div>

                      <Badge 
                        variant="outline" 
                        size="xs"
                        className={cn(
                          isApplied && "border-success text-success"
                        )}
                      >
                        {isApplied ? 'Applied' : suggestion.category}
                      </Badge>
                    </div>

                    {/* Progress Bar for Processing */}
                    {isProcessingSuggestion && (
                      <div className="h-1 bg-bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-brand-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSuggestions.length === 0 && selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="p-4 bg-bg-muted rounded-2xl inline-block mb-4">
            <Sparkles className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="font-medium text-text mb-2">No suggestions in this category</h3>
          <p className="text-sm text-text-muted mb-4">
            Try selecting a different category or refresh suggestions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-xl"
          >
            View All Suggestions
          </Button>
        </motion.div>
      )}

      {/* AI Processing Indicator */}
      <AnimatePresence>
        {(isProcessing || isGenerating) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-brand-50 border border-brand-200"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="h-4 w-4 text-brand-600" />
            </motion.div>
            <span className="text-sm font-medium text-brand-700">
              AI is working on your request...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
