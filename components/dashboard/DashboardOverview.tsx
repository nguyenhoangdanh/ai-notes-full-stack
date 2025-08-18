'use client'

import { PlusIcon, BookOpenIcon, FolderIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function DashboardOverview() {
  const router = useRouter()

  const quickActions = [
    {
      title: 'Create Note',
      description: 'Start writing a new note',
      icon: PlusIcon,
      href: '/notes/create',
      color: 'bg-blue-500'
    },
    {
      title: 'Browse Notes',
      description: 'View all your notes',
      icon: BookOpenIcon,
      href: '/notes',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Workspaces',
      description: 'Organize your content',
      icon: FolderIcon,
      href: '/workspaces',
      color: 'bg-purple-500'
    },
    {
      title: 'AI Assistant',
      description: 'Get AI-powered help',
      icon: SparklesIcon,
      href: '/ai/chat',
      color: 'bg-orange-500'
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
    <div className="container mx-auto py-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to AI Notes</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent note-taking companion powered by AI. Capture, organize, and enhance your thoughts with advanced features.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={action.href}>
              <CardHeader className="text-center">
                <div className={`${action.color} w-12 h-12 rounded-lg mx-auto flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {action.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Features Overview */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Powerful Features</h2>
          <p className="text-muted-foreground mt-2">
            Everything you need for intelligent note-taking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Get Started */}
      <div className="text-center space-y-4 py-8">
        <h3 className="text-2xl font-bold">Ready to get started?</h3>
        <p className="text-muted-foreground">
          Create your first note and experience the power of AI-enhanced writing
        </p>
        <Button 
          size="lg" 
          onClick={() => router.push('/notes/create')}
          className="px-8"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Your First Note
        </Button>
      </div>
    </div>
  )
}