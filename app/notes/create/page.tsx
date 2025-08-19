'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Eye, Tag, Folder, Sparkles, BookOpen } from 'lucide-react'
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
import { cn } from '../../../lib/utils'

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Create New Note
              </h1>
              <p className="text-muted-foreground text-lg">
                Capture your thoughts with AI-powered assistance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setIsPreview(!isPreview)}
              className="hidden sm:flex"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              size="lg"
              className="px-6"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isSaving ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="xl:col-span-3">
            <Card variant="elevated" className="overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-card/50">
                <div className="space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Title</span>
                    </div>
                    <Input
                      placeholder="What's on your mind?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xl font-semibold border-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
                    />
                  </div>
                  
                  {/* Tags Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors px-3 py-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag} 
                            <span className="ml-1 text-xs opacity-70">×</span>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add tags (press Enter)..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="text-sm bg-muted/30 border-muted"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={isPreview ? 'preview' : 'edit'} className="w-full">
                  <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50">
                    <TabsList className="grid w-full grid-cols-2 rounded-none border-0 bg-transparent p-0 h-auto">
                      <TabsTrigger 
                        value="edit" 
                        onClick={() => setIsPreview(false)}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 text-sm font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <span>✏️</span>
                          Write
                        </span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="preview" 
                        onClick={() => setIsPreview(true)}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 text-sm font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Preview
                        </span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="edit" className="mt-0 p-6">
                    <Textarea
                      placeholder="✨ Start writing your brilliant ideas... (Markdown supported for formatting)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[500px] border-none px-0 focus-visible:ring-0 resize-none text-base leading-relaxed bg-transparent placeholder:text-muted-foreground/50"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0 p-6">
                    <div className="min-h-[500px]">
                      {content ? (
                        <div 
                          className="prose prose-base max-w-none dark:prose-invert prose-headings:scroll-m-20 prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-pre:overflow-x-auto prose-code:text-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: renderMarkdown(content) 
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <Eye className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-medium text-muted-foreground">
                              Nothing to preview yet
                            </p>
                            <p className="text-sm text-muted-foreground/70">
                              Start writing in the Write tab to see your formatted content here
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings Card */}
            <Card variant="outlined" className="sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Workspace
                    <span className="text-xs text-muted-foreground">(Required)</span>
                  </label>
                  <Select value={workspaceId} onValueChange={setWorkspaceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {workspace.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistance Card */}
            <Card variant="outlined" className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Writing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Use **bold** and *italic* for emphasis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Add # for headings and - for bullet points</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Use tags to organize and find notes easily</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Switch to Preview to see your formatted content</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border/50">
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Assistance Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
