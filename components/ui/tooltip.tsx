import { ComponentProps } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "../../lib/utils"

interface TooltipProviderProps extends ComponentProps<typeof TooltipPrimitive.Provider> {
  delayDuration?: number
  skipDelayDuration?: number
}

function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 100,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  className,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger 
      data-slot="tooltip-trigger"
      className={cn(
        // Ensure proper focus and hover states
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transition-modern",
        className
      )}
      {...props} 
    />
  )
}

interface TooltipContentProps extends ComponentProps<typeof TooltipPrimitive.Content> {
  variant?: "default" | "dark" | "light" | "branded" | "info" | "warning" | "danger" | "success"
  size?: "sm" | "default" | "lg"
}

function TooltipContent({
  className,
  sideOffset = 8,
  variant = "default",
  size = "default",
  children,
  ...props
}: TooltipContentProps) {
  const variantClasses = {
    default: [
      "glass border border-border-subtle bg-surface text-text",
      "shadow-3"
    ],
    dark: [
      "bg-neutral-900 text-white border border-neutral-800",
      "shadow-3"
    ],
    light: [
      "bg-white text-neutral-900 border border-neutral-200",
      "shadow-3"
    ],
    branded: [
      "bg-gradient-to-r from-brand-600 to-brand-700 text-white border border-brand-500/50",
      "shadow-3"
    ],
    info: [
      "bg-info text-white border border-info-border",
      "shadow-3"
    ],
    warning: [
      "bg-warning text-white border border-warning-border",
      "shadow-3"
    ],
    danger: [
      "bg-danger text-white border border-danger-border",
      "shadow-3"
    ],
    success: [
      "bg-success text-white border border-success-border",
      "shadow-3"
    ]
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs max-w-xs",
    default: "px-3 py-1.5 text-sm max-w-sm",
    lg: "px-4 py-2 text-base max-w-md"
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // Base modern tooltip styles
          "z-tooltip rounded-xl font-medium leading-relaxed",
          "origin-[var(--radix-tooltip-content-transform-origin)]",
          "will-change-transform",
          
          // Enhanced animations with spring feel
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          "data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-1",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1",
          "data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          "duration-200 ease-out",
          
          // Variants and sizing
          variantClasses[variant],
          sizeClasses[size],
          
          // Text balance for better readability
          "text-balance break-words",
          
          className
        )}
        {...props}
      >
        {children}
        
        {/* Modern arrow with proper styling */}
        <TooltipPrimitive.Arrow 
          className={cn(
            "size-2 rotate-45 border-[inherit]",
            variant === "default" && "fill-surface border-border-subtle",
            variant === "dark" && "fill-neutral-900 border-neutral-800",
            variant === "light" && "fill-white border-neutral-200",
            variant === "branded" && "fill-brand-600 border-brand-500/50",
            variant === "info" && "fill-info border-info-border",
            variant === "warning" && "fill-warning border-warning-border",
            variant === "danger" && "fill-danger border-danger-border",
            variant === "success" && "fill-success border-success-border"
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

// Enhanced Quick Tooltip for common use cases
interface QuickTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  variant?: TooltipContentProps["variant"]
  size?: TooltipContentProps["size"]
  disabled?: boolean
  className?: string
}

function QuickTooltip({
  content,
  children,
  side = "top",
  variant = "default",
  size = "default",
  disabled = false,
  className,
}: QuickTooltipProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} variant={variant} size={size} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

// Info Tooltip with icon for detailed explanations
interface InfoTooltipProps extends Omit<QuickTooltipProps, 'children'> {
  icon?: React.ReactNode
  trigger?: React.ReactNode
}

function InfoTooltip({
  content,
  icon,
  trigger,
  className,
  ...props
}: InfoTooltipProps) {
  const TriggerElement = trigger || (
    <button 
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "h-4 w-4 text-text-muted hover:text-text transition-modern",
        "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label="More information"
    >
      {icon || (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )

  return (
    <QuickTooltip
      content={content}
      variant="info"
      className={className}
      {...props}
    >
      {TriggerElement}
    </QuickTooltip>
  )
}

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  QuickTooltip,
  InfoTooltip,
  type TooltipContentProps,
  type QuickTooltipProps,
  type InfoTooltipProps,
}
