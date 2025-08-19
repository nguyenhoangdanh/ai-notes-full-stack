'use client'

import { CheckCircle, Clock, Calendar, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export default function ProductivityPage() {
  const tools = [
    {
      title: 'Tasks',
      description: 'Manage your tasks and to-dos with smart organization',
      icon: CheckCircle,
      href: '/productivity/tasks',
      color: 'bg-green-500',
      features: ['Smart prioritization', 'Due date tracking', 'Progress monitoring']
    },
    {
      title: 'Pomodoro Timer',
      description: 'Stay focused with time-boxed work sessions',
      icon: Clock,
      href: '/productivity/pomodoro',
      color: 'bg-red-500',
      features: ['25-minute focus sessions', 'Break reminders', 'Session tracking']
    },
    {
      title: 'Calendar',
      description: 'Schedule and track important events and deadlines',
      icon: Calendar,
      href: '/productivity/calendar',
      color: 'bg-blue-500',
      features: ['Event scheduling', 'Deadline tracking', 'Calendar integration']
    },
    {
      title: 'Review System',
      description: 'Regular review of your notes and learning progress',
      icon: BookOpen,
      href: '/productivity/review',
      color: 'bg-purple-500',
      features: ['Spaced repetition', 'Knowledge retention', 'Progress analytics']
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Productivity Tools</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Boost your productivity with integrated tools designed to help you stay focused and organized.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Card key={tool.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{tool.description}</p>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Features:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link href={tool.href}>
                <Button className="w-full">
                  Open {tool.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Productivity Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">Tasks Completed Today</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-muted-foreground">Pomodoro Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">Calendar Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-muted-foreground">Review Sessions</div>
          </div>
        </div>
      </div>
    </div>
  )
}