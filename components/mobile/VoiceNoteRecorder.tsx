import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  ArrowLeft, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash, 
  FileText, 
  Download,
  Check,
  Activity
} from 'lucide-react'
import { useOfflineNotes } from '../../contexts/OfflineNotesContext'
import { offlineStorage, VoiceRecording } from '../../lib/offline-storage'
import { useAuthProfile as useProfile } from '../../hooks'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface VoiceNoteRecorderProps {
  onBack: () => void
}

export function VoiceNoteRecorder({ onBack }: VoiceNoteRecorderProps) {
  const { createNote } = useOfflineNotes()
  const { data: user } = useProfile()
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<VoiceRecording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // Load existing recordings
  useEffect(() => {
    loadRecordings()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const loadRecordings = async () => {
    try {
      const voiceRecordings = await offlineStorage.getVoiceRecordings()
      setRecordings(voiceRecordings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('Failed to load recordings:', error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      audioStreamRef.current = stream
      
      // Setup audio context for level monitoring
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
        await saveRecording(audioBlob)
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start time tracking
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start audio level monitoring
      startAudioLevelMonitoring()
      
      toast.success('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
      }
      
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
      
      setAudioLevel(0)
      toast.success('Recording saved')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
      }
    }
  }

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    audioLevelIntervalRef.current = setInterval(() => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(Math.min(100, (average / 255) * 100))
      }
    }, 100)
  }

  const saveRecording = async (audioBlob: Blob) => {
    try {
      const recording: VoiceRecording = {
        id: uuidv4(),
        filename: `voice_${Date.now()}.webm`,
        blob: audioBlob,
        duration: recordingTime,
        createdAt: new Date(),
        syncStatus: 'pending'
      }
      
      await offlineStorage.saveVoiceRecording(recording)
      await loadRecordings()
    } catch (error) {
      console.error('Failed to save recording:', error)
      toast.error('Failed to save recording')
    }
  }

  const playRecording = async (recording: VoiceRecording) => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
    }
    
    const audioUrl = URL.createObjectURL(recording.blob)
    const audio = new Audio(audioUrl)
    audioElementRef.current = audio
    
    audio.onloadedmetadata = () => {
      setSelectedRecording(recording)
      setPlaybackTime(0)
    }
    
    audio.ontimeupdate = () => {
      setPlaybackTime(audio.currentTime)
    }
    
    audio.onended = () => {
      setIsPlaying(false)
      setPlaybackTime(0)
    }
    
    audio.play()
    setIsPlaying(true)
  }

  const pausePlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resumePlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.play()
      setIsPlaying(true)
    }
  }

  const deleteRecording = async (recordingId: string) => {
    try {
      await offlineStorage.deleteVoiceRecording(recordingId)
      await loadRecordings()
      
      if (selectedRecording?.id === recordingId) {
        setSelectedRecording(null)
        if (audioElementRef.current) {
          audioElementRef.current.pause()
        }
      }
      
      toast.success('Recording deleted')
    } catch (error) {
      console.error('Failed to delete recording:', error)
      toast.error('Failed to delete recording')
    }
  }

  const transcribeRecording = async (recording: VoiceRecording) => {
    setIsTranscribing(true)
    try {
      // Here you would integrate with a speech-to-text service
      // For now, we'll simulate the transcription
      setTimeout(async () => {
        const mockTranscription = `This is a simulated transcription of the voice recording from ${new Date(recording.createdAt).toLocaleString()}.`
        
        // Create a note with the transcription
        await createNote('Voice Note Transcription', mockTranscription)
        
        setIsTranscribing(false)
        toast.success('Note created from transcription')
      }, 2000)
    } catch (error) {
      console.error('Transcription failed:', error)
      toast.error('Transcription failed')
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <h1 className="text-lg font-semibold">Voice Notes</h1>
          
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="p-6">
        <Card className="p-6 text-center">
          {/* Recording Status */}
          <div className="mb-6">
            {isRecording ? (
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full"
                >
                  <Mic className="h-8 w-8 text-white" />
                </motion.div>
                
                <div>
                  <div className="text-2xl font-mono font-bold text-red-500">
                    {formatTime(recordingTime)}
                  </div>
                  {isPaused && (
                    <Badge variant="outline" className="mt-2">
                      Paused
                    </Badge>
                  )}
                </div>
                
                {/* Audio Level Indicator */}
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={audioLevel} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Audio Level</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full">
                  <Mic className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground">Tap to start recording</p>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {isRecording ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={pauseRecording}
                  className="rounded-full"
                >
                  {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={stopRecording}
                  className="rounded-full"
                >
                  <Square className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={startRecording}
                className="rounded-full px-8"
              >
                <Mic className="h-6 w-6 mr-2" />
                Record
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Recordings List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Recordings</h2>
          
          {recordings.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recordings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <Card key={recording.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(recording.duration)} • {new Date(recording.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {recording.syncStatus === 'pending' && (
                        <div className="h-2 w-2 bg-amber-500 rounded-full" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecording(recording.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedRecording?.id === recording.id && isPlaying) {
                          pausePlayback()
                        } else if (selectedRecording?.id === recording.id && !isPlaying) {
                          resumePlayback()
                        } else {
                          playRecording(recording)
                        }
                      }}
                      className="flex-1"
                    >
                      {selectedRecording?.id === recording.id && isPlaying ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {selectedRecording?.id === recording.id && isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => transcribeRecording(recording)}
                      disabled={isTranscribing}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isTranscribing ? 'Transcribing...' : 'To Note'}
                    </Button>
                  </div>
                  
                  {/* Playback Progress */}
                  {selectedRecording?.id === recording.id && (
                    <div className="mt-3">
                      <Progress 
                        value={(playbackTime / recording.duration) * 100} 
                        className="h-1"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatTime(playbackTime)}</span>
                        <span>{formatTime(recording.duration)}</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}