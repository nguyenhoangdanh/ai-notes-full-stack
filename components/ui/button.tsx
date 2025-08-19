import { ComponentProps, forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  [
    // Base styles - Superhuman-inspired
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium leading-none tracking-tight",
    "superhuman-transition relative overflow-hidden group",
    "disabled:pointer-events-none disabled:opacity-50",
    "outline-none touch-action-manipulation select-none",
    // Enhanced focus for Superhuman style
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
    // Icon optimization
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // Performance
    "will-change-transform",
  ],
  {
    variants: {
      variant: {
        default: [
          // Superhuman primary - sleek gradient with glow
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
          "shadow-md shadow-primary/20 superhuman-glow",
          "hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/10 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-120",
        ],
        destructive: [
          "bg-gradient-to-r from-red-500 to-red-600 text-white",
          "shadow-md shadow-red-500/20",
          "hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
        ],
        success: [
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
          "shadow-md shadow-emerald-500/20",
          "hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
        ],
        outline: [
          // Superhuman ghost-like outline
          "border border-border/60 bg-background/50 text-foreground",
          "superhuman-glass backdrop-blur-sm",
          "hover:bg-primary/5 hover:border-primary/30 hover:text-primary",
          "hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
        ],
        secondary: [
          "bg-secondary/80 text-secondary-foreground border border-border/30",
          "superhuman-glass",
          "hover:bg-secondary hover:shadow-md hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
        ],
        ghost: [
          // Minimal Superhuman ghost
          "text-foreground bg-transparent",
          "hover:bg-muted/50 hover:text-primary",
          "hover:shadow-sm hover:-translate-y-0.5",
          "active:translate-y-0 active:bg-muted/70 active:scale-[0.98]",
        ],
        link: [
          "text-primary underline-offset-4 bg-transparent shadow-none p-0 h-auto",
          "hover:underline hover:text-primary/80 superhuman-transition",
        ],
        gradient: [
          // Superhuman signature gradient
          "bg-gradient-to-r from-primary via-accent to-primary text-white",
          "shadow-lg shadow-primary/25 superhuman-glow",
          "hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/30",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-120",
        ],
      },
      size: {
        xs: "h-7 px-3 text-xs gap-1 rounded-full",
        sm: "h-8 px-4 text-xs gap-1.5 rounded-full",
        default: "h-10 px-6 py-2.5 gap-2 rounded-full",
        lg: "h-12 px-8 text-base gap-2.5 rounded-full",
        xl: "h-14 px-10 text-lg gap-3 rounded-full",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full",
        "icon-sm": "size-8 rounded-full", 
        "icon-lg": "size-12 rounded-full",
        "icon-xl": "size-14 rounded-full",
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
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-full">
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

        {/* Superhuman ripple effect */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-active:translate-x-full transition-transform duration-300 ease-out" />
        </div>
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
