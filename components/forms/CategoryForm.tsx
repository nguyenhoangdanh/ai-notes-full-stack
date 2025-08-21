'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/Badge'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { 
  Tag, 
  Save, 
  X, 
  Plus, 
  Hash,
  Palette,
  AlertCircle,
  Bot,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

// Category form validation schema
const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Category name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .default('#6366f1'),
  icon: z.string()
    .max(50, 'Icon name too long')
    .optional(),
  keywords: z.array(z.string())
    .min(1, 'At least one keyword is required')
    .max(10, 'Maximum 10 keywords allowed'),
  isAuto: z.boolean().default(false)
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>
  onSubmit: (data: CategoryFormData) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const predefinedColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#6b7280', '#374151'
]

const predefinedIcons = [
  { name: 'work', label: 'Work', icon: '💼' },
  { name: 'personal', label: 'Personal', icon: '👤' },
  { name: 'study', label: 'Study', icon: '📚' },
  { name: 'health', label: 'Health', icon: '🏥' },
  { name: 'finance', label: 'Finance', icon: '💰' },
  { name: 'travel', label: 'Travel', icon: '✈️' },
  { name: 'food', label: 'Food', icon: '🍕' },
  { name: 'tech', label: 'Tech', icon: '💻' },
  { name: 'creative', label: 'Creative', icon: '🎨' },
  { name: 'fitness', label: 'Fitness', icon: '💪' },
  { name: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { name: 'ideas', label: 'Ideas', icon: '💡' }
]

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: CategoryFormProps) {
  const [keywordInput, setKeywordInput] = React.useState('')

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366f1',
      icon: '',
      keywords: [],
      isAuto: false,
      ...initialData
    }
  })

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form
  const watchedKeywords = watch('keywords') || []
  const watchedColor = watch('color')
  const watchedIcon = watch('icon')

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data)
      if (mode === 'create') {
        form.reset()
        toast.success('Category created successfully! 🎉')
      } else {
        toast.success('Category updated successfully! ✨')
      }
    } catch (error) {
      toast.error(mode === 'create' ? 'Failed to create category' : 'Failed to update category')
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !watchedKeywords.includes(keywordInput.trim()) && watchedKeywords.length < 10) {
      setValue('keywords', [...watchedKeywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setValue('keywords', watchedKeywords.filter(keyword => keyword !== keywordToRemove))
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const generateKeywordsFromName = () => {
    const name = watch('name')
    if (name) {
      const words = name.toLowerCase().split(/\s+/).filter(word => word.length > 2)
      const newKeywords = [...new Set([...watchedKeywords, ...words])].slice(0, 10)
      setValue('keywords', newKeywords)
      toast.success('Keywords generated from category name!')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${watchedColor}20`, color: watchedColor }}
            >
              {watchedIcon ? (
                <span className="text-lg">{predefinedIcons.find(i => i.name === watchedIcon)?.icon || '📁'}</span>
              ) : (
                <Tag className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-fg">
                {mode === 'create' ? 'Create New Category' : 'Edit Category'}
              </h2>
              <p className="text-sm text-fg-secondary">
                {mode === 'create' 
                  ? 'Organize your notes with custom categories'
                  : 'Update category details and settings'
                }
              </p>
            </div>
          </div>
          
          {watch('isAuto') && (
            <Badge variant="ai" className="gap-2">
              <Bot className="h-3 w-3" />
              AI Generated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-fg-secondary font-medium">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter category name..."
              className="text-lg font-medium"
              disabled={isLoading}
              error={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.name.message}
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-fg-secondary font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this category is for..."
              className="min-h-[100px] resize-y"
              disabled={isLoading}
              error={!!errors.description}
              {...register('description')}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.description.message}
              </div>
            )}
            <div className="text-xs text-fg-secondary">
              {watch('description')?.length || 0} / 200 characters
            </div>
          </div>

          {/* Visual Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-fg-secondary font-medium">
                Color <span className="text-red-500">*</span>
              </Label>
              
              {/* Color Picker */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-12 h-12 rounded-lg border border-neutral-3 cursor-pointer"
                  {...register('color')}
                  disabled={isLoading}
                />
                <Input
                  placeholder="#6366f1"
                  className="flex-1 font-mono"
                  disabled={isLoading}
                  error={!!errors.color}
                  {...register('color')}
                />
              </div>

              {/* Predefined Colors */}
              <div className="grid grid-cols-10 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 cursor-pointer transition-all",
                      watchedColor === color ? "border-neutral-8 scale-110" : "border-neutral-3 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue('color', color)}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {errors.color && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.color.message}
                </div>
              )}
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <Label className="text-fg-secondary font-medium">
                Icon
              </Label>
              
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-3 rounded-lg">
                {predefinedIcons.map((iconItem) => (
                  <button
                    key={iconItem.name}
                    type="button"
                    className={cn(
                      "p-3 rounded-lg border transition-all text-center hover:scale-105",
                      watchedIcon === iconItem.name 
                        ? "border-brand-500 bg-brand-50" 
                        : "border-neutral-3 hover:border-neutral-4"
                    )}
                    onClick={() => setValue('icon', iconItem.name)}
                    disabled={isLoading}
                    title={iconItem.label}
                  >
                    <div className="text-lg mb-1">{iconItem.icon}</div>
                    <div className="text-xs text-fg-secondary">{iconItem.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="keywords" className="text-fg-secondary font-medium">
                Keywords <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateKeywordsFromName}
                disabled={!watch('name') || isLoading}
                className="text-brand-600 hover:text-brand-700"
              >
                <Bot className="h-4 w-4 mr-1" />
                Generate
              </Button>
            </div>
            
            {/* Keyword Input */}
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Add a keyword..."
                className="flex-1"
                disabled={isLoading || watchedKeywords.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addKeyword}
                disabled={!keywordInput.trim() || watchedKeywords.length >= 10 || isLoading}
                className="px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Keyword Display */}
            {watchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="gap-2 pl-3 pr-2 py-1"
                  >
                    <Hash className="h-3 w-3" />
                    {keyword}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyword(keyword)}
                      className="h-4 w-4 p-0 hover:bg-transparent text-neutral-6 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-xs text-fg-secondary">
              {watchedKeywords.length} / 10 keywords
            </div>
            
            {errors.keywords && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.keywords.message}
              </div>
            )}
          </div>

          {/* AI Auto Category Toggle */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAuto"
                className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                disabled={isLoading}
                {...register('isAuto')}
              />
              <div>
                <Label 
                  htmlFor="isAuto" 
                  className="text-sm text-fg cursor-pointer font-medium"
                >
                  AI-Generated Category
                </Label>
                <p className="text-xs text-fg-secondary">
                  This category was automatically created by AI based on note content
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-3">
            <div className="text-sm text-fg-secondary">
              Keywords help AI categorize notes automatically
            </div>
            
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
                className="min-w-[120px] gap-2"
              >
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Create Category' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Hook for easy form usage
export function useCategoryForm(
  options: {
    mode?: 'create' | 'edit'
    initialData?: Partial<CategoryFormData>
    onSuccess?: () => void
  } = {}
) {
  const { mode = 'create', initialData, onSuccess } = options

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366f1',
      icon: '',
      keywords: [],
      isAuto: false,
      ...initialData
    }
  })

  const handleSubmit = async (data: CategoryFormData) => {
    // This would integrate with your API
    console.log('Submitting category:', data)
    onSuccess?.()
  }

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isLoading: false // Replace with actual loading state
  }
}
