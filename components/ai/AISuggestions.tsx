import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Lightbulb, 
  Wand2, 
  FileText,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Brain,
  Tag as TagIcon,
  RefreshCcw
} from 'lucide-react'
import { useGenerateSuggestion } from '../../hooks/use-ai'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface SmartSuggestion {
  id: string
  type: 'title' | 'content' | 'tags' | 'structure' | 'related'
  title: string
  description: string
  suggestion: string
  confidence: number
  preview?: string
}

interface AISuggestionsProps {
  noteId: string
  noteTitle: string
  noteContent: string
  noteTags: string[]
  onApplySuggestion: (type: string, suggestion: string) => void
  className?: string
}

export function AISuggestions({
  noteId,
  noteTitle,
  noteContent,
  noteTags,
  onApplySuggestion,
  className
}: AISuggestionsProps) {
  const generateSuggestionMutation = useGenerateSuggestion()
  const isProcessing = generateSuggestionMutation.isPending
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState('')

  // Auto-generate suggestions when content changes significantly
  useEffect(() => {
    if (noteContent && noteContent !== lastAnalyzedContent && noteContent.length > 100) {
      const timer = setTimeout(() => {
        generateSuggestions()
      }, 2000) // Debounce for 2 seconds

      return () => clearTimeout(timer)
    }
  }, [noteContent])

  const generateSuggestions = async () => {
    if (isProcessing || !noteContent.trim()) return

    setLastAnalyzedContent(noteContent)

    try {
      const result = await generateSuggestionMutation.mutateAsync({
        noteId,
        content: noteContent,
        context: {
          noteId,
          title: noteTitle,
          tags: noteTags
        }
      })

      if (result && result.suggestions && result.suggestions.length > 0) {
        const newSuggestions: SmartSuggestion[] = result.suggestions.map((s: any, index: number) => ({
          id: `suggestion-${Date.now()}-${index}`,
          type: s.type || 'content',
          title: s.title || 'Improvement suggestion',
          description: s.description || s.suggestion,
          suggestion: s.suggestion,
          confidence: s.confidence || 0.7,
          preview: s.preview
        }))

        setSuggestions(newSuggestions)

        if (newSuggestions.length > 0) {
          setIsVisible(true)
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error('Failed to generate suggestions')
    }
  }

  const applySuggestion = (suggestion: SmartSuggestion) => {
    onApplySuggestion(suggestion.type, suggestion.suggestion)
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    
    toast.success('Suggestion applied!')
  }

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const dismissAllSuggestions = () => {
    setSuggestions([])
    setIsVisible(false)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'title': return FileText
      case 'content': return Wand2
      case 'tags': return TagIcon
      case 'structure': return Brain
      case 'related': return Lightbulb
      default: return Sparkles
    }
  }

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
    if (confidence >= 0.6) return 'text-primary bg-primary/10 border-primary/20'
    return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
  }

  if (!isVisible || suggestions.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Button
          variant="outline"
          onClick={generateSuggestions}
          disabled={isProcessing || !noteContent.trim()}
          className="w-full text-left justify-start h-auto p-4 superhuman-glass border-border/30 superhuman-hover rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl superhuman-gradient-subtle superhuman-glow flex items-center justify-center">
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
              ) : (
                <Brain className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 text-left space-y-1">
              <p className="font-medium text-sm">
                {isProcessing ? 'Analyzing your note...' : 'Get AI suggestions'}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isProcessing 
                  ? 'AI is reviewing your content for improvements'
                  : 'Let AI analyze your note and suggest improvements'
                }
              </p>
            </div>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("space-y-4", className)}
    >
      <Card variant="glass" className="p-4 border border-primary/20 superhuman-gradient-subtle superhuman-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full superhuman-gradient superhuman-glow flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">AI Suggestions</h4>
              <p className="text-xs text-muted-foreground">Smart improvements for your note</p>
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full superhuman-gradient-subtle">
              {suggestions.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismissAllSuggestions}
            className="text-muted-foreground hover:text-foreground rounded-full superhuman-hover"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => {
              const IconComponent = getSuggestionIcon(suggestion.type)
              
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1, duration: 0.15 }}
                  className="group"
                >
                  <Card variant="glass" className="p-3 superhuman-hover border-border/30 superhuman-transition">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border text-xs font-medium superhuman-transition",
                        getSuggestionColor(suggestion.confidence)
                      )}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-sm text-foreground">
                            {suggestion.title}
                          </h5>
                          <Badge variant="outline" className="text-xs capitalize rounded-full">
                            {suggestion.type}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs rounded-full",
                              suggestion.confidence >= 0.8 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                              suggestion.confidence >= 0.6 ? "bg-primary/10 text-primary" :
                              "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            )}
                          >
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {suggestion.description}
                        </p>
                        
                        {suggestion.preview && (
                          <div className="bg-muted/30 rounded-lg p-2 mt-2 border border-border/30">
                            <p className="text-xs font-mono text-foreground">
                              {suggestion.preview}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 superhuman-transition">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => applySuggestion(suggestion)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-full superhuman-hover"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="text-muted-foreground hover:text-foreground rounded-full superhuman-hover"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <Separator className="my-4 opacity-60" />
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isProcessing}
            className="text-xs text-muted-foreground hover:text-foreground superhuman-transition rounded-full"
          >
            <motion.div
              animate={isProcessing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
            </motion.div>
            Refresh suggestions
          </Button>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>AI-powered insights</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
