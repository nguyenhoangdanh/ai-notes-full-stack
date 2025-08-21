'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { AuthScreen } from '../components/auth/AuthScreen'
import { toast } from 'sonner'
import { initializeApiClient } from '../lib/api-config'
import { Sparkles, ArrowRight, Users, FileText, Clock, Zap, Brain, Shield } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { GradientCallout } from '../components/ui/GradientCallout'
import { Badge } from '../components/ui/Badge'

function LoadingScreen({ title, description, progress }: { 
  title: string
  description: string 
  progress: number 
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float-subtle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary-600/10 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative text-center space-y-8 max-w-md mx-auto px-6 z-10">
        {/* Loading spinner */}
        <div className="relative mx-auto">
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary-600/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple/60 animate-spin" style={{ animationDelay: '300ms' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gradient">
              AI Notes
            </h1>
            <p className="text-xl font-semibold text-text">{title}</p>
          </div>
          <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
            {description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-bg-elev-2 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-grad-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <p className="text-xs text-text-muted">{progress}% complete</p>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float-subtle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary-600/10 rounded-full blur-2xl animate-float-subtle" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="container-modern">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 glass rounded-xl border border-glass-border">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gradient">AI Notes</span>
              <Badge variant="ai" size="sm">Powered by AI</Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="md">
                Demo
              </Button>
              <Button variant="ghost" size="md">
                Features
              </Button>
              <Button variant="ghost" size="md">
                Pricing
              </Button>
              <Button variant="secondary" size="md">
                Sign In
              </Button>
              <Button variant="cta" size="md">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container-modern text-center">
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge variant="ai" size="lg" className="animate-pulse-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Advanced AI
              </Badge>
            </div>
            
            {/* Main headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Your <span className="text-gradient">AI-Powered</span>
                <br />
                Note-Taking
                <br />
                <span className="text-gradient-cta">Companion</span>
              </h1>
              
              <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
                Transform your thoughts into organized knowledge. AI Notes helps you 
                capture, organize, and discover insights from your notes with 
                intelligent search and AI-powered assistance.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button 
                variant="cta" 
                size="lg" 
                icon={ArrowRight}
                iconPosition="right"
                className="shadow-glow animate-pulse-glow"
              >
                Get Started Free
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                icon={Sparkles}
              >
                Try Interactive Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <StatCard
                title="Happy Users"
                value="10K+"
                icon={Users}
                className="glass border border-glass-border"
              />
              <StatCard
                title="Notes Created"
                value="1M+"
                icon={FileText}
                className="glass border border-glass-border"
              />
              <StatCard
                title="Uptime"
                value="99.9%"
                icon={Clock}
                className="glass border border-glass-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="relative z-10 py-24">
        <div className="container-modern">
          <div className="space-y-16">
            {/* Section header */}
            <div className="text-center space-y-4">
              <Badge variant="ai" size="md">
                <Brain className="w-4 h-4 mr-2" />
                AI Features
              </Badge>
              <h2 className="text-4xl font-bold text-text">
                Intelligence That <span className="text-gradient">Amplifies</span> Your Thinking
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Our AI doesn't just store your notes—it understands them, connects them, 
                and helps you discover patterns you never knew existed.
              </p>
            </div>

            {/* AI Features Callout */}
            <GradientCallout
              variant="ai"
              size="lg"
              title="AI-Powered Auto-Categorization"
              description="Our intelligent system analyzes your notes and automatically organizes them into meaningful categories, finding connections between your ideas that you might have missed."
              badge={{ text: "AI-Powered", variant: "ai" }}
              action={{
                label: "Experience AI Magic",
                onClick: () => {},
                icon: Sparkles,
                variant: "primary"
              }}
              secondaryAction={{
                label: "Learn More",
                onClick: () => {}
              }}
            />

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="panel-glass p-6 space-y-4 hover-lift">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-600/10 to-purple/10 border border-glass-border w-fit">
                  <Brain className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Smart Search</h3>
                  <p className="text-text-muted">Find anything across your notes using natural language. Our AI understands context and intent.</p>
                </div>
              </div>

              <div className="panel-glass p-6 space-y-4 hover-lift">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-green-400/10 border border-glass-border w-fit">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Instant Summaries</h3>
                  <p className="text-text-muted">Get AI-generated summaries of your notes, meetings, and documents in seconds.</p>
                </div>
              </div>

              <div className="panel-glass p-6 space-y-4 hover-lift">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple/10 to-violet-400/10 border border-glass-border w-fit">
                  <Shield className="w-6 h-6 text-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Privacy First</h3>
                  <p className="text-text-muted">Your notes are encrypted and secure. AI processing happens locally when possible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-border-soft">
        <div className="container-modern">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 glass rounded-xl border border-glass-border">
                <Sparkles className="h-5 w-5 text-primary-600" />
              </div>
              <span className="font-bold text-gradient">AI Notes</span>
              <Badge variant="ai" size="sm">v1.0 Beta</Badge>
            </div>
            
            <div className="text-sm text-text-muted">
              © 2024 AI Notes. Built with intelligence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AppContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <LoadingScreen 
        title="Loading your workspace..."
        description="Preparing your intelligent workspace with AI-powered features"
        progress={75}
      />
    )
  }

  if (!user) {
    return <LandingPage />
  }

  // Will redirect to dashboard
  return null
}

export default function HomePage() {
  const [isApiInitialized, setIsApiInitialized] = useState(false)
  const [initProgress, setInitProgress] = useState(0)

  useEffect(() => {
    // Simulate initialization progress
    const progressSteps = [
      { progress: 20, delay: 200 },
      { progress: 45, delay: 400 },
      { progress: 70, delay: 600 },
      { progress: 100, delay: 800 },
    ]

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => setInitProgress(progress), delay)
    })

    // Initialize the API client
    setTimeout(() => {
      initializeApiClient()

      // Show offline mode notification if no backend is configured
      const hasBackend = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!hasBackend && process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          toast.info('Running in offline mode - all data is stored locally', {
            duration: 5000,
            description: 'Connect a backend server to enable sync across devices',
            action: {
              label: 'Learn more',
              onClick: () => window.open('/docs/offline-mode', '_blank')
            }
          })
        }, 2000)
      }

      setIsApiInitialized(true)
    }, 1000)
  }, [])

  if (!isApiInitialized) {
    return (
      <LoadingScreen 
        title="Initializing platform..."
        description="Setting up your intelligent workspace and connecting services"
        progress={initProgress}
      />
    )
  }

  return <AppContent />
}
