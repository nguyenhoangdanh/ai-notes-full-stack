import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/Badge'
import { 
  ArrowLeft, 
  Check, 
  Share, 
  Trash, 
  Tag, 
  Mic, 
  Bold, 
  Italic, 
  List,
  Camera,
  MapPin,
  Clock
} from 'lucide-react'
import { OfflineNote } from '../../lib/offline-storage'
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
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

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
      <div className="sticky top-0 glass-effect border-b border-border/40 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 w-9 p-0 rounded-xl hover:scale-110 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                Unsaved
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={saveChanges}
              disabled={!hasChanges}
              className="h-9 w-9 p-0 rounded-xl hover:scale-110 transition-transform"
            >
              <Check className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl hover:scale-110 transition-transform"
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
          className="text-xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="sticky top-[89px] glass-effect border-b border-border/40 p-3 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-9 px-3 flex-shrink-0 rounded-xl hover:scale-105 transition-transform"
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
            className="h-9 px-3 flex-shrink-0 rounded-xl hover:scale-105 transition-transform"
          >
            <Mic className={`h-4 w-4 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
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
          className="w-full h-full resize-none border-none bg-transparent p-0 focus-visible:ring-0 text-base leading-relaxed placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Tags Section */}
      <div className="border-t border-border/40 glass-effect p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Tags</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:scale-105 transition-transform bg-primary/10 text-primary border-primary/20"
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
            className="flex-1 h-9 rounded-xl"
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
            className="h-9 px-4 rounded-xl"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Note Info */}
      <div className="border-t border-border/40 glass-effect p-4 text-xs text-muted-foreground bg-muted/30">
        <div className="flex justify-between">
          <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
          <span>Modified: {new Date(note.updatedAt).toLocaleString()}</span>
        </div>
        {note.syncStatus !== 'synced' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-amber-600 font-medium">Pending sync</span>
          </div>
        )}
      </div>
    </div>
  )
}
