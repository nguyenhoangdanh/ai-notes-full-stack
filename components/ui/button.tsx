import { ComponentProps, forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold leading-none",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-60",
    "outline-none relative overflow-hidden group",
    "touch-action-manipulation select-none",
    // Focus styles
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/50",
    // Icon styles
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // Performance optimizations
    "will-change-transform",
    // Accessibility
    "@media (prefers-reduced-motion: reduce) { transition-duration: 1ms }",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-accent via-accent to-accent-secondary",
          "text-accent-contrast shadow-md",
          "hover:from-accent/90 hover:via-accent/95 hover:to-accent-secondary/90",
          "hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
          "before:absolute before:inset-0 before:bg-gradient-to-r",
          "before:from-white/20 before:via-white/10 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200",
        ],
        destructive: [
          "bg-gradient-to-r from-red-500 to-red-600",
          "text-white shadow-md",
          "hover:from-red-600 hover:to-red-700",
          "hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
          "before:absolute before:inset-0 before:bg-gradient-to-r",
          "before:from-white/20 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        ],
        success: [
          "bg-gradient-to-r from-green-500 to-green-600",
          "text-white shadow-md",
          "hover:from-green-600 hover:to-green-700",
          "hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
        ],
        warning: [
          "bg-gradient-to-r from-yellow-500 to-orange-500",
          "text-white shadow-md",
          "hover:from-yellow-600 hover:to-orange-600",
          "hover:shadow-lg hover:shadow-yellow-500/25 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
        ],
        outline: [
          "border-2 border-border/60 glass-effect shadow-sm",
          "text-foreground bg-background/50 backdrop-blur-sm",
          "hover:bg-accent/10 hover:border-accent/40 hover:text-accent-foreground",
          "hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-sm",
        ],
        secondary: [
          "bg-gradient-to-r from-secondary/90 to-secondary",
          "text-secondary-foreground shadow-sm",
          "hover:from-secondary hover:to-secondary/90",
          "hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-sm",
        ],
        ghost: [
          "text-foreground bg-transparent",
          "hover:bg-accent/10 hover:text-accent-foreground",
          "hover:shadow-sm hover:-translate-y-0.5",
          "active:translate-y-0 active:bg-accent/20",
        ],
        link: [
          "text-accent underline-offset-4 bg-transparent shadow-none p-0 h-auto",
          "hover:underline hover:text-accent/80",
          "transition-colors duration-200",
        ],
        glass: [
          "glass-effect border border-border/40",
          "text-foreground backdrop-blur-md",
          "hover:glass-effect-strong hover:border-accent/30",
          "hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs gap-1 rounded-md",
        sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
        default: "h-10 px-4 py-2.5 gap-2 rounded-xl",
        lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
        xl: "h-14 px-8 text-lg gap-3 rounded-2xl",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
        "icon-xl": "size-14 rounded-2xl",
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
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Determine if button should be disabled
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, loading, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
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

        {/* Ripple effect for better interaction feedback */}
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-active:translate-x-full transition-transform duration-500 ease-out" />
        </div>
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
