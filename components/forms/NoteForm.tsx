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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { 
  FileText, 
  Save, 
  X, 
  Plus, 
  Tag,
  Folder,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

// Note form validation schema
const noteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10,000 characters'),
  tags: z.array(z.string())
    .optional()
    .default([]),
  categoryId: z.string().optional(),
  workspaceId: z.string().optional(),
  isPublic: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

type NoteFormData = z.infer<typeof noteSchema>

interface NoteFormProps {
  initialData?: Partial<NoteFormData>
  onSubmit: (data: NoteFormData) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  availableCategories?: Array<{ id: string; name: string }>
  availableWorkspaces?: Array<{ id: string; name: string }>
}

export function NoteForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  availableCategories = [],
  availableWorkspaces = []
}: NoteFormProps) {
  const [tagInput, setTagInput] = React.useState('')

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
      categoryId: '',
      workspaceId: '',
      isPublic: false,
      priority: 'medium',
      ...initialData
    }
  })

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form
  const watchedTags = watch('tags') || []

  const handleFormSubmit = async (data: NoteFormData) => {
    try {
      await onSubmit(data)
      if (mode === 'create') {
        form.reset()
        toast.success('Note created successfully! 🎉')
      } else {
        toast.success('Note updated successfully! ✨')
      }
    } catch (error) {
      toast.error(mode === 'create' ? 'Failed to create note' : 'Failed to update note')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-lg">
              <FileText className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-fg">
                {mode === 'create' ? 'Create New Note' : 'Edit Note'}
              </h2>
              <p className="text-sm text-fg-secondary">
                {mode === 'create' 
                  ? 'Capture your thoughts and ideas with AI assistance'
                  : 'Update your note content and settings'
                }
              </p>
            </div>
          </div>
          
          {mode === 'create' && (
            <Badge variant="secondary" className="gap-2">
              <Sparkles className="h-3 w-3" />
              AI Enhanced
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-fg-secondary font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter note title..."
              className="text-lg font-medium"
              disabled={isLoading}
              error={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.title.message}
              </div>
            )}
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-fg-secondary font-medium">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Start writing your note..."
              className="min-h-[300px] resize-y"
              disabled={isLoading}
              error={!!errors.content}
              {...register('content')}
            />
            {errors.content && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.content.message}
              </div>
            )}
            <div className="text-xs text-fg-secondary">
              {watch('content')?.length || 0} / 10,000 characters
            </div>
          </div>

          {/* Tags Field */}
          <div className="space-y-3">
            <Label htmlFor="tags" className="text-fg-secondary font-medium">
              Tags
            </Label>
            
            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addTag}
                disabled={!tagInput.trim() || isLoading}
                className="px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tag Display */}
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-2 pl-3 pr-2 py-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 p-0 hover:bg-transparent text-neutral-6 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Organization Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-fg-secondary font-medium">
                Category
              </Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No category</SelectItem>
                      {availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Workspace Selection */}
            <div className="space-y-2">
              <Label htmlFor="workspaceId" className="text-fg-secondary font-medium">
                Workspace
              </Label>
              <Controller
                name="workspaceId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select workspace..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Personal workspace</SelectItem>
                      {availableWorkspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {workspace.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Priority and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-fg-secondary font-medium">
                Priority
              </Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Low Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          High Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Public Toggle */}
            <div className="space-y-2">
              <Label htmlFor="isPublic" className="text-fg-secondary font-medium">
                Visibility
              </Label>
              <div className="flex items-center space-x-3 h-12">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                  disabled={isLoading}
                  {...register('isPublic')}
                />
                <Label 
                  htmlFor="isPublic" 
                  className="text-sm text-fg cursor-pointer"
                >
                  Make this note public
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-3">
            <div className="text-sm text-fg-secondary">
              {mode === 'create' ? 'Draft will be saved automatically' : 'Changes will be saved'}
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
                {mode === 'create' ? 'Create Note' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Hook for easy form usage
export function useNoteForm(
  options: {
    mode?: 'create' | 'edit'
    initialData?: Partial<NoteFormData>
    onSuccess?: () => void
  } = {}
) {
  const { mode = 'create', initialData, onSuccess } = options

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
      categoryId: '',
      workspaceId: '',
      isPublic: false,
      priority: 'medium',
      ...initialData
    }
  })

  const handleSubmit = async (data: NoteFormData) => {
    // This would integrate with your API
    console.log('Submitting note:', data)
    onSuccess?.()
  }

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isLoading: false // Replace with actual loading state
  }
}
