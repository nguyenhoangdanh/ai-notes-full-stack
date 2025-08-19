'use client'

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence, Variants, useAnimation, useInView } from 'framer-motion'
import { cn } from '../../lib/utils'
import { easings } from '../../lib/performance'

// Animation variants for common use cases
export const animationVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  },
  
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  },
  
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  },
  
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  },
  
  scaleOut: {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { opacity: 1, scale: 1 }
  },
  
  flipIn: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0 }
  },
  
  bounceIn: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 100
      }
    }
  },
  
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }
}

// Default transition configurations
export const transitions = {
  fast: { duration: 0.2, ease: "easeOut" },
  normal: { duration: 0.3, ease: "easeOut" },
  slow: { duration: 0.5, ease: "easeOut" },
  spring: { type: "spring", damping: 15, stiffness: 300 },
  bounce: { type: "spring", damping: 8, stiffness: 100 },
  elastic: { type: "spring", damping: 5, stiffness: 200 }
}

// Animated container component
interface AnimatedContainerProps {
  children: ReactNode
  variant?: keyof typeof animationVariants
  transition?: keyof typeof transitions | object
  delay?: number
  className?: string
  triggerOnce?: boolean
  threshold?: number
}

export function AnimatedContainer({
  children,
  variant = 'fadeIn',
  transition = 'normal',
  delay = 0,
  className,
  triggerOnce = true,
  threshold = 0.1
}: AnimatedContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: triggerOnce, amount: threshold })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    } else if (!triggerOnce) {
      controls.start('hidden')
    }
  }, [isInView, controls, triggerOnce])

  const transitionConfig = typeof transition === 'string' ? transitions[transition] : transition

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={animationVariants[variant]}
      transition={{ ...transitionConfig, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered list animation
interface StaggeredListProps {
  children: ReactNode[]
  variant?: keyof typeof animationVariants
  staggerDelay?: number
  className?: string
}

export function StaggeredList({
  children,
  variant = 'slideUp',
  staggerDelay = 0.1,
  className
}: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={animationVariants[variant]}
          transition={transitions.normal}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={transitions.normal}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  )
}

// Floating action button with spring animation
interface FloatingButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

export function FloatingButton({
  children,
  onClick,
  className,
  variant = 'primary'
}: FloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const variants = {
    primary: 'bg-gradient-to-r from-accent to-accent-secondary',
    secondary: 'bg-gradient-to-r from-neutral-7 to-neutral-8',
    accent: 'bg-gradient-to-r from-accent-secondary to-accent'
  }

  return (
    <motion.button
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-lg text-white z-50",
        "flex items-center justify-center",
        "focus:outline-none focus:ring-4 focus:ring-accent/30",
        variants[variant],
        className
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.9 : isHovered ? 1.1 : 1,
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      transition={transitions.spring}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      {children}
    </motion.button>
  )
}

// Loading spinner with smooth animation
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  color = 'currentColor',
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      className={cn("relative", sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div
        className={cn("absolute inset-0 border-2 border-transparent rounded-full")}
        style={{
          borderTopColor: color,
          borderRightColor: `${color}33`
        }}
      />
    </motion.div>
  )
}

// Morphing button
interface MorphingButtonProps {
  children: ReactNode
  onClick?: () => void
  isLoading?: boolean
  className?: string
  loadingText?: string
}

export function MorphingButton({
  children,
  onClick,
  isLoading = false,
  className,
  loadingText = "Loading..."
}: MorphingButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative px-6 py-3 rounded-xl font-medium",
        "bg-gradient-to-r from-accent to-accent-secondary text-white",
        "focus:outline-none focus:ring-4 focus:ring-accent/30",
        "overflow-hidden",
        className
      )}
      onClick={onClick}
      disabled={isLoading}
      animate={{
        scale: isLoading ? 0.95 : 1
      }}
      transition={transitions.spring}
      whileHover={{ scale: isLoading ? 0.95 : 1.05 }}
      whileTap={{ scale: isLoading ? 0.95 : 0.98 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2"
          >
            <LoadingSpinner size="sm" color="white" />
            {loadingText}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Notification toast with slide animation
interface NotificationToastProps {
  children: ReactNode
  isVisible: boolean
  onClose?: () => void
  position?: 'top' | 'bottom'
  className?: string
}

export function NotificationToast({
  children,
  isVisible,
  onClose,
  position = 'top',
  className
}: NotificationToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed left-1/2 z-50 max-w-sm w-full mx-auto",
            position === 'top' ? 'top-6' : 'bottom-6',
            className
          )}
          initial={{
            opacity: 0,
            scale: 0.9,
            x: '-50%',
            y: position === 'top' ? -20 : 20
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: '-50%',
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            x: '-50%',
            y: position === 'top' ? -20 : 20
          }}
          transition={transitions.spring}
        >
          <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-xl shadow-lg p-4">
            {children}
            {onClose && (
              <motion.button
                className="absolute top-2 right-2 p-1 hover:bg-accent/10 rounded-lg"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Progressive blur reveal
interface ProgressiveBlurProps {
  children: ReactNode
  isRevealed: boolean
  blurAmount?: number
  className?: string
}

export function ProgressiveBlur({
  children,
  isRevealed,
  blurAmount = 10,
  className
}: ProgressiveBlurProps) {
  return (
    <motion.div
      className={className}
      animate={{
        filter: isRevealed ? 'blur(0px)' : `blur(${blurAmount}px)`,
        opacity: isRevealed ? 1 : 0.5
      }}
      transition={transitions.slow}
    >
      {children}
    </motion.div>
  )
}

// Magnetic button effect
interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  magneticStrength?: number
}

export function MagneticButton({
  children,
  onClick,
  className,
  magneticStrength = 0.3
}: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * magneticStrength
    const deltaY = (e.clientY - centerY) * magneticStrength

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.button
      ref={ref}
      className={cn("relative", className)}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={transitions.spring}
    >
      {children}
    </motion.button>
  )
}

// Card hover effect
interface HoverCardProps {
  children: ReactNode
  className?: string
  tiltStrength?: number
}

export function HoverCard({
  children,
  className,
  tiltStrength = 10
}: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const rotateX = ((e.clientY - centerY) / rect.height) * tiltStrength
    const rotateY = ((e.clientX - centerX) / rect.width) * -tiltStrength

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <motion.div
      className={cn("relative perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.02 : 1
      }}
      transition={transitions.normal}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

// Custom hook for reduced motion
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Performance-aware animation wrapper
interface PerformantAnimationProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function PerformantAnimation({
  children,
  fallback,
  className
}: PerformantAnimationProps) {
  const prefersReducedMotion = useReducedMotion()
  const [canAnimate, setCanAnimate] = useState(true)

  useEffect(() => {
    // Check if we're on a low-end device
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (connection && connection.effectiveType === 'slow-2g') {
      setCanAnimate(false)
    }

    // Check performance
    const start = performance.now()
    requestAnimationFrame(() => {
      const end = performance.now()
      if (end - start > 16.67) { // More than one frame
        setCanAnimate(false)
      }
    })
  }, [])

  if (prefersReducedMotion || !canAnimate) {
    return <div className={className}>{fallback || children}</div>
  }

  return <div className={className}>{children}</div>
}
