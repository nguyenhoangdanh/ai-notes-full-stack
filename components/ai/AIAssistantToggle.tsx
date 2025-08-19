'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Bot, X, MessageCircle, Sparkles } from 'lucide-react'
import { AIChatInterface } from './AIChatInterface'
import { cn } from '../../lib/utils'

interface AIAssistantToggleProps {
  selectedNoteId?: string | null
  className?: string
}

export function AIAssistantToggle({ selectedNoteId, className }: AIAssistantToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasNewMessage(false)
    }
  }

  return (
    <>
      {/* Superhuman Floating AI Button */}
      <motion.div
        className={cn(
          "fixed bottom-6 right-6 z-40",
          className
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300,
          delay: 0.5 
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={toggleChat}
            size="lg"
            className={cn(
              "w-14 h-14 rounded-full shadow-xl border border-border/30 relative",
              "superhuman-gradient superhuman-glow superhuman-transition group",
              "backdrop-blur-xl"
            )}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <X className="h-5 w-5 text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="relative"
                >
                  <Bot className="h-5 w-5 text-primary-foreground group-hover:scale-110 superhuman-transition" />
                  {hasNewMessage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Superhuman glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 superhuman-transition animate-pulse" />
          </Button>
        </motion.div>

        {/* Superhuman Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ delay: 1, duration: 0.15 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="bg-background/95 text-foreground px-3 py-2 rounded-xl shadow-xl border border-border/30 text-sm whitespace-nowrap superhuman-glass backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="font-medium">AI Assistant</span>
                </div>
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-background/95 border-y-4 border-y-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Interface Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop with enhanced blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-xl z-30 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Superhuman Chat Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.2 }}
              className={cn(
                "fixed right-0 top-0 bottom-0 z-40 w-full max-w-md",
                "lg:w-96 lg:max-w-none"
              )}
            >
              <AIChatInterface
                selectedNoteId={selectedNoteId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="h-full"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Superhuman Pulsing Availability Indicator */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary/10 z-30 pointer-events-none"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </>
  )
}
