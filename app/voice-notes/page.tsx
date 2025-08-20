'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Mic, Upload, Play, Pause, Download, Trash2, Clock, FileAudio } from 'lucide-react'
import { useVoiceNotes, useCreateVoiceNote } from '@/hooks/use-features'

export default function VoiceNotesPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { data: voiceNotes, isLoading: loadingNotes } = useVoiceNotes()
  // TODO: Add useVoiceNoteStats to use-features.ts
  const stats = null
  const loadingStats = false
  
  // TODO: Add useUploadVoiceNote and useDeleteVoiceNote to use-features.ts
  const uploadMutation = { 
    mutate: (data: any) => console.log('Upload:', data),
    isPending: false,
    isError: false,
    error: null
  }
  const deleteMutation = { 
    mutate: (id: string) => console.log('Delete:', id),
    isPending: false,
    isError: false,
    error: null
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadMutation.mutate({ file })
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/2 relative overflow-hidden">
      {/* Superhuman background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-2" />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Superhuman Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Voice Notes
            </h1>
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Record and manage your audio notes
          </p>
        </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{"--"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{"--"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transcribed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{"--"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{"--"}</div>
            </CardContent>
          </Card>
        </div>
      )}

        {/* Upload Section */}
        <Card variant="glass" className="border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Voice Note
            </CardTitle>
            <CardDescription>
              Upload an audio file to create a new voice note
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="flex-1 gap-2 rounded-full superhuman-gradient"
              >
                <Upload className="w-4 h-4" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Audio File'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsRecording(!isRecording)}
                className="flex-1 gap-2 rounded-full superhuman-glass border-border/30"
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Record'}
              </Button>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording... {formatDuration(recordingTime)}</span>
              </div>
            )}
            
            <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Voice Notes List */}
      <Card variant="glass" className="border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-primary" />
            My Voice Notes
          </CardTitle>
          <CardDescription>
            Manage your recorded audio notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingNotes ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-muted/50 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/50 rounded w-1/4"></div>
                    <div className="h-3 bg-muted/30 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-muted/50 rounded"></div>
                </div>
              ))}
            </div>
          ) : !voiceNotes || voiceNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileAudio className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
              <h3 className="text-xl font-semibold mb-3">No voice notes yet</h3>
              <p className="text-muted-foreground">
                Upload an audio file or record a new voice note to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {voiceNotes.map((note, index) => (
                <Card 
                  key={note.id} 
                  className="group cursor-pointer superhuman-hover animate-superhuman-fade-in border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate group-hover:text-primary superhuman-transition">{note.filename}</h3>
                          <Badge variant="outline" className={`text-xs rounded-full ${getStatusColor(note.status)}`}>
                            {note.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(note.duration)}
                          </span>
                          <span>{formatDate(note.createdAt)}</span>
                        </div>
                        {note.transcription && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {note.transcription}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon-sm" className="rounded-full">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="rounded-full">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => deleteMutation.mutate(note.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded-full text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}