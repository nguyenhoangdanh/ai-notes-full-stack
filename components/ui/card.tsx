import { ComponentProps, forwardRef } from "react"
import { cn } from "../../lib/utils"

interface CardProps extends ComponentProps<"div"> {
  variant?: "default" | "elevated" | "outlined" | "ghost" | "glass" | "solid"
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  interactive?: boolean
  clickable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    padding = "md", 
    interactive = false,
    clickable = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          // Base styles
          "flex flex-col rounded-2xl border transition-all duration-300 ease-out group relative overflow-hidden",
          "text-card-foreground will-change-transform",
          
          // Reduced motion support
          "@media (prefers-reduced-motion: reduce) { transition-duration: 1ms }",

          // Variant styles
          {
            // Default glass morphism card
            "glass-effect border-border/40 shadow-md hover:shadow-lg hover:border-border/60": variant === "default",
            
            // Elevated card with strong shadow
            "glass-effect-strong border-border/30 shadow-xl hover:shadow-2xl hover:shadow-accent/10": variant === "elevated",
            
            // Outlined card
            "bg-background/50 border-2 border-border/60 hover:border-accent/40 hover:bg-background/80 backdrop-blur-sm": variant === "outlined",
            
            // Ghost card (minimal styling)
            "bg-transparent border-transparent hover:bg-background/30 hover:backdrop-blur-sm": variant === "ghost",
            
            // Strong glass effect
            "glass-effect-strong border-border/20 shadow-lg backdrop-blur-md": variant === "glass",
            
            // Solid background
            "bg-background border-border/60 shadow-sm hover:shadow-md": variant === "solid",
          },

          // Interactive states
          interactive && [
            "cursor-pointer hover:-translate-y-1 hover:scale-[1.02]",
            "active:translate-y-0 active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2",
          ],

          clickable && "cursor-pointer",

          // Padding variants
          {
            "p-0": padding === "none",
            "p-2": padding === "xs",
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
            "p-10": padding === "xl",
          },

          className
        )}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(
          "flex flex-col space-y-1.5 p-6 pb-4",
          "has-[data-slot=card-action]:flex-row has-[data-slot=card-action]:items-start has-[data-slot=card-action]:justify-between has-[data-slot=card-action]:space-y-0",
          className
        )}
        {...props}
      />
    )
  }
)

CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        data-slot="card-title"
        className={cn(
          "text-xl font-semibold leading-tight tracking-tight",
          "text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="card-description"
        className={cn(
          "text-sm text-muted-foreground leading-relaxed",
          className
        )}
        {...props}
      />
    )
  }
)

CardDescription.displayName = "CardDescription"

const CardAction = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-action"
        className={cn(
          "flex items-center space-x-2 flex-shrink-0",
          className
        )}
        {...props}
      />
    )
  }
)

CardAction.displayName = "CardAction"

const CardContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn("px-6 pb-6 flex-1", className)}
        {...props}
      />
    )
  }
)

CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn(
          "flex items-center justify-between px-6 py-4 mt-auto",
          "border-t border-border/40 bg-muted/20",
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = "CardFooter"

// Enhanced card variants for specific use cases
const StatsCard = forwardRef<HTMLDivElement, CardProps & {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}>(({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue,
  className, 
  ...props 
}, ref) => {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground"
  }

  return (
    <Card
      ref={ref}
      variant="glass"
      interactive
      className={cn("hover:scale-105", className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && trendValue && (
              <p className={cn("text-xs mt-2 flex items-center gap-1", trendColors[trend])}>
                {trend === "up" && "↗"}
                {trend === "down" && "↘"}
                {trend === "neutral" && "→"}
                {trendValue}
              </p>
            )}
          </div>
          {icon && (
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <div className="text-accent [&_svg]:size-6">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

StatsCard.displayName = "StatsCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  StatsCard,
  type CardProps,
}
