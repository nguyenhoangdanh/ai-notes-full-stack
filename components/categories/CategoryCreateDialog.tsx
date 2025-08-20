'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  Tag, 
  Palette, 
  Sparkles, 
  Plus,
  Hash,
  Brain,
  Wand2,
  Check,
  AlertCircle
} from 'lucide-react'
import { type CreateCategoryDto } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CategoryCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCategoryDto) => Promise<any>
  isLoading: boolean
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

const PRESET_ICONS = [
  '📁', '📂', '🗂️', '📋', '📝', '💡', '🎯', '⭐',
  '🔥', '🚀', '💎', '🎨', '🔬', '📚', '💼', '🏆'
]

const SUGGESTED_KEYWORDS = [
  'work', 'personal', 'project', 'idea', 'todo', 'meeting',
  'research', 'design', 'development', 'marketing', 'finance', 'health'
]

export function CategoryCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CategoryCreateDialogProps) {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📁',
    keywords: [],
    isAuto: false,
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const keywordInputRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      await onSubmit(formData)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '📁',
        keywords: [],
        isAuto: false,
      })
      setKeywordInput('')
      setErrors({})
      onOpenChange(false)
      
      toast.success('Category created successfully! 🎉')
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error('Failed to create category')
    }
  }

  const addKeyword = (keyword?: string) => {
    const keywordToAdd = keyword || keywordInput.trim()
    if (keywordToAdd && !formData.keywords.includes(keywordToAdd)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordToAdd]
      }))
      setKeywordInput('')
      keywordInputRef.current?.focus()
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const generateAutoKeywords = () => {
    const name = formData.name.toLowerCase()
    const description = formData.description.toLowerCase()
    const text = `${name} ${description}`
    
    const suggestedKeywords = SUGGESTED_KEYWORDS.filter(keyword => 
      text.includes(keyword) && !formData.keywords.includes(keyword)
    ).slice(0, 3)
    
    if (suggestedKeywords.length > 0) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, ...suggestedKeywords]
      }))
      toast.success(`Added ${suggestedKeywords.length} suggested keywords`)
    } else {
      toast.info('No additional keywords found')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-xl">
              <Tag className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create New Category</DialogTitle>
              <DialogDescription className="text-text-muted">
                Organize your notes with a custom category
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text-secondary font-medium">
                Category Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Work Projects"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                error={!!errors.name}
                helperText={errors.name}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-text-secondary font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of this category (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* Visual Customization */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </h3>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-text-secondary font-medium">Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                      formData.color === color 
                        ? "border-text shadow-2 ring-2 ring-brand-200" 
                        : "border-border hover:border-border-strong"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <Label className="text-text-secondary font-medium">Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center text-lg",
                      formData.icon === icon 
                        ? "border-brand-500 bg-brand-50" 
                        : "border-border hover:border-border-strong hover:bg-surface-hover"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon}
                </div>
                <div>
                  <div className="font-medium text-text">
                    {formData.name || 'Category Name'}
                  </div>
                  <div className="text-sm text-text-muted">
                    {formData.description || 'Category description'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Keywords */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Keywords
              </h3>
              
              {(formData.name || formData.description) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAutoKeywords}
                  className="gap-2"
                >
                  <Wand2 className="h-3 w-3" />
                  Suggest
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  ref={keywordInputRef}
                  placeholder="Add keywords to help categorize notes"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={() => addKeyword()} 
                  variant="outline"
                  disabled={!keywordInput.trim()}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              
              {/* Suggested Keywords */}
              {keywordInput === '' && formData.keywords.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted">Suggested keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_KEYWORDS.slice(0, 6).map((keyword) => (
                      <Button
                        key={keyword}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addKeyword(keyword)}
                        className="h-7 px-2 text-xs rounded-full"
                      >
                        {keyword}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current Keywords */}
              <AnimatePresence>
                {formData.keywords.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {formData.keywords.map((keyword, index) => (
                      <motion.div
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge 
                          variant="outline" 
                          className="gap-2 pr-1 hover:bg-surface-hover transition-colors"
                        >
                          {keyword}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-4 w-4 p-0 hover:bg-danger/20 hover:text-danger rounded-full"
                            onClick={() => removeKeyword(keyword)}
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Separator />

          {/* AI Auto-categorization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-600" />
                <Label htmlFor="auto" className="font-medium">AI Auto-categorization</Label>
              </div>
              <Switch
                id="auto"
                checked={formData.isAuto}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAuto: checked }))}
              />
            </div>
            
            {formData.isAuto && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-brand-50 rounded-xl border border-brand-200"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-brand-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-brand-800">Smart categorization enabled</p>
                    <p className="text-brand-600 mt-1">
                      AI will automatically assign notes to this category based on keywords and content analysis.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
              loading={isLoading}
              variant="gradient"
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
