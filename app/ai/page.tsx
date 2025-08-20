'use client'

import { motion } from 'framer-motion'
import { PageMeta } from '../../components/seo/PageMeta'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Brain, 
  Sparkles, 
  Zap, 
  MessageSquare, 
  FileText, 
  Network,
  Copy,
  TrendingUp,
  ArrowRight,
  Wand2,
  Target,
  BarChart3,
  Lightbulb,
  Cpu,
  Rocket
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '../../lib/utils'

export const metadata = {
  title: 'AI Assistant - AI Notes',
  description: 'Enhance your productivity with AI-powered features. Get intelligent suggestions, automated summaries, smart content generation, and advanced analytics.',
  keywords: [
    'AI assistant', 'artificial intelligence', 'smart suggestions', 'content generation', 
    'productivity', 'automation', 'machine learning', 'natural language processing',
    'intelligent analysis', 'AI writing', 'smart organization', 'automated insights'
  ],
  openGraph: {
    title: 'AI Assistant - AI Notes | Intelligent Productivity Features',
    description: 'Enhance your productivity with AI-powered features and intelligent automation.',
    type: 'website',
    images: [
      {
        url: '/og-ai.png',
        width: 1200,
        height: 630,
        alt: 'AI Assistant - Intelligent Productivity Features',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Assistant - AI Notes | Intelligent Productivity',
    description: 'Enhance productivity with AI-powered features and intelligent automation.',
    images: ['/twitter-ai.png'],
  },
  alternates: {
    canonical: '/ai',
  },
}

const aiFeatures = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Get instant help with writing, brainstorming, and note organization through natural conversation.',
    href: '/ai/chat',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-100 to-blue-200',
    textColor: 'text-blue-600',
    badge: 'Interactive',
    stats: '24/7 Available'
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
    description: 'Automatically generate concise summaries of your notes and documents with key insights.',
    href: '/summaries',
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-100 to-green-200',
    textColor: 'text-green-600',
    badge: 'Auto-generated',
    stats: '95% Accuracy'
  },
  {
    icon: Network,
    title: 'Intelligent Relations',
    description: 'Discover hidden connections between your notes with AI-powered relationship mapping.',
    href: '/relations',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-100 to-purple-200',
    textColor: 'text-purple-600',
    badge: 'Deep Learning',
    stats: 'Smart Connections'
  },
  {
    icon: Copy,
    title: 'Duplicate Detection',
    description: 'Find and merge duplicate content automatically to keep your workspace clean and organized.',
    href: '/duplicates',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-100 to-orange-200',
    textColor: 'text-orange-600',
    badge: 'Automated',
    stats: '99% Detection Rate'
  }
]

const capabilities = [
  {
    icon: Wand2,
    title: 'Content Enhancement',
    description: 'Improve writing style, grammar, and clarity with AI suggestions.',
    features: ['Grammar correction', 'Style improvements', 'Clarity optimization', 'Tone adjustment']
  },
  {
    icon: Target,
    title: 'Smart Organization',
    description: 'Automatically categorize and tag notes based on content analysis.',
    features: ['Auto-tagging', 'Category suggestions', 'Content classification', 'Semantic grouping']
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get insights into your productivity patterns and content trends.',
    features: ['Usage analytics', 'Productivity metrics', 'Content insights', 'Trend analysis']
  },
  {
    icon: Lightbulb,
    title: 'Idea Generation',
    description: 'Generate new ideas and expand on existing concepts with AI creativity.',
    features: ['Brainstorming', 'Concept expansion', 'Creative suggestions', 'Topic exploration']
  }
]

export default function AIPage() {
  return (
    <>
      <PageMeta
        title="AI Assistant"
        description="Enhance your productivity with AI-powered features. Get intelligent suggestions, automated summaries, smart content generation, and advanced analytics for superior note management."
        keywords={[
          'AI assistant', 'artificial intelligence', 'smart suggestions', 'content generation', 
          'productivity', 'automation', 'machine learning', 'natural language processing',
          'intelligent analysis', 'AI writing', 'smart organization', 'automated insights'
        ]}
        type="website"
        structuredData={{
          '@type': 'SoftwareApplication',
          name: 'AI Assistant',
          description: 'AI-powered productivity features for intelligent note management',
          applicationCategory: 'ProductivityApplication',
          featureList: [
            'AI Chat Assistant',
            'Smart Summaries',
            'Intelligent Relations',
            'Duplicate Detection',
            'Content Enhancement',
            'Advanced Analytics'
          ]
        }}
      />
      <main 
        role="main" 
        aria-label="AI Assistant - Intelligent Productivity Features"
        className="h-full"
        itemScope 
        itemType="https://schema.org/SoftwareApplication"
      >
        <meta itemProp="name" content="AI Assistant" />
        <meta itemProp="description" content="AI-powered productivity features for intelligent note management" />
        <meta itemProp="applicationCategory" content="ProductivityApplication" />
        
        <div className="h-full relative overflow-auto">
          {/* Modern background */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-surface to-brand-50/10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-100)_0%,_transparent_50%)] pointer-events-none opacity-30" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl shadow-3">
                  <Brain className="h-12 w-12 text-brand-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  AI-Powered
                  <span className="text-gradient block">Intelligence</span>
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto">
                  Transform your note-taking experience with cutting-edge artificial intelligence. 
                  Get intelligent suggestions, automated insights, and smart organization that adapts to your workflow.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Badge variant="feature" className="gap-2 px-4 py-2">
                  <Cpu className="h-4 w-4" />
                  Advanced AI Models
                </Badge>
                <Badge variant="outline" className="gap-2 px-4 py-2 border-brand-200 bg-brand-50 text-brand-700">
                  <Rocket className="h-4 w-4" />
                  Real-time Processing
                </Badge>
                <Badge variant="glass" className="gap-2 px-4 py-2">
                  <Zap className="h-4 w-4" />
                  Lightning Fast
                </Badge>
              </div>
            </motion.div>

            {/* Main AI Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-text">Core AI Features</h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                  Explore powerful AI capabilities designed to enhance your productivity and streamline your workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {aiFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Link href={feature.href}>
                        <Card 
                          variant="elevated"
                          interactive
                          hover="lift"
                          className={cn(
                            "group h-full transition-all duration-300 cursor-pointer",
                            "hover:shadow-4 hover:border-brand-300",
                            "bg-gradient-to-br from-surface to-surface-elevated"
                          )}
                        >
                          <CardHeader className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className={cn(
                                "p-3 rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-110",
                                feature.bgColor
                              )}>
                                <Icon className={cn("h-6 w-6", feature.textColor)} />
                              </div>
                              <Badge variant="outline" size="sm" className="text-xs">
                                {feature.badge}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <CardTitle className="text-xl group-hover:text-brand-700 transition-colors">
                                {feature.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-text-muted">
                                <TrendingUp className="h-3 w-3" />
                                <span>{feature.stats}</span>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <CardDescription className="text-text-secondary leading-relaxed">
                              {feature.description}
                            </CardDescription>
                            
                            <div className="flex items-center gap-2 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-sm font-medium">Get started</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* AI Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-text">AI Capabilities</h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                  Discover the full range of intelligent features powered by advanced machine learning algorithms.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {capabilities.map((capability, index) => {
                  const Icon = capability.icon
                  return (
                    <motion.div
                      key={capability.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card variant="glass" className="h-full shadow-3 border border-border-subtle">
                        <CardHeader className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl">
                              <Icon className="h-5 w-5 text-brand-600" />
                            </div>
                            <CardTitle className="text-lg">{capability.title}</CardTitle>
                          </div>
                          <CardDescription className="leading-relaxed">
                            {capability.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-2">
                            {capability.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                <span className="text-sm text-text-secondary">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center space-y-6 py-12"
            >
              <Card variant="glass" className="max-w-2xl mx-auto p-8 shadow-4 border border-brand-200">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-text">Ready to Experience AI-Powered Productivity?</h3>
                    <p className="text-text-secondary leading-relaxed">
                      Start leveraging the power of artificial intelligence to transform your note-taking and boost your productivity today.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/ai/chat">
                      <Button variant="gradient" size="lg" className="gap-2 shadow-3">
                        <MessageSquare className="h-5 w-5" />
                        Start AI Chat
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" size="lg" className="gap-2 border-brand-200 hover:bg-brand-50">
                        <Brain className="h-5 w-5" />
                        Explore Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
