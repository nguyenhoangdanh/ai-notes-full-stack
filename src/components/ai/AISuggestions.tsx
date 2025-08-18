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
  Sparkle,
  ArrowRight,
  Brain,
  Tag as TagIcon
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
      default: return Sparkle
    }
  }

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-amber-600 bg-amber-50 border-amber-200'
  }

  if (!isVisible || suggestions.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Button
          variant="outline"
          onClick={generateSuggestions}
          disabled={isProcessing || !noteContent.trim()}
          className="w-full text-left justify-start h-auto p-3 hover:bg-muted/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkle className="h-4 w-4 text-primary" />
                </motion.div>
              ) : (
                <Brain className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">
                {isProcessing ? 'Analyzing your note...' : 'Get AI suggestions'}
              </p>
              <p className="text-xs text-muted-foreground">
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
      <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkle className="h-3 w-3 text-primary-foreground" />
            </div>
            <h4 className="font-semibold text-sm">AI Suggestions</h4>
            <Badge variant="secondary" className="text-xs">
              {suggestions.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissAllSuggestions}
            className="text-muted-foreground hover:text-foreground p-1 h-auto"
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
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="p-3 hover:shadow-sm transition-shadow border border-border/50">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border text-xs font-medium",
                        getSuggestionColor(suggestion.confidence)
                      )}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-sm text-foreground">
                            {suggestion.title}
                          </h5>
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.type}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              suggestion.confidence >= 0.8 ? "bg-green-100 text-green-700" :
                              suggestion.confidence >= 0.6 ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}
                          >
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </p>
                        
                        {suggestion.preview && (
                          <div className="bg-muted/50 rounded p-2 mt-2">
                            <p className="text-xs font-mono text-foreground">
                              {suggestion.preview}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-auto"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="text-muted-foreground hover:text-foreground p-1 h-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <Separator className="my-3" />
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isProcessing}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <motion.div
              animate={isProcessing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
            </motion.div>
            Refresh suggestions
          </Button>
          
          <p className="text-xs text-muted-foreground">
            AI-powered insights
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
