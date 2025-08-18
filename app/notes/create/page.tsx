'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, DocumentArrowUpIcon, EyeIcon } from '@heroicons/react/24/outline'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useNotes, useCreateNote } from '../../../hooks/use-notes'
import { useWorkspaces } from '../../../hooks/use-workspaces'
import { toast } from 'sonner'
import { marked } from 'marked'

export default function CreateNotePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: workspaces = [] } = useWorkspaces()
  const createNote = useCreateNote()

  // Set default workspace
  useEffect(() => {
    if (workspaces.length > 0 && !workspaceId) {
      setWorkspaceId(workspaces[0].id)
    }
  }, [workspaces, workspaceId])

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your note')
      return
    }

    if (!workspaceId) {
      toast.error('Please select a workspace')
      return
    }

    setIsSaving(true)
    try {
      const note = await createNote.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        workspaceId,
        tags
      })

      toast.success('Note created successfully!')
      router.push(`/notes/${note.id}`)
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Failed to create note. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm('Are you sure you want to discard this note?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const renderMarkdown = (text: string): string => {
    try {
      return marked(text) as string
    } catch (error) {
      return text
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Note</h1>
            <p className="text-muted-foreground">Write your thoughts and ideas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium border-none px-0 focus-visible:ring-0"
                />
                
                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tags (press Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={isPreview ? 'preview' : 'edit'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger 
                    value="edit" 
                    onClick={() => setIsPreview(false)}
                  >
                    Write
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    onClick={() => setIsPreview(true)}
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    placeholder="Start writing your note... (Markdown supported)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] border-none px-0 focus-visible:ring-0 resize-none"
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-[400px] p-4 border rounded-md bg-muted/20">
                    {content ? (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdown(content) 
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground italic">
                        Nothing to preview yet. Start writing in the Edit tab.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Workspace</label>
                <Select value={workspaceId} onValueChange={setWorkspaceId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Use Markdown for formatting</p>
              <p>• Add tags to organize your notes</p>
              <p>• Use Ctrl+S to save quickly</p>
              <p>• Switch to Preview to see formatted text</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}