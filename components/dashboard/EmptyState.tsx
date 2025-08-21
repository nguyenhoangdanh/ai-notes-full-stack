'use client'

import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  FileText,
  Plus,
  Sparkles,
  BookOpen,
  PenTool,
  Lightbulb,
  Zap,
  ArrowRight,
  Play,
  Download,
  Mic,
  Image,
  Upload,
  Users,
  Search,
  X,
  Hash,
  Calendar
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  variant?: 'notes' | 'workspace' | 'search' | 'generic'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'gradient'
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  showTips?: boolean
  showQuickActions?: boolean
  className?: string
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  secondaryAction,
  showTips = true,
  showQuickActions = true,
  className
}: EmptyStateProps) {
  const configs = {
    notes: {
      title: 'No notes yet',
      description: 'Create your first note and start organizing your thoughts with AI-powered insights.',
      icon: FileText,
      primaryAction: {
        label: 'Create Your First Note',
        variant: 'gradient' as const,
        icon: <Plus className="h-4 w-4" />
      },
      secondaryAction: {
        label: 'Import Notes',
        icon: <Upload className="h-4 w-4" />
      },
      tips: [
        { icon: Sparkles, text: 'Use AI to enhance your writing', highlight: true },
        { icon: Mic, text: 'Try voice notes for quick capture' },
        { icon: BookOpen, text: 'Organize with workspaces and tags' },
        { icon: Zap, text: 'Sync across all your devices' }
      ],
      quickActions: [
        { icon: FileText, label: 'Blank Note', description: 'Start from scratch' },
        { icon: Lightbulb, label: 'AI Prompt', description: 'Let AI help you start' },
        { icon: Mic, label: 'Voice Note', description: 'Speak your thoughts' },
        { icon: Image, label: 'Visual Note', description: 'Add images and diagrams' }
      ]
    },
    workspace: {
      title: 'Empty workspace',
      description: 'This workspace is waiting for your first note. Start organizing your ideas here.',
      icon: BookOpen,
      primaryAction: {
        label: 'Add First Note',
        variant: 'default' as const,
        icon: <Plus className="h-4 w-4" />
      },
      tips: [
        { icon: BookOpen, text: 'Workspaces keep your projects organized' },
        { icon: Users, text: 'Invite team members to collaborate' },
        { icon: FileText, text: 'Create templates for consistent notes' }
      ]
    },
    search: {
      title: 'No results found',
      description: 'Try adjusting your search terms or explore our suggestions below.',
      icon: Search,
      primaryAction: {
        label: 'Clear Search',
        variant: 'outline' as const,
        icon: <X className="h-4 w-4" />
      },
      tips: [
        { icon: Sparkles, text: 'Use AI search for semantic matching' },
        { icon: Hash, text: 'Search by tags with #tag-name' },
        { icon: Calendar, text: 'Filter by date ranges' }
      ]
    },
    generic: {
      title: 'Nothing here yet',
      description: 'Get started by creating your first item.',
      icon: FileText,
      primaryAction: {
        label: 'Get Started',
        variant: 'default' as const,
        icon: <Plus className="h-4 w-4" />
      }
    }
  }

  const config = configs[variant]
  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalAction = action || config.primaryAction
  const finalSecondaryAction = secondaryAction || ('secondaryAction' in config ? config.secondaryAction : undefined)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-2xl mx-auto",
        className
      )}
    >
      {/* Main Icon with Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-200/30 to-brand-300/30 rounded-full blur-3xl scale-150" />
          
          {/* Main Icon Container */}
          <div className="relative p-8 bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl border border-brand-200 shadow-3">
            <config.icon className="h-16 w-16 text-brand-600 mx-auto" />
            
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [-2, 2, -2],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2"
            >
              <div className="p-2 bg-brand-200 rounded-xl shadow-2">
                <Sparkles className="h-4 w-4 text-brand-700" />
              </div>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [2, -2, 2],
                rotate: [0, -3, 0, 3, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-1 -left-1"
            >
              <div className="p-1.5 bg-brand-300 rounded-lg shadow-2">
                <Plus className="h-3 w-3 text-brand-800" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Title and Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4 mb-8"
      >
        <h2 className="text-3xl font-bold text-gradient">
          {finalTitle}
        </h2>
        <p className="text-text-secondary text-lg leading-relaxed max-w-md">
          {finalDescription}
        </p>
      </motion.div>

      {/* Primary Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        {finalAction && (
          <Button
            onClick={finalAction && 'onClick' in finalAction ? finalAction.onClick : undefined}
            variant={finalAction.variant || 'gradient'}
            size="lg"
            className="gap-2 shadow-3 hover:shadow-4 rounded-xl px-8"
          >
            {finalAction.icon}
            {finalAction.label}
          </Button>
        )}
        
        {finalSecondaryAction && (
          <Button
            onClick={finalSecondaryAction.onClick}
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl px-8"
          >
            {finalSecondaryAction.icon}
            {finalSecondaryAction.label}
          </Button>
        )}
      </motion.div>

      {/* Quick Actions Grid */}
      {showQuickActions && 'quickActions' in config && config.quickActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="w-full max-w-4xl mb-8"
        >
          <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {'quickActions' in config && config.quickActions.map((quickAction, index) => (
              <motion.div
                key={quickAction.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
              >
                <Card
                  variant="glass"
                  interactive
                  hover="lift"
                  className="p-6 cursor-pointer group text-center"
                >
                  <div className="p-3 bg-brand-100 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                    <quickAction.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h4 className="font-semibold text-text mb-2">{quickAction.label}</h4>
                  <p className="text-sm text-text-muted">{quickAction.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips Section */}
      {showTips && 'tips' in config && config.tips && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <h3 className="text-lg font-semibold text-text mb-6">Pro Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {'tips' in config && config.tips.map((tip, index) => (
              <motion.div
                key={tip.text}
                initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-modern",
                  tip.highlight 
                    ? "bg-gradient-to-r from-brand-50 to-brand-100 border-brand-200" 
                    : "bg-surface border-border hover:border-border-strong"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  tip.highlight 
                    ? "bg-brand-200 text-brand-700" 
                    : "bg-bg-muted text-text-muted"
                )}>
                  <tip.icon className="h-4 w-4" />
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  tip.highlight ? "text-brand-800" : "text-text-secondary"
                )}>
                  {tip.text}
                </p>
                {tip.highlight && (
                  <Badge variant="feature" size="xs" className="ml-auto">
                    New
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learn More Section */}
      {variant === 'notes' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-8 pt-8 border-t border-border-subtle"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-text-muted">
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-text">
              <Play className="h-4 w-4" />
              Watch Tutorial
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-text">
              <Download className="h-4 w-4" />
              Import Sample Notes
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-text">
              <Lightbulb className="h-4 w-4" />
              View Examples
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
