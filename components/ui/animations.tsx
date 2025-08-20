'use client'

import { ComponentProps, forwardRef } from 'react'
import { cn } from '../../lib/utils'

// Animation variants for consistent micro-interactions
export const animationVariants = {
  // Entrance animations
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  slideInFromLeft: 'animate-slide-in-from-left',
  slideInFromRight: 'animate-slide-in-from-right',
  
  // Hover animations
  hoverLift: 'hover-lift',
  hoverGlow: 'hover:shadow-glow',
  hoverScale: 'hover:scale-105 active:scale-95',
  hoverRotate: 'hover:rotate-1 active:rotate-0',
  
  // Loading animations
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  
  // Micro-interactions
  buttonPress: 'active:scale-95',
  cardHover: 'card-hover',
  interactive: 'interactive',
}

// Stagger animation wrapper
interface StaggerProps extends ComponentProps<'div'> {
  children: React.ReactNode
  delay?: number
  className?: string
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, delay = 100, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('stagger-container', className)}
        style={{
          '--stagger-delay': `${delay}ms`,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stagger.displayName = 'Stagger'

// Reveal animation on scroll
interface RevealProps extends ComponentProps<'div'> {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  ({ children, direction = 'up', delay = 0, duration = 300, className, ...props }, ref) => {
    const directionClasses = {
      up: 'translate-y-8 opacity-0',
      down: 'translate-y-[-2rem] opacity-0',
      left: 'translate-x-[-2rem] opacity-0',
      right: 'translate-x-8 opacity-0',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'transform transition-all ease-out',
          directionClasses[direction],
          'scroll-reveal',
          className
        )}
        style={{
          transitionDelay: `${delay}ms`,
          transitionDuration: `${duration}ms`,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Reveal.displayName = 'Reveal'

// Floating animation
interface FloatingProps extends ComponentProps<'div'> {
  children: React.ReactNode
  intensity?: 'subtle' | 'medium' | 'strong'
  speed?: 'slow' | 'normal' | 'fast'
  className?: string
}

export const Floating = forwardRef<HTMLDivElement, FloatingProps>(
  ({ children, intensity = 'subtle', speed = 'normal', className, ...props }, ref) => {
    const intensityClasses = {
      subtle: 'animate-float-subtle',
      medium: 'animate-float',
      strong: 'animate-float-strong',
    }

    const speedClasses = {
      slow: 'animation-duration-[6s]',
      normal: 'animation-duration-[4s]',
      fast: 'animation-duration-[2s]',
    }

    return (
      <div
        ref={ref}
        className={cn(
          intensityClasses[intensity],
          speedClasses[speed],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Floating.displayName = 'Floating'

// Magnetic hover effect
interface MagneticProps extends ComponentProps<'div'> {
  children: React.ReactNode
  strength?: number
  className?: string
}

export const Magnetic = forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, strength = 20, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('magnetic-element cursor-pointer', className)}
        data-magnetic-strength={strength}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Magnetic.displayName = 'Magnetic'

// Ripple effect component
interface RippleProps {
  duration?: number
  color?: string
}

export const Ripple: React.FC<RippleProps> = ({ 
  duration = 600, 
  color = 'rgba(255, 255, 255, 0.6)' 
}) => {
  return (
    <div 
      className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none"
      data-ripple-container
    >
      <div
        className="absolute bg-current rounded-full opacity-0 transform scale-0"
        style={{
          backgroundColor: color,
          animationDuration: `${duration}ms`,
        }}
        data-ripple
      />
    </div>
  )
}

// Parallax scroll effect
interface ParallaxProps extends ComponentProps<'div'> {
  children: React.ReactNode
  speed?: number
  direction?: 'up' | 'down'
  className?: string
}

export const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  ({ children, speed = 0.5, direction = 'up', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('parallax-element', className)}
        data-speed={speed}
        data-direction={direction}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Parallax.displayName = 'Parallax'

// Text animation effects
interface AnimatedTextProps extends ComponentProps<'span'> {
  children: string
  animation?: 'typewriter' | 'fadeIn' | 'slideUp' | 'wave'
  delay?: number
  speed?: number
  className?: string
}

export const AnimatedText = forwardRef<HTMLSpanElement, AnimatedTextProps>(
  ({ children, animation = 'fadeIn', delay = 0, speed = 50, className, ...props }, ref) => {
    const letters = children.split('')

    return (
      <span ref={ref} className={cn('inline-block', className)} {...props}>
        {letters.map((letter, index) => (
          <span
            key={index}
            className={cn(
              'inline-block',
              animation === 'typewriter' && 'opacity-0 animate-type',
              animation === 'fadeIn' && 'opacity-0 animate-fade-in-letter',
              animation === 'slideUp' && 'opacity-0 translate-y-4 animate-slide-up-letter',
              animation === 'wave' && 'animate-wave'
            )}
            style={{
              animationDelay: `${delay + index * speed}ms`,
              animationFillMode: 'forwards',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
    )
  }
)

AnimatedText.displayName = 'AnimatedText'

// Loading skeleton with shimmer
interface SkeletonProps extends ComponentProps<'div'> {
  className?: string
  animated?: boolean
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animated = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-muted rounded-lg',
          animated && 'skeleton',
          className
        )}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Morphing icon transition
interface MorphingIconProps {
  icon1: React.ComponentType<{ className?: string }>
  icon2: React.ComponentType<{ className?: string }>
  isToggled: boolean
  className?: string
  size?: string
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({
  icon1: Icon1,
  icon2: Icon2,
  isToggled,
  className,
  size = 'h-4 w-4'
}) => {
  return (
    <div className={cn('relative', className)}>
      <Icon1
        className={cn(
          size,
          'absolute inset-0 transition-all duration-300',
          isToggled 
            ? 'opacity-0 scale-0 rotate-180' 
            : 'opacity-100 scale-100 rotate-0'
        )}
      />
      <Icon2
        className={cn(
          size,
          'absolute inset-0 transition-all duration-300',
          isToggled 
            ? 'opacity-100 scale-100 rotate-0' 
            : 'opacity-0 scale-0 rotate-180'
        )}
      />
    </div>
  )
}

// Bounce animation trigger
export const useBounce = () => {
  const trigger = (element: HTMLElement) => {
    element.classList.add('animate-bounce-once')
    setTimeout(() => {
      element.classList.remove('animate-bounce-once')
    }, 600)
  }

  return trigger
}

// Shake animation trigger
export const useShake = () => {
  const trigger = (element: HTMLElement) => {
    element.classList.add('animate-shake')
    setTimeout(() => {
      element.classList.remove('animate-shake')
    }, 500)
  }

  return trigger
}

// Pulse animation trigger
export const usePulse = () => {
  const trigger = (element: HTMLElement, duration = 1000) => {
    element.classList.add('animate-pulse-once')
    setTimeout(() => {
      element.classList.remove('animate-pulse-once')
    }, duration)
  }

  return trigger
}

// Enhanced CSS keyframes are already defined in globals.css
// This file provides React components and utilities for animations
