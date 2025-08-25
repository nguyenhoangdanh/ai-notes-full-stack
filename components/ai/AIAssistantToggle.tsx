'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { QuickTooltip } from '../ui/tooltip'
import { 
  Bot, 
  X, 
  Maximize2, 
  Minimize2,
  MessageCircle,
  Sparkles,
  Zap,
  Brain,
  ChevronUp,
  Mic,
  Image,
  FileText
} from 'lucide-react'
import { AIChatInterface } from './AIChatInterface'
import { useAI } from '../../stores/ai.store'
import { cn } from '../../lib/utils'

interface AIAssistantToggleProps {
  selectedNoteId?: string | null
  className?: string
}

export function AIAssistantToggle({ selectedNoteId, className }: AIAssistantToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const { isProcessing, activeConversation } = useAI()

  // Auto-hide after inactivity
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setTimeout(() => {
      setShowQuickActions(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [isOpen, showQuickActions])

  const quickActions = [
    {
      icon: MessageCircle,
      label: 'Chat',
      description: 'Ask anything',
      action: () => setIsOpen(true)
    },
    {
      icon: Sparkles,
      label: 'Enhance',
      description: 'Improve writing',
      action: () => console.log('Enhance')
    },
    {
      icon: Brain,
      label: 'Summarize',
      description: 'Create summary',
      action: () => console.log('Summarize')
    },
    {
      icon: Zap,
      label: 'Ideas',
      description: 'Generate concepts',
      action: () => console.log('Ideas')
    }
  ]

  return (
    <>
      {/* Floating AI Assistant */}
      <motion.div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3",
          className
        )}
        initial={false}
      >
        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                staggerChildren: 0.05,
                delayChildren: 0.1
              }}
              className="flex flex-col gap-2"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <QuickTooltip 
                    content={action.description}
                    side="left"
                    variant="dark"
                  >
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={action.action}
                      className={cn(
                        "h-12 w-12 rounded-full shadow-3",
                        "glass border border-border-subtle",
                        "hover:shadow-4 hover:scale-110 hover:border-brand-300",
                        "backdrop-blur-xl bg-surface/90"
                      )}
                    >
                      <action.icon className="h-5 w-5 text-brand-600" />
                    </Button>
                  </QuickTooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          {/* Pulse Animation when processing */}
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-full bg-brand-500/30"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Notification Badge */}
          {activeConversation && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 z-10"
            >
              <Badge variant="danger" size="xs" className="min-w-0 px-1">
                1
              </Badge>
            </motion.div>
          )}

          {/* Main Button */}
          <Button
            onClick={() => {
              if (isOpen) {
                setIsOpen(false)
                setIsExpanded(false)
              } else {
                setShowQuickActions(!showQuickActions)
                setIsOpen(true)
              }
            }}
            onMouseEnter={() => !isOpen && setShowQuickActions(true)}
            variant="gradient"
            size="lg"
            className={cn(
              "h-16 w-16 rounded-full shadow-4 relative overflow-hidden",
              "hover:shadow-5 hover:scale-105 transition-all duration-300",
              "border-2 border-white/20",
              isProcessing && "animate-pulse",
              isOpen && "shadow-glow"
            )}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="bot"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Bot className="h-6 w-6" />
                  {isProcessing && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/50 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkle Effects */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>

          {/* Status Indicator */}
          <motion.div
            className={cn(
              "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface",
              isProcessing ? "bg-warning" : activeConversation ? "bg-success" : "bg-brand-600"
            )}
            animate={{
              scale: isProcessing ? [1, 1.2, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: isProcessing ? Infinity : 0
            }}
          />
        </motion.div>

        {/* Floating Hint */}
        <AnimatePresence>
          {!isOpen && !showQuickActions && !activeConversation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 2 }}
              className="mr-2"
            >
              <Card 
                variant="glass" 
                className="px-3 py-2 border border-border-subtle shadow-2 max-w-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-brand-600 animate-pulse" />
                  <p className="text-xs text-text-secondary">
                    Try asking me anything!
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Interface Modal/Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          >
            {/* Mobile Overlay */}
            <div className="lg:hidden fixed inset-0 bg-bg-overlay backdrop-blur-xl">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <Bot className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">AI Assistant</h3>
                      <p className="text-xs text-text-muted">Always here to help</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="rounded-full"
                    >
                      {isExpanded ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <AIChatInterface
                    selectedNoteId={selectedNoteId}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    className="h-full border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200 
              }}
              className={cn(
                "hidden lg:block fixed right-0 top-0 bottom-0 z-50",
                isExpanded ? "w-2/3 max-w-4xl" : "w-96"
              )}
            >
              <div className="h-full flex flex-col">
                {/* Resize Handle */}
                <div className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-border-subtle hover:bg-brand-300 transition-colors" />
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-subtle glass">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <Bot className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">AI Assistant</h3>
                      {selectedNoteId && (
                        <p className="text-xs text-text-muted">Context: Current Note</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <QuickTooltip content={isExpanded ? "Minimize" : "Expand"}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="rounded-full"
                      >
                        {isExpanded ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </QuickTooltip>
                    
                    <QuickTooltip content="Close">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsOpen(false)}
                        className="rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </QuickTooltip>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <AIChatInterface
                    selectedNoteId={selectedNoteId}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    className="h-full border-0"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
