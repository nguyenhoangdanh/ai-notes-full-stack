import { ComponentProps, forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  [
    // Base styles - Modern marketing-ready design
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium leading-none tracking-tight relative overflow-hidden group",
    "transition-modern disabled:pointer-events-none disabled:opacity-50",
    "outline-none touch-action-manipulation select-none cursor-pointer",
    // Enhanced focus ring for accessibility
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Icon optimization
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // Performance optimization
    "will-change-transform transform-gpu",
    // Accessibility
    "aria-label",
  ],
  {
    variants: {
      variant: {
        default: [
          // Modern primary with enhanced visual appeal
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white",
          "shadow-2 border border-brand-600/20",
          "hover:shadow-3 hover:-translate-y-0.5 hover:from-brand-600 hover:to-brand-700",
          "active:translate-y-0 active:shadow-1 active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/5 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
          "disabled:hover:transform-none disabled:hover:shadow-2",
        ],
        destructive: [
          "bg-gradient-to-r from-danger to-red-600 text-white",
          "shadow-2 border border-danger/20",
          "hover:shadow-3 hover:-translate-y-0.5 hover:from-red-600 hover:to-red-700",
          "active:translate-y-0 active:scale-[0.98] active:shadow-1",
        ],
        success: [
          "bg-gradient-to-r from-success to-emerald-600 text-white",
          "shadow-2 border border-success/20",
          "hover:shadow-3 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700",
          "active:translate-y-0 active:scale-[0.98] active:shadow-1",
        ],
        outline: [
          // Modern outline with subtle glass effect
          "border border-border bg-surface text-text",
          "glass backdrop-blur-sm",
          "hover:bg-surface-hover hover:border-brand-300 hover:text-brand-700",
          "hover:shadow-2 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98] active:bg-surface-active",
        ],
        secondary: [
          "bg-bg-subtle text-text-secondary border border-border-subtle",
          "hover:bg-bg-muted hover:text-text hover:border-border",
          "hover:shadow-2 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98] active:bg-surface-active",
        ],
        ghost: [
          // Minimal modern ghost with subtle interactions
          "text-text-secondary bg-transparent",
          "hover:bg-surface-hover hover:text-text",
          "hover:shadow-1 hover:-translate-y-0.5",
          "active:translate-y-0 active:bg-surface-active active:scale-[0.98]",
        ],
        link: [
          "text-brand-600 underline-offset-4 bg-transparent shadow-none p-0 h-auto",
          "hover:underline hover:text-brand-700 transition-fast",
          "focus-visible:ring-offset-0 focus-visible:ring-1",
        ],
        gradient: [
          // Eye-catching marketing gradient
          "bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 text-white",
          "shadow-3 border border-brand-400/30",
          "hover:shadow-4 hover:-translate-y-1 hover:from-brand-600 hover:via-brand-700 hover:to-brand-800",
          "active:translate-y-0 active:scale-[0.98] active:shadow-2",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-white/10 before:to-white/30",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
          "after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
          "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300",
        ],
      },
      size: {
        xs: "h-7 px-3 text-xs gap-1 rounded-full min-w-[44px]",
        sm: "h-8 px-4 text-xs gap-1.5 rounded-full min-w-[44px]",
        default: "h-10 px-6 py-2.5 text-sm gap-2 rounded-full min-w-[44px]",
        lg: "h-12 px-8 text-base gap-2.5 rounded-full min-w-[48px]",
        xl: "h-14 px-10 text-lg gap-3 rounded-2xl min-w-[56px]",
        "2xl": "h-16 px-12 text-xl gap-4 rounded-2xl min-w-[64px]",
        icon: "size-10 rounded-full min-w-[44px]",
        "icon-xs": "size-7 rounded-full",
        "icon-sm": "size-8 rounded-full min-w-[44px]", 
        "icon-lg": "size-12 rounded-full min-w-[48px]",
        "icon-xl": "size-14 rounded-full min-w-[56px]",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  type?: "button" | "submit" | "reset"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    type = "button",
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, loading, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-[inherit]">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        
        <div className={cn(
          "flex items-center justify-center gap-2",
          loading && "opacity-0"
        )}>
          {leftIcon && (
            <span className="shrink-0 [&_svg]:size-4">
              {leftIcon}
            </span>
          )}
          
          {children}
          
          {rightIcon && (
            <span className="shrink-0 [&_svg]:size-4">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Modern ripple effect for tactile feedback */}
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-active:translate-x-full transition-transform duration-300 ease-out" />
        </div>
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
