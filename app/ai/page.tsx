'use client'

import { SparklesIcon, ChatBubbleLeftIcon, DocumentDuplicateIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export default function AIPage() {
  const features = [
    {
      title: 'AI Chat',
      description: 'Chat with AI about your notes and get intelligent insights',
      icon: ChatBubbleLeftIcon,
      href: '/ai/chat',
      color: 'bg-blue-500',
      status: 'Available'
    },
    {
      title: 'Smart Suggestions',
      description: 'Get AI-powered suggestions to improve your content',
      icon: SparklesIcon,
      href: '/ai/suggestions',
      color: 'bg-purple-500',
      status: 'Available'
    },
    {
      title: 'Auto Summaries',
      description: 'Generate intelligent summaries of your notes',
      icon: DocumentDuplicateIcon,
      href: '/ai/summaries',
      color: 'bg-green-500',
      status: 'Available'
    },
    {
      title: 'Semantic Search',
      description: 'Find notes by meaning, not just keywords',
      icon: MagnifyingGlassIcon,
      href: '/search?mode=semantic',
      color: 'bg-orange-500',
      status: 'Available'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <SparklesIcon className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold">AI Assistant</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enhance your note-taking with powerful AI features. Get insights, suggestions, and intelligent assistance.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <Link href={feature.href}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <span className="text-sm text-green-600 font-medium">{feature.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
                <Button variant="outline" className="mt-4 w-full">
                  Try {feature.title}
                </Button>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">How AI Features Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Privacy First</h4>
            <p className="text-muted-foreground">
              Your notes are processed securely and never stored on external AI services permanently.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Context Aware</h4>
            <p className="text-muted-foreground">
              AI understands the context of your notes and provides relevant, personalized suggestions.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Continuous Learning</h4>
            <p className="text-muted-foreground">
              The AI gets better over time by learning from your writing patterns and preferences.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Always Optional</h4>
            <p className="text-muted-foreground">
              All AI features are optional and can be disabled at any time in your settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}