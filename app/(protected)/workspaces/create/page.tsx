'use client'
import { ArrowLeft, Upload } from 'lucide-react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'
import { useCreateWorkspace } from '@/hooks'
import { Button, Card, CardContent, CardHeader, Input, Textarea } from '@/components'
import { CardTitle } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CreateWorkspacePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)

  const createWorkspace = useCreateWorkspace()

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your workspace')
      return
    }

    setIsSaving(true)
    try {
      const workspace = await createWorkspace.mutateAsync({
        name: name.trim(),
      })

      toast.success('Workspace created successfully!')
      router.push(`/workspaces/${workspace.id}`)
    } catch (error) {
      console.error('Error creating workspace:', error)
      toast.error('Failed to create workspace. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
      if (confirm('Are you sure you want to discard this workspace?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Workspace</h1>
            <p className="text-muted-foreground">Organize your notes with workspaces</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isSaving ? 'Creating...' : 'Create Workspace'}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="Enter workspace name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe what this workspace is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the type that best describes this workspace
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Tips for Creating Workspaces</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Use descriptive names that clearly identify the workspace purpose</p>
          <p>• Personal workspaces are great for individual projects and thoughts</p>
          <p>• Team workspaces allow collaboration with others</p>
          <p>• You can change these settings later in workspace settings</p>
        </CardContent>
      </Card>
    </div>
  )
}
