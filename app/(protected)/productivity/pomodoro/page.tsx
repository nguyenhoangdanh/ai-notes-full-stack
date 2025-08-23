'use client'
import { Button, Card, CardContent, CardHeader } from '@/components'
import { CardTitle } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Square } from 'lucide-react'

import { useState, useEffect } from 'react'

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Session complete
      setIsRunning(false)
      if (!isBreak) {
        setSessions(prev => prev + 1)
        setIsBreak(true)
        setTimeLeft(5 * 60) // 5 minute break
      } else {
        setIsBreak(false)
        setTimeLeft(25 * 60) // Back to work
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isBreak])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60)
  }

  const totalTime = isBreak ? 5 * 60 : 25 * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
        <p className="text-muted-foreground">
          Stay focused with 25-minute work sessions
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-primary">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="mt-4" />
            </div>

            <div className="flex justify-center space-x-2">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="secondary">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={handleReset} size="lg" variant="secondary">
                <Square className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Sessions completed today: <span className="font-semibold">{sessions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
