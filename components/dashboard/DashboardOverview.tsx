'use client'

import { PlusIcon, BookOpenIcon, FolderIcon, SparklesIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'

export function DashboardOverview() {
  const router = useRouter()

  const quickActions = [
    {
      title: 'Create Note',
      description: 'Start writing with AI assistance',
      icon: PlusIcon,
      href: '/notes/create',
      gradient: 'from-blue-500 to-blue-600',
      badge: 'Popular'
    },
    {
      title: 'Browse Notes',
      description: 'Search and organize your notes',
      icon: BookOpenIcon,
      href: '/notes',
      gradient: 'from-green-500 to-green-600',
      badge: null
    },
    {
      title: 'Workspaces',
      description: 'Collaborate and organize projects',
      icon: FolderIcon,
      href: '/workspaces',
      gradient: 'from-purple-500 to-purple-600',
      badge: null
    },
    {
      title: 'AI Assistant',
      description: 'Get intelligent writing help',
      icon: SparklesIcon,
      href: '/ai/chat',
      gradient: 'from-orange-500 to-orange-600',
      badge: 'New'
    }
  ]

  const features = [
    {
      title: 'Smart Notes',
      description: 'AI-powered note taking with automatic categorization and suggestions',
      items: ['Auto-categorization', 'Content suggestions', 'Smart summaries']
    },
    {
      title: 'Productivity Tools',
      description: 'Built-in tools to help you stay focused and organized',
      items: ['Task management', 'Pomodoro timer', 'Calendar integration']
    },
    {
      title: 'Collaboration',
      description: 'Share and collaborate on notes with your team',
      items: ['Real-time editing', 'Comments', 'Permission management']
    },
    {
      title: 'Mobile Ready',
      description: 'Access your notes anywhere with mobile-optimized features',
      items: ['Voice notes', 'Offline sync', 'Location tagging']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Welcome Section */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              ✨ Powered by Advanced AI
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                AI Notes
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your intelligent note-taking companion. Capture ideas, organize thoughts, and enhance your productivity with the power of AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              size="lg"
              onClick={() => router.push('/notes/create')}
              className="px-8 py-3 text-lg group"
            >
              <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Create Your First Note
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/notes')}
              className="px-8 py-3 text-lg"
            >
              Explore Features
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Quick Actions</h2>
            <p className="text-muted-foreground">Jump right into your most common tasks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={action.title}
                variant="elevated"
                className="group cursor-pointer border-0 bg-gradient-to-br from-card/50 to-card hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <Link href={action.href} className="block p-6">
                  {action.badge && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                    >
                      {action.badge}
                    </Badge>
                  )}

                  <div className="text-center space-y-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-gradient-to-br",
                      action.gradient,
                      "group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    )}>
                      <action.icon className="h-8 w-8 text-white" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for intelligent note-taking and productivity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                variant="outlined"
                className="group hover:border-primary/20 hover:bg-card/50 transition-all duration-300 p-8"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <div key={item} className="flex items-center group-hover:translate-x-1 transition-transform duration-200" style={{transitionDelay: `${itemIndex * 50}ms`}}>
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <CheckCircleIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-foreground font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Get Started CTA */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl" />
          <div className="relative text-center space-y-6 py-16 px-8">
            <div className="space-y-4">
              <h3 className="text-3xl lg:text-4xl font-bold">
                Ready to Transform Your Note-Taking?
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who have revolutionized their productivity with AI-powered notes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => router.push('/notes/create')}
                className="px-10 py-4 text-lg group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
              >
                <PlusIcon className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
                Start Creating Now
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/ai/chat')}
                className="px-10 py-4 text-lg border-2 hover:bg-primary/5"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Try AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
