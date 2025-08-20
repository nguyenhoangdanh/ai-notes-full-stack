import { cn } from "../../lib/utils"
import { ComponentProps } from "react"

interface SkeletonProps extends ComponentProps<"div"> {
  variant?: "default" | "text" | "circular" | "rectangular" | "pulse" | "wave"
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  lines?: number
  animated?: boolean
}

function Skeleton({ 
  className, 
  variant = "default", 
  size = "default",
  lines = 1,
  animated = true,
  ...props 
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-lg",
    text: "rounded-md h-4",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-xl",
    pulse: "rounded-lg",
    wave: "rounded-lg relative overflow-hidden"
  }

  const sizeClasses = {
    xs: variant === "text" ? "h-3" : "h-4",
    sm: variant === "text" ? "h-3.5" : "h-6", 
    default: variant === "text" ? "h-4" : "h-8",
    lg: variant === "text" ? "h-5" : "h-12",
    xl: variant === "text" ? "h-6" : "h-16"
  }

  const animationClasses = {
    default: animated ? "skeleton" : "",
    text: animated ? "skeleton" : "",
    circular: animated ? "skeleton" : "",
    rectangular: animated ? "skeleton" : "", 
    pulse: animated ? "animate-pulse" : "",
    wave: animated ? "skeleton-wave" : ""
  }

  // Handle multiple text lines
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            data-slot="skeleton"
            className={cn(
              "bg-bg-muted",
              variantClasses.text,
              sizeClasses[size],
              animationClasses.text,
              index === lines - 1 && "w-3/4", // Last line shorter
              className
            )}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Base skeleton styles
        "bg-bg-muted",
        variantClasses[variant],
        sizeClasses[size],
        animationClasses[variant],
        
        // Wave effect overlay
        variant === "wave" && [
          "before:absolute before:inset-0 before:bg-gradient-to-r",
          "before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-100%] before:animate-[wave_1.5s_ease-in-out_infinite]"
        ],
        
        className
      )}
      {...props}
    >
      {variant === "wave" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
      )}
    </div>
  )
}

// Specialized skeleton components for common use cases
function SkeletonText({ 
  lines = 3, 
  className,
  ...props 
}: Omit<SkeletonProps, 'variant'> & { lines?: number }) {
  return (
    <Skeleton 
      variant="text" 
      lines={lines} 
      className={className}
      {...props} 
    />
  )
}

function SkeletonAvatar({ 
  size = "default",
  className,
  ...props 
}: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton 
      variant="circular" 
      size={size}
      className={className}
      {...props} 
    />
  )
}

function SkeletonButton({ 
  size = "default",
  className,
  ...props 
}: Omit<SkeletonProps, 'variant'>) {
  const buttonSizes = {
    xs: "h-7 w-16",
    sm: "h-8 w-20",
    default: "h-10 w-24",
    lg: "h-12 w-28",
    xl: "h-14 w-32"
  }
  
  return (
    <Skeleton 
      variant="rectangular" 
      className={cn("rounded-full", buttonSizes[size], className)}
      {...props} 
    />
  )
}

// Card skeleton for complex layouts
interface SkeletonCardProps extends ComponentProps<"div"> {
  showAvatar?: boolean
  showImage?: boolean
  textLines?: number
  actions?: number
}

function SkeletonCard({ 
  showAvatar = false,
  showImage = false,
  textLines = 3,
  actions = 0,
  className,
  ...props 
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl border border-border bg-surface space-y-4",
        className
      )}
      {...props}
    >
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-24" />
            <Skeleton variant="text" size="sm" className="w-16" />
          </div>
        </div>
      )}
      
      {/* Hero image */}
      {showImage && (
        <Skeleton variant="rectangular" className="h-48 w-full" />
      )}
      
      {/* Title */}
      <Skeleton variant="text" size="lg" className="w-3/4" />
      
      {/* Content lines */}
      <SkeletonText lines={textLines} />
      
      {/* Action buttons */}
      {actions > 0 && (
        <div className="flex gap-2 pt-2">
          {Array.from({ length: actions }).map((_, index) => (
            <SkeletonButton key={index} size="sm" />
          ))}
        </div>
      )}
    </div>
  )
}

// Table skeleton
interface SkeletonTableProps extends ComponentProps<"div"> {
  rows?: number
  columns?: number
  showHeader?: boolean
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}: SkeletonTableProps) {
  return (
    <div 
      className={cn("space-y-4", className)}
      {...props}
    >
      {/* Table header */}
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" className="h-4 w-20" />
          ))}
        </div>
      )}
      
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex}
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                className={cn(
                  "h-4",
                  colIndex === 0 && "w-24", // First column wider
                  colIndex > 0 && "w-16"    // Other columns shorter
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Dashboard skeleton with metrics
function SkeletonDashboard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Header */}
      <div className="space-y-4">
        <Skeleton variant="text" size="xl" className="w-48" />
        <Skeleton variant="text" className="w-96" />
      </div>
      
      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-6 rounded-2xl border border-border bg-surface space-y-3">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" size="lg" className="w-16" />
            <Skeleton variant="text" size="sm" className="w-24" />
          </div>
        ))}
      </div>
      
      {/* Content cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard showImage textLines={2} actions={2} />
        <SkeletonCard showAvatar textLines={4} />
      </div>
    </div>
  )
}

export { 
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonDashboard,
  type SkeletonProps,
  type SkeletonCardProps,
  type SkeletonTableProps,
}
