'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Badge } from '../ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { 
  Folder, 
  Save, 
  X, 
  Plus, 
  Users,
  Lock,
  Globe,
  AlertCircle,
  Crown,
  Mail,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

// Workspace form validation schema
const workspaceSchema = z.object({
  name: z.string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Workspace name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  visibility: z.enum(['private', 'team', 'public']).default('private'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .default('#6366f1'),
  icon: z.string()
    .max(50, 'Icon name too long')
    .optional(),
  inviteEmails: z.array(z.string().email('Invalid email address'))
    .optional()
    .default([]),
  allowCollaboration: z.boolean().default(true),
  autoBackup: z.boolean().default(true),
  notificationSettings: z.object({
    newNotes: z.boolean().default(true),
    comments: z.boolean().default(true),
    mentions: z.boolean().default(true)
  }).optional()
})

export type WorkspaceFormData = z.infer<typeof workspaceSchema>

interface WorkspaceFormProps {
  initialData?: Partial<WorkspaceFormData>
  onSubmit: (data: WorkspaceFormData) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  currentUserPlan?: 'free' | 'pro' | 'team'
}

const predefinedColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#6b7280', '#374151'
]

const predefinedIcons = [
  { name: 'work', label: 'Work', icon: '💼' },
  { name: 'team', label: 'Team', icon: '👥' },
  { name: 'project', label: 'Project', icon: '📋' },
  { name: 'research', label: 'Research', icon: '🔬' },
  { name: 'design', label: 'Design', icon: '🎨' },
  { name: 'development', label: 'Development', icon: '💻' },
  { name: 'marketing', label: 'Marketing', icon: '📢' },
  { name: 'sales', label: 'Sales', icon: '💰' },
  { name: 'support', label: 'Support', icon: '🎧' },
  { name: 'education', label: 'Education', icon: '🎓' },
  { name: 'personal', label: 'Personal', icon: '👤' },
  { name: 'archive', label: 'Archive', icon: '📦' }
]

export function WorkspaceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  currentUserPlan = 'free'
}: WorkspaceFormProps) {
  const [emailInput, setEmailInput] = React.useState('')

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      visibility: 'private',
      color: '#6366f1',
      icon: '',
      inviteEmails: [],
      allowCollaboration: true,
      autoBackup: true,
      notificationSettings: {
        newNotes: true,
        comments: true,
        mentions: true
      },
      ...initialData
    }
  })

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form
  const watchedEmails = watch('inviteEmails') || []
  const watchedColor = watch('color')
  const watchedIcon = watch('icon')
  const watchedVisibility = watch('visibility')

  const handleFormSubmit = async (data: WorkspaceFormData) => {
    try {
      await onSubmit(data)
      if (mode === 'create') {
        form.reset()
        toast.success('Workspace created successfully! 🎉')
      } else {
        toast.success('Workspace updated successfully! ✨')
      }
    } catch (error) {
      toast.error(mode === 'create' ? 'Failed to create workspace' : 'Failed to update workspace')
    }
  }

  const addEmail = () => {
    const email = emailInput.trim()
    if (email && !watchedEmails.includes(email) && z.string().email().safeParse(email).success) {
      setValue('inviteEmails', [...watchedEmails, email])
      setEmailInput('')
    } else if (email && !z.string().email().safeParse(email).success) {
      toast.error('Please enter a valid email address')
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setValue('inviteEmails', watchedEmails.filter(email => email !== emailToRemove))
  }

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }

  const isFeatureLocked = (feature: 'team' | 'public' | 'advanced') => {
    if (feature === 'team' && currentUserPlan === 'free') return true
    if (feature === 'public' && currentUserPlan !== 'team') return true
    if (feature === 'advanced' && currentUserPlan === 'free') return true
    return false
  }

  const visibilityOptions = [
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can access this workspace',
      icon: <Lock className="h-4 w-4" />,
      locked: false
    },
    {
      value: 'team',
      label: 'Team',
      description: 'Invite team members to collaborate',
      icon: <Users className="h-4 w-4" />,
      locked: isFeatureLocked('team')
    },
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone with the link can view',
      icon: <Globe className="h-4 w-4" />,
      locked: isFeatureLocked('public')
    }
  ]

  return (
    <Card className="w-full max-w-3xl mx-auto">
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
                <Folder className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-fg">
                {mode === 'create' ? 'Create New Workspace' : 'Edit Workspace'}
              </h2>
              <p className="text-sm text-fg-secondary">
                {mode === 'create' 
                  ? 'Create a collaborative space for your notes and team'
                  : 'Update workspace settings and permissions'
                }
              </p>
            </div>
          </div>
          
          {currentUserPlan === 'team' && (
            <Badge variant="gradient" className="gap-2">
              <Crown className="h-3 w-3" />
              Team Plan
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-fg border-b border-neutral-3 pb-2">
              Basic Information
            </h3>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-fg-secondary font-medium">
                Workspace Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter workspace name..."
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
                placeholder="Describe the purpose of this workspace..."
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
                {watch('description')?.length || 0} / 500 characters
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-fg border-b border-neutral-3 pb-2">
              Appearance
            </h3>

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
          </div>

          {/* Privacy & Collaboration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-fg border-b border-neutral-3 pb-2">
              Privacy & Collaboration
            </h3>

            {/* Visibility Settings */}
            <div className="space-y-3">
              <Label className="text-fg-secondary font-medium">
                Workspace Visibility <span className="text-red-500">*</span>
              </Label>
              
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {visibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "p-4 border rounded-lg text-left transition-all relative",
                          field.value === option.value 
                            ? "border-brand-500 bg-brand-50" 
                            : "border-neutral-3 hover:border-neutral-4",
                          option.locked && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !option.locked && field.onChange(option.value)}
                        disabled={isLoading || option.locked}
                      >
                        {option.locked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-4 w-4 text-neutral-6" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-2">
                          {option.icon}
                          <span className="font-medium text-fg">{option.label}</span>
                          {option.locked && (
                            <Badge variant="warning" size="xs">Pro</Badge>
                          )}
                        </div>
                        <p className="text-sm text-fg-secondary">{option.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Team Invitation (only for team/public workspaces) */}
            {(watchedVisibility === 'team' || watchedVisibility === 'public') && !isFeatureLocked('team') && (
              <div className="space-y-3">
                <Label className="text-fg-secondary font-medium">
                  Invite Team Members
                </Label>
                
                {/* Email Input */}
                <div className="flex gap-2">
                  <Input
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={handleEmailKeyPress}
                    placeholder="Enter email address..."
                    leftIcon={<Mail className="h-4 w-4" />}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addEmail}
                    disabled={!emailInput.trim() || isLoading}
                    className="px-4"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Email Display */}
                {watchedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="gap-2 pl-3 pr-2 py-1"
                      >
                        <Mail className="h-3 w-3" />
                        {email}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmail(email)}
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
            )}

            {/* Collaboration Settings */}
            <div className="space-y-3">
              <Label className="text-fg-secondary font-medium">
                Collaboration Settings
              </Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowCollaboration"
                    className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                    disabled={isLoading || isFeatureLocked('team')}
                    {...register('allowCollaboration')}
                  />
                  <div>
                    <Label 
                      htmlFor="allowCollaboration" 
                      className="text-sm text-fg cursor-pointer font-medium"
                    >
                      Enable Collaboration
                      {isFeatureLocked('team') && <Badge variant="warning" size="xs" className="ml-2">Pro</Badge>}
                    </Label>
                    <p className="text-xs text-fg-secondary">
                      Allow team members to edit notes and leave comments
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoBackup"
                    className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                    disabled={isLoading}
                    {...register('autoBackup')}
                  />
                  <div>
                    <Label 
                      htmlFor="autoBackup" 
                      className="text-sm text-fg cursor-pointer font-medium"
                    >
                      Auto Backup
                    </Label>
                    <p className="text-xs text-fg-secondary">
                      Automatically backup workspace data daily
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-fg border-b border-neutral-3 pb-2">
              Notification Settings
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="newNotes"
                  className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                  disabled={isLoading}
                  {...register('notificationSettings.newNotes')}
                />
                <Label htmlFor="newNotes" className="text-sm text-fg cursor-pointer">
                  Notify me when new notes are added
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="comments"
                  className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                  disabled={isLoading}
                  {...register('notificationSettings.comments')}
                />
                <Label htmlFor="comments" className="text-sm text-fg cursor-pointer">
                  Notify me about comments and replies
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="mentions"
                  className="h-4 w-4 rounded border-neutral-6 text-brand-600 focus:ring-brand-500"
                  disabled={isLoading}
                  {...register('notificationSettings.mentions')}
                />
                <Label htmlFor="mentions" className="text-sm text-fg cursor-pointer">
                  Notify me when I'm mentioned
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-3">
            <div className="text-sm text-fg-secondary">
              {currentUserPlan === 'free' && 'Upgrade to Pro for advanced collaboration features'}
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
                {mode === 'create' ? 'Create Workspace' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Hook for easy form usage
export function useWorkspaceForm(
  options: {
    mode?: 'create' | 'edit'
    initialData?: Partial<WorkspaceFormData>
    onSuccess?: () => void
    currentUserPlan?: 'free' | 'pro' | 'team'
  } = {}
) {
  const { mode = 'create', initialData, onSuccess, currentUserPlan = 'free' } = options

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      visibility: 'private',
      color: '#6366f1',
      icon: '',
      inviteEmails: [],
      allowCollaboration: true,
      autoBackup: true,
      notificationSettings: {
        newNotes: true,
        comments: true,
        mentions: true
      },
      ...initialData
    }
  })

  const handleSubmit = async (data: WorkspaceFormData) => {
    // This would integrate with your API
    console.log('Submitting workspace:', data)
    onSuccess?.()
  }

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isLoading: false, // Replace with actual loading state
    currentUserPlan
  }
}
