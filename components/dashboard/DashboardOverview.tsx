'use client'

import { Plus, BookOpen, Folder, Sparkles, ArrowRight, CheckCircle, Zap, Target, Users, BarChart3, BrainCircuit, Workflow } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, FeatureCard } from '../ui/card'
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
      icon: Plus,
      href: '/notes/create',
      color: 'brand',
      badge: 'Popular'
    },
    {
      title: 'Browse Notes',
      description: 'Search and organize your notes',
      icon: BookOpen,
      href: '/notes',
      color: 'success',
      badge: null
    },
    {
      title: 'Workspaces',
      description: 'Collaborate and organize projects',
      icon: Folder,
      href: '/workspaces',
      color: 'info',
      badge: null
    },
    {
      title: 'AI Assistant',
      description: 'Get intelligent writing help',
      icon: Sparkles,
      href: '/ai/chat',
      color: 'warning',
      badge: 'New'
    }
  ]

  const features = [
    {
      title: 'Smart Notes',
      description: 'AI-powered note taking with automatic categorization and intelligent suggestions for enhanced productivity.',
      icon: <BrainCircuit />,
      items: ['Auto-categorization', 'Content suggestions', 'Smart summaries', 'Duplicate detection'],
      color: 'brand'
    },
    {
      title: 'Productivity Tools',
      description: 'Built-in tools to help you stay focused and organized with advanced workflow management.',
      icon: <Target />,
      items: ['Task management', 'Pomodoro timer', 'Calendar integration', 'Progress tracking'],
      color: 'success'
    },
    {
      title: 'Team Collaboration',
      description: 'Share and collaborate on notes with your team in real-time with advanced permission controls.',
      icon: <Users />,
      items: ['Real-time editing', 'Comments & reviews', 'Permission management', 'Version history'],
      color: 'info'
    },
    {
      title: 'Advanced Analytics',
      description: 'Track your productivity with detailed insights and analytics to optimize your workflow.',
      icon: <BarChart3 />,
      items: ['Usage analytics', 'Productivity insights', 'Performance metrics', 'Growth tracking'],
      color: 'warning'
    }
  ]

  const colorClasses = {
    brand: {
      bg: 'bg-brand-100',
      text: 'text-brand-600',
      gradient: 'from-brand-500 to-brand-600'
    },
    success: {
      bg: 'bg-success-bg',
      text: 'text-success',
      gradient: 'from-success to-emerald-600'
    },
    info: {
      bg: 'bg-info-bg', 
      text: 'text-info',
      gradient: 'from-info to-blue-600'
    },
    warning: {
      bg: 'bg-warning-bg',
      text: 'text-warning',
      gradient: 'from-warning to-amber-500'
    }
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Modern background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-elevated to-brand-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-100)_0%,_transparent_70%)] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-brand-200)_0%,_transparent_70%)] opacity-25" />
      
      <ResponsiveContainer padding="responsive" className="py-8 xs:py-6 sm:py-12 space-y-12 xs:space-y-8 sm:space-y-16 relative z-10">
        
        {/* Hero Section */}
        <div className="relative text-center space-y-6 xs:space-y-4 sm:space-y-8 py-12 xs:py-8 sm:py-16">
          <div className="space-y-4 xs:space-y-3 sm:space-y-6 animate-fade-in">
            <Badge 
              variant="feature" 
              size="lg"
              className="mb-4 xs:mb-2 sm:mb-6 px-6 py-2 rounded-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="text-gradient-primary block mb-2">
                Welcome to
              </span>
              <span className="text-gradient block">
                AI Notes
              </span>
            </h1>
            
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl text-text-secondary max-w-4xl mx-auto leading-relaxed px-4 xs:px-2 sm:px-0">
              Your intelligent note-taking companion. Capture ideas, organize thoughts, and enhance your productivity with the power of AI.
            </p>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-4 xs:gap-6 justify-center items-center pt-6 xs:pt-8 px-4 xs:px-0 animate-slide-up">
            <Button 
              size="xl" 
              variant="gradient"
              onClick={() => router.push('/notes/create')}
              className="w-full xs:w-auto px-8 py-4 text-lg group shadow-4"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="xs:hidden">Create Note</span>
              <span className="hidden xs:inline">Create Your First Note</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => router.push('/notes')}
              className="w-full xs:w-auto px-8 py-4 text-lg glass"
            >
              Explore Features
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8 xs:space-y-6">
          <div className="text-center px-4 xs:px-0">
            <h2 className="text-3xl xs:text-4xl font-bold mb-3 text-gradient-primary">
              Quick Actions
            </h2>
            <p className="text-lg xs:text-xl text-text-secondary">
              Jump right into your most common tasks
            </p>
          </div>
          
          <ResponsiveGrid cols={{ default: 1, xs: 2, lg: 4 }} gap="lg">
            {quickActions.map((action, index) => (
              <Card 
                key={action.title} 
                variant="elevated"
                interactive
                hover="lift"
                className="group cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={action.href} className="block p-6">
                  {action.badge && (
                    <Badge 
                      variant="success" 
                      size="sm"
                      className="absolute top-4 right-4 z-10"
                    >
                      {action.badge}
                    </Badge>
                  )}
                  
                  <div className="text-center space-y-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2 transition-modern",
                      colorClasses[action.color].bg,
                      "group-hover:scale-110 group-hover:shadow-3"
                    )}>
                      <action.icon className={cn("h-8 w-8", colorClasses[action.color].text)} />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold group-hover:text-brand-600 transition-modern">
                        {action.title}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Features Overview */}
        <div className="space-y-8 xs:space-y-6">
          <div className="text-center space-y-4 px-4 xs:px-0">
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-bold text-gradient-primary">
              Powerful Features
            </h2>
            <p className="text-lg xs:text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Everything you need for intelligent note-taking and productivity
            </p>
          </div>
          
          <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap="lg">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="feature"
                interactive
                hover="scale"
                className="group p-8 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl flex-shrink-0 transition-modern group-hover:scale-110",
                      colorClasses[feature.color].bg
                    )}>
                      <div className={cn("h-6 w-6", colorClasses[feature.color].text)}>
                        {feature.icon}
                      </div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl xs:text-2xl font-bold group-hover:text-brand-600 transition-modern">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <div 
                        key={item} 
                        className="flex items-center group-hover:translate-x-1 transition-modern" 
                        style={{transitionDelay: `${itemIndex * 50}ms`}}
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-success-bg rounded-full flex items-center justify-center mr-3">
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-text font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Testimonials/Social Proof */}
        <Card variant="gradient" className="p-8 sm:p-12 text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl xs:text-3xl lg:text-4xl font-bold text-text">
                Trusted by thousands of professionals
              </h3>
              <p className="text-lg xs:text-xl text-text-secondary max-w-2xl mx-auto">
                Join the growing community of users who have transformed their productivity
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">10K+</div>
                <div className="text-sm text-text-muted">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">1M+</div>
                <div className="text-sm text-text-muted">Notes Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">99.9%</div>
                <div className="text-sm text-text-muted">Uptime</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="relative">
          <Card variant="glass" className="p-8 sm:p-12 text-center border-brand-200">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl xs:text-4xl lg:text-5xl font-bold text-gradient">
                  Ready to Transform Your Note-Taking?
                </h3>
                <p className="text-lg xs:text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                  Join thousands of users who have revolutionized their productivity with AI-powered notes
                </p>
              </div>
              
              <div className="flex flex-col xs:flex-row gap-4 xs:gap-6 justify-center items-center pt-6">
                <Button 
                  size="xl" 
                  variant="gradient"
                  onClick={() => router.push('/notes/create')}
                  className="w-full xs:w-auto px-10 py-4 text-lg group shadow-4"
                >
                  <Plus className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="xs:hidden">Start Creating</span>
                  <span className="hidden xs:inline">Start Creating Now</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={() => router.push('/ai/chat')}
                  className="w-full xs:w-auto px-10 py-4 text-lg glass"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Try AI Assistant
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
