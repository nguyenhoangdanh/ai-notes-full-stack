import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Check, 
  Share, 
  Trash2, 
  Tag, 
  Mic, 
  Bold, 
  Italic, 
  List,
  Camera,
  MapPin,
  Clock
} from '@phosphor-icons/react'
import { OfflineNote } from '@/lib/offline-storage'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface MobileNoteEditorProps {
  note: OfflineNote | null
  onBack: () => void
  onUpdate: (id: string, updates: Partial<OfflineNote>) => Promise<void>
}

export function MobileNoteEditor({ note, onBack, onUpdate }: MobileNoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout>()

  // Load note data
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags || [])
      setHasChanges(false)
    }
  }, [note])

  // Auto-save changes
  useEffect(() => {
    if (hasChanges && note) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
      
      const timeout = setTimeout(async () => {
        await saveChanges()
      }, 1000) // Auto-save after 1 second of inactivity
      
      setAutoSaveTimeout(timeout)
    }
    
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [hasChanges, title, content, tags])

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.warn('Location not available:', error)
      )
    }
  }, [])

  const saveChanges = async () => {
    if (!note || !hasChanges) return

    try {
      await onUpdate(note.id, {
        title: title || 'Untitled',
        content,
        tags,
        updatedAt: new Date()
      })
      setHasChanges(false)
      toast.success('Note saved')
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note')
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setHasChanges(true)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(true)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setNewTag('')
      setHasChanges(true)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    setHasChanges(true)
  }

  const insertText = (textToInsert: string, wrapText = false) => {
    if (!contentRef.current) return

    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newText: string
    if (wrapText && selectedText) {
      newText = content.substring(0, start) + textToInsert + selectedText + textToInsert + content.substring(end)
    } else {
      newText = content.substring(0, start) + textToInsert + content.substring(end)
    }
    
    setContent(newText)
    setHasChanges(true)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + textToInsert.length + (wrapText && selectedText ? selectedText.length : 0)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatText = (format: 'bold' | 'italic' | 'list') => {
    switch (format) {
      case 'bold':
        insertText('**', true)
        break
      case 'italic':
        insertText('*', true)
        break
      case 'list':
        insertText('\n- ')
        break
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsRecording(true)
      
      // Here you would integrate with a speech-to-text service
      // For now, we'll just simulate it
      setTimeout(() => {
        setIsRecording(false)
        toast.success('Voice recording completed')
      }, 3000)
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Microphone access denied')
    }
  }

  const insertCurrentTime = () => {
    const timestamp = new Date().toLocaleString()
    insertText(`\n\n**${timestamp}**\n`)
  }

  const insertLocation = () => {
    if (location) {
      const { latitude, longitude } = location.coords
      insertText(`\n📍 Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`)
    } else {
      toast.error('Location not available')
    }
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No note selected</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={saveChanges}
              disabled={!hasChanges}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title Input */}
        <Input
          ref={titleRef}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="text-lg font-medium border-none bg-transparent p-0 focus-visible:ring-0"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="sticky top-[89px] bg-background/95 backdrop-blur-sm border-b border-border p-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 px-3 flex-shrink-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 px-3 flex-shrink-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('list')}
            className="h-8 px-3 flex-shrink-0"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={startVoiceRecording}
            disabled={isRecording}
            className="h-8 px-3 flex-shrink-0"
          >
            <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 flex-shrink-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCurrentTime}
            className="h-8 px-3 flex-shrink-0"
          >
            <Clock className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLocation}
            className="h-8 px-3 flex-shrink-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 p-4">
        <Textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full resize-none border-none bg-transparent p-0 focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>

      {/* Tags Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Tags</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            className="flex-1 h-8"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag()
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="h-8 px-3"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Note Info */}
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
          <span>Modified: {new Date(note.updatedAt).toLocaleString()}</span>
        </div>
        {note.syncStatus !== 'synced' && (
          <div className="mt-1">
            <span className="text-amber-600">● Pending sync</span>
          </div>
        )}
      </div>
    </div>
  )
}