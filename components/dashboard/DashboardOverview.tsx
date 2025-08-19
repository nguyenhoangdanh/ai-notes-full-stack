'use client'

import { PlusIcon, BookOpenIcon, FolderIcon, SparklesIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { ResponsiveGrid } from '../common/ResponsiveGrid'
import { ResponsiveContainer } from '../common/ResponsiveContainer'

export function DashboardOverview() {
  const router = useRouter()

  const quickActions = [
    {
      title: 'Create Note',
      description: 'Start writing with AI assistance',
      icon: PlusIcon,
      href: '/notes/create',
      gradient: 'from-primary to-primary/80',
      badge: 'Popular'
    },
    {
      title: 'Browse Notes',
      description: 'Search and organize your notes',
      icon: BookOpenIcon,
      href: '/notes',
      gradient: 'from-emerald-500 to-emerald-600',
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
      description: 'AI-powered note taking with automatic categorization and intelligent suggestions',
      items: ['Auto-categorization', 'Content suggestions', 'Smart summaries']
    },
    {
      title: 'Productivity Tools',
      description: 'Built-in tools to help you stay focused and organized with your workflow',
      items: ['Task management', 'Pomodoro timer', 'Calendar integration']
    },
    {
      title: 'Collaboration',
      description: 'Share and collaborate on notes with your team in real-time',
      items: ['Real-time editing', 'Comments', 'Permission management']
    },
    {
      title: 'Mobile Ready',
      description: 'Access your notes anywhere with mobile-optimized features and offline sync',
      items: ['Voice notes', 'Offline sync', 'Location tagging']
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Superhuman background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_70%)] opacity-8" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_70%)] opacity-6" />
      
      <ResponsiveContainer padding="md" mobilePadding="sm" className="py-6 xs:py-4 sm:py-8 space-y-8 xs:space-y-6 sm:space-y-12 relative z-10">
        {/* Superhuman Welcome Section */}
        <div className="relative text-center space-y-4 xs:space-y-3 sm:space-y-6 py-8 xs:py-6 sm:py-12">
          <div className="space-y-3 xs:space-y-2 sm:space-y-4 animate-superhuman-fade-in">
            <Badge variant="secondary" className="mb-2 xs:mb-1 sm:mb-4 text-xs xs:text-sm px-4 xs:px-6 py-2 rounded-full bg-primary/10 text-primary border-primary/20 superhuman-glow">
              ✨ Powered by Advanced AI
            </Badge>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                AI Notes
              </span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 xs:px-2 sm:px-0">
              Your intelligent note-taking companion. Capture ideas, organize thoughts, and enhance your productivity with the power of AI.
            </p>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center items-center pt-4 xs:pt-6 px-4 xs:px-0 animate-superhuman-slide-up">
            <Button 
              size="lg" 
              onClick={() => router.push('/notes/create')}
              className="w-full xs:w-auto px-6 xs:px-8 py-3 text-base xs:text-lg group rounded-full superhuman-gradient superhuman-glow"
            >
              <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 superhuman-transition" />
              <span className="xs:hidden">Create Note</span>
              <span className="hidden xs:inline">Create Your First Note</span>
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 superhuman-transition" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/notes')}
              className="w-full xs:w-auto px-6 xs:px-8 py-3 text-base xs:text-lg rounded-full superhuman-glass border-border/30 superhuman-hover"
            >
              Explore Features
            </Button>
          </div>
        </div>

        {/* Superhuman Quick Actions */}
        <div className="space-y-4 xs:space-y-6">
          <div className="text-center px-4 xs:px-0">
            <h2 className="text-2xl xs:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Quick Actions</h2>
            <p className="text-sm xs:text-base text-muted-foreground">Jump right into your most common tasks</p>
          </div>
          
          <ResponsiveGrid cols={{ default: 1, xs: 2, lg: 4 }} gap="lg">
            {quickActions.map((action, index) => (
              <Card 
                key={action.title} 
                variant="glass"
                className="group cursor-pointer border-border/30 superhuman-hover superhuman-glow relative overflow-hidden animate-superhuman-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={action.href} className="block p-4 xs:p-6">
                  {action.badge && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 right-3 text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20 rounded-full"
                    >
                      {action.badge}
                    </Badge>
                  )}
                  
                  <div className="text-center space-y-3 xs:space-y-4">
                    <div className={cn(
                      "w-12 xs:w-16 h-12 xs:h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 xs:mb-4 bg-gradient-to-br shadow-lg superhuman-transition",
                      action.gradient,
                      "group-hover:scale-110 group-hover:shadow-xl"
                    )}>
                      <action.icon className="h-6 xs:h-8 w-6 xs:w-8 text-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-base xs:text-lg font-semibold group-hover:text-primary superhuman-transition">
                        {action.title}
                      </h3>
                      <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 superhuman-transition rounded-2xl" />
                </Link>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Superhuman Features Overview */}
        <div className="space-y-6 xs:space-y-8">
          <div className="text-center space-y-3 xs:space-y-4 px-4 xs:px-0">
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-base xs:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need for intelligent note-taking and productivity
            </p>
          </div>

          <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="glass"
                className="group superhuman-hover border-border/30 p-6 xs:p-8 animate-superhuman-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="space-y-4 xs:space-y-6">
                  <div className="space-y-2 xs:space-y-3">
                    <h3 className="text-xl xs:text-2xl font-bold group-hover:text-primary superhuman-transition">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-base xs:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 xs:space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <div 
                        key={item} 
                        className="flex items-center group-hover:translate-x-1 superhuman-transition" 
                        style={{transitionDelay: `${itemIndex * 50}ms`}}
                      >
                        <div className="flex-shrink-0 w-5 xs:w-6 h-5 xs:h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 xs:mr-4 superhuman-glow">
                          <CheckCircleIcon className="w-3 xs:w-4 h-3 xs:h-4 text-primary" />
                        </div>
                        <span className="text-foreground font-medium text-sm xs:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Superhuman CTA */}
        <div className="relative mx-4 xs:mx-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/8 to-accent/5 rounded-3xl superhuman-glass" />
          <div className="relative text-center space-y-4 xs:space-y-6 py-12 xs:py-16 px-6 xs:px-8">
            <div className="space-y-3 xs:space-y-4">
              <h3 className="text-2xl xs:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Ready to Transform Your Note-Taking?
              </h3>
              <p className="text-base xs:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who have revolutionized their productivity with AI-powered notes
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                onClick={() => router.push('/notes/create')}
                className="w-full xs:w-auto px-8 xs:px-10 py-3 xs:py-4 text-base xs:text-lg group rounded-full superhuman-gradient superhuman-glow shadow-lg"
              >
                <PlusIcon className="h-5 xs:h-6 w-5 xs:w-6 mr-2 group-hover:scale-110 superhuman-transition" />
                <span className="xs:hidden">Start Creating</span>
                <span className="hidden xs:inline">Start Creating Now</span>
                <ArrowRightIcon className="h-4 xs:h-5 w-4 xs:w-5 ml-2 group-hover:translate-x-1 superhuman-transition" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/ai/chat')}
                className="w-full xs:w-auto px-8 xs:px-10 py-3 xs:py-4 text-base xs:text-lg rounded-full superhuman-glass border-border/30 superhuman-hover"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Try AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
