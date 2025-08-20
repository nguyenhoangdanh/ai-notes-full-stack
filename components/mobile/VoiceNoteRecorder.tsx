'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash,
  Save,
  ArrowLeft,
  Volume2,
  FileAudio,
  Clock,
  Settings,
  Download,
  Share,
  X,
  RotateCcw,
  PenTool,
  Sparkles
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

interface VoiceNoteRecorderProps {
  onBack: () => void
  onSave?: (audioBlob: Blob, transcript?: string) => void
  className?: string
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped'

export function VoiceNoteRecorder({ onBack, onSave, className }: VoiceNoteRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Audio visualization data
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0))

  // Check microphone permission
  useEffect(() => {
    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then(permissionStatus => {
        setPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt')
        
        permissionStatus.onchange = () => {
          setPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt')
        }
      })
      .catch(() => {
        setPermission('prompt')
      })
  }, [])

  // Timer for recording duration
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [recordingState])

  // Audio visualization
  const updateVolumeLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    setVolumeLevel(average / 255)

    // Update visualization data
    const newAudioData = Array.from(dataArray.slice(0, 32)).map(value => value / 255)
    setAudioData(newAudioData)

    animationFrameRef.current = requestAnimationFrame(updateVolumeLevel)
  }, [])

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream

      // Set up audio context for visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      updateVolumeLevel()

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setRecordingState('recording')
      setDuration(0)
      
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
      setPermission('denied')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setRecordingState('stopped')
      toast.success('Recording stopped')
    }
  }

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
    }
  }

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
    }
  }

  // Delete recording
  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscript('')
    setDuration(0)
    setRecordingState('idle')
    toast.success('Recording deleted')
  }

  // Mock transcription (replace with actual speech-to-text service)
  const transcribeAudio = async () => {
    if (!audioBlob) return
    
    setIsTranscribing(true)
    
    // Simulate transcription delay
    setTimeout(() => {
      setTranscript("This is a sample transcription of your voice note. In a real implementation, this would be generated by a speech-to-text service.")
      setIsTranscribing(false)
      toast.success('Transcription completed')
    }, 2000)
  }

  // Save voice note
  const saveVoiceNote = () => {
    if (audioBlob) {
      onSave?.(audioBlob, transcript)
      toast.success('Voice note saved!')
      onBack()
    }
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-b from-bg to-bg-elevated safe-area-top", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-text">Voice Notes</h1>
            <p className="text-sm text-text-muted">Record and transcribe</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-xl"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Recording Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Permission Check */}
        {permission === 'denied' && (
          <Card variant="outlined" className="p-6 text-center max-w-sm">
            <div className="p-4 bg-danger-bg rounded-2xl inline-block mb-4">
              <Mic className="h-8 w-8 text-danger" />
            </div>
            <h3 className="font-semibold text-text mb-2">Microphone Access Required</h3>
            <p className="text-sm text-text-muted mb-4">
              Please allow microphone access in your browser settings to record voice notes.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        )}

        {/* Recording Interface */}
        {permission !== 'denied' && (
          <>
            {/* Audio Visualization */}
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                className={cn(
                  "w-64 h-64 rounded-full border-4 border-border-subtle",
                  recordingState === 'recording' && "border-danger",
                  recordingState === 'paused' && "border-warning"
                )}
                animate={recordingState === 'recording' ? {
                  scale: [1, 1.05, 1],
                  borderColor: ['var(--color-border)', 'var(--color-danger)', 'var(--color-border)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Volume Visualization */}
                <div className="absolute inset-4 rounded-full overflow-hidden bg-bg-muted">
                  {recordingState === 'recording' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-30"
                      animate={{
                        scale: [1, 1 + volumeLevel * 0.3, 1]
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  )}
                  
                  {/* Waveform Visualization */}
                  {recordingState === 'recording' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-end gap-1 h-20">
                        {audioData.slice(0, 16).map((value, index) => (
                          <motion.div
                            key={index}
                            className="w-2 bg-brand-500 rounded-full"
                            animate={{
                              height: Math.max(4, value * 80)
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {recordingState === 'idle' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <Mic className="h-12 w-12 text-text-muted mb-2 mx-auto" />
                      <p className="text-sm text-text-muted">Tap to record</p>
                    </motion.div>
                  )}
                  
                  {(recordingState === 'recording' || recordingState === 'paused') && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className={cn(
                        "text-3xl font-mono font-bold mb-2",
                        recordingState === 'recording' ? "text-danger" : "text-warning"
                      )}>
                        {formatDuration(duration)}
                      </div>
                      
                      <Badge 
                        variant={recordingState === 'recording' ? 'danger' : 'warning'}
                        className="animate-pulse"
                      >
                        <div className="w-2 h-2 rounded-full bg-current mr-2" />
                        {recordingState === 'recording' ? 'Recording' : 'Paused'}
                      </Badge>
                    </motion.div>
                  )}
                  
                  {recordingState === 'stopped' && audioBlob && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <FileAudio className="h-12 w-12 text-success mb-2 mx-auto" />
                      <div className="text-lg font-semibold text-text mb-1">
                        {formatDuration(duration)}
                      </div>
                      <p className="text-sm text-text-muted">Recording complete</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {recordingState === 'idle' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Button
                    onTouchStart={startRecording}
                    onClick={startRecording}
                    variant="gradient"
                    size="xl"
                    className="h-20 w-20 rounded-full shadow-4 hover:shadow-5"
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                </motion.div>
              )}

              {(recordingState === 'recording' || recordingState === 'paused') && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  {recordingState === 'recording' ? (
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      size="lg"
                      className="h-16 w-16 rounded-full"
                    >
                      <Pause className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeRecording}
                      variant="gradient"
                      size="lg"
                      className="h-16 w-16 rounded-full"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  )}

                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="xl"
                    className="h-20 w-20 rounded-full"
                  >
                    <Square className="h-8 w-8" />
                  </Button>
                </motion.div>
              )}

              {recordingState === 'stopped' && audioBlob && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <Button
                    onClick={deleteRecording}
                    variant="outline"
                    size="lg"
                    className="h-14 w-14 rounded-full"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => setRecordingState('idle')}
                    variant="outline"
                    size="lg"
                    className="h-14 w-14 rounded-full"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={saveVoiceNote}
                    variant="gradient"
                    size="xl"
                    className="h-16 w-16 rounded-full shadow-3"
                  >
                    <Save className="h-6 w-6" />
                  </Button>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Transcript Section */}
      {recordingState === 'stopped' && audioBlob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border-subtle bg-surface/50"
        >
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Transcript
              </h3>
              
              {!transcript && (
                <Button
                  onClick={transcribeAudio}
                  variant="outline"
                  size="sm"
                  disabled={isTranscribing}
                  loading={isTranscribing}
                  className="gap-2 rounded-xl"
                >
                  <Sparkles className="h-3 w-3" />
                  {isTranscribing ? 'Transcribing...' : 'Generate'}
                </Button>
              )}
            </div>
            
            {transcript ? (
              <div className="space-y-3">
                <p className="text-text-secondary leading-relaxed">{transcript}</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PenTool className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="p-3 bg-bg-muted rounded-xl inline-block mb-3">
                  <Sparkles className="h-6 w-6 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">
                  Generate a transcript using AI speech recognition
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Quick Actions Bar */}
      <div className="p-4 bg-surface/80 backdrop-blur-sm border-t border-border-subtle safe-area-bottom">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
            <Volume2 className="h-4 w-4" />
            <span className="text-xs">Quality</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Timer</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
            <Download className="h-4 w-4" />
            <span className="text-xs">Export</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex-col gap-1 h-auto py-2">
            <Share className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
