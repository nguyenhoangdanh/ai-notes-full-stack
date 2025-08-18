import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Robot, X, ChatCircle } from '@phosphor-icons/react'
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
      {/* Floating AI Button */}
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
              "w-14 h-14 rounded-full shadow-lg border-2 border-background relative",
              "bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90",
              "transition-all duration-300 group"
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
                  <X className="h-6 w-6 text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Robot className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform" />
                  {hasNewMessage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 1 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-sm whitespace-nowrap">
                AI Assistant
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-popover border-y-4 border-y-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Interface Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
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

      {/* Pulsing animation when chat is available */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary/20 z-30 pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </>
  )
}