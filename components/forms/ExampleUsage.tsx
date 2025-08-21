'use client'

import React, { useState } from 'react'
import { NoteForm, CategoryForm, WorkspaceForm } from './index'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { 
  FileText, 
  Tag, 
  Folder,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

export function FormsExampleUsage() {
  const [activeForm, setActiveForm] = useState<'note' | 'category' | 'workspace' | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Example data for editing
  const exampleNoteData = {
    title: 'My Important Note',
    content: 'This is the content of my note with some important information.',
    tags: ['important', 'work', 'meeting'],
    categoryId: '1',
    workspaceId: '1',
    isPublic: false,
    priority: 'high' as const
  }

  const exampleCategoryData = {
    name: 'Work Projects',
    description: 'All work-related project notes and documentation',
    color: '#6366f1',
    icon: 'work',
    keywords: ['work', 'project', 'client', 'deadline'],
    isAuto: false
  }

  const exampleWorkspaceData = {
    name: 'Product Team',
    description: 'Collaborative workspace for the product development team',
    visibility: 'team' as const,
    color: '#8b5cf6',
    icon: 'team',
    inviteEmails: ['john@example.com', 'jane@example.com'],
    allowCollaboration: true,
    autoBackup: true,
    notificationSettings: {
      newNotes: true,
      comments: true,
      mentions: true
    }
  }

  // Mock data for dropdowns
  const availableCategories = [
    { id: '1', name: 'Personal' },
    { id: '2', name: 'Work' },
    { id: '3', name: 'Projects' }
  ]

  const availableWorkspaces = [
    { id: '1', name: 'Personal Workspace' },
    { id: '2', name: 'Team Workspace' },
    { id: '3', name: 'Client Projects' }
  ]

  const handleSubmit = async (data: any, type: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`${type} ${editMode ? 'updated' : 'created'}:`, data)
    toast.success(`${type} ${editMode ? 'updated' : 'created'} successfully!`)
    setActiveForm(null)
    setEditMode(false)
  }

  const handleCancel = () => {
    setActiveForm(null)
    setEditMode(false)
  }

  const FormComponent = ({ type }: { type: 'note' | 'category' | 'workspace' }) => {
    switch (type) {
      case 'note':
        return (
          <NoteForm
            mode={editMode ? 'edit' : 'create'}
            initialData={editMode ? exampleNoteData : undefined}
            onSubmit={(data) => handleSubmit(data, 'Note')}
            onCancel={handleCancel}
            availableCategories={availableCategories}
            availableWorkspaces={availableWorkspaces}
          />
        )
      case 'category':
        return (
          <CategoryForm
            mode={editMode ? 'edit' : 'create'}
            initialData={editMode ? exampleCategoryData : undefined}
            onSubmit={(data) => handleSubmit(data, 'Category')}
            onCancel={handleCancel}
          />
        )
      case 'workspace':
        return (
          <WorkspaceForm
            mode={editMode ? 'edit' : 'create'}
            initialData={editMode ? exampleWorkspaceData : undefined}
            onSubmit={(data) => handleSubmit(data, 'Workspace')}
            onCancel={handleCancel}
            currentUserPlan="team"
          />
        )
      default:
        return null
    }
  }

  if (activeForm) {
    return (
      <div className="p-8">
        <FormComponent type={activeForm} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-fg">
          CRUD Forms with React Hook Form & Zod
        </h1>
        <p className="text-fg-secondary max-w-2xl mx-auto">
          Complete form examples with validation, error handling, and modern UI components.
          Each form includes comprehensive validation, real-time feedback, and accessibility features.
        </p>
        <Badge variant="success" className="gap-2">
          ✅ Production Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Note Form Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-fg">Note Form</h3>
                <p className="text-sm text-fg-secondary">Create and edit notes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-fg-secondary">
              <p>• Rich text content editing</p>
              <p>• Tag management system</p>
              <p>• Category & workspace selection</p>
              <p>• Priority levels</p>
              <p>• Privacy settings</p>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => {
                  setActiveForm('note')
                  setEditMode(false)
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Note
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveForm('note')
                  setEditMode(true)
                }}
                className="w-full gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Form Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-fg">Category Form</h3>
                <p className="text-sm text-fg-secondary">Organize with categories</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-fg-secondary">
              <p>• Color & icon selection</p>
              <p>• Keyword management</p>
              <p>• AI auto-generation</p>
              <p>• Custom descriptions</p>
              <p>• Smart validation</p>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => {
                  setActiveForm('category')
                  setEditMode(false)
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveForm('category')
                  setEditMode(true)
                }}
                className="w-full gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Form Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Folder className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-fg">Workspace Form</h3>
                <p className="text-sm text-fg-secondary">Collaborative spaces</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-fg-secondary">
              <p>• Team collaboration settings</p>
              <p>• Privacy controls</p>
              <p>• Member invitations</p>
              <p>• Notification preferences</p>
              <p>• Plan-based features</p>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => {
                  setActiveForm('workspace')
                  setEditMode(false)
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveForm('workspace')
                  setEditMode(true)
                }}
                className="w-full gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Example
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="bg-gradient-to-r from-brand-50 to-purple-50 border-brand-200">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-fg mb-4">
            ✨ Form Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-fg">React Hook Form</h4>
              <p className="text-sm text-fg-secondary">
                Performant forms with minimal re-renders and great UX
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-fg">Zod Validation</h4>
              <p className="text-sm text-fg-secondary">
                Type-safe schema validation with detailed error messages
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-fg">Accessibility</h4>
              <p className="text-sm text-fg-secondary">
                ARIA labels, keyboard navigation, and screen reader support
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-fg">Modern UI</h4>
              <p className="text-sm text-fg-secondary">
                Beautiful components with animations and responsive design
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-fg">Usage Example</h3>
        </CardHeader>
        <CardContent>
          <pre className="bg-neutral-2 rounded-lg p-4 text-sm overflow-x-auto">
            <code>{`import { NoteForm, CategoryForm, WorkspaceForm } from '@/components/forms'

// Simple usage
function CreateNotePage() {
  const handleSubmit = async (data) => {
    await api.createNote(data)
    router.push('/notes')
  }

  return (
    <NoteForm
      mode="create"
      onSubmit={handleSubmit}
      availableCategories={categories}
      availableWorkspaces={workspaces}
    />
  )
}

// With custom hook
function EditNotePage({ noteId }) {
  const { form, handleSubmit, isLoading } = useNoteForm({
    mode: 'edit',
    initialData: note,
    onSuccess: () => router.push('/notes')
  })

  return <NoteForm {...form} />
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
