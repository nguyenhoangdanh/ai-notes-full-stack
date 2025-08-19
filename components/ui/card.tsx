import { ComponentProps, forwardRef } from "react"
import { cn } from "../../lib/utils"

interface CardProps extends ComponentProps<"div"> {
  variant?: "default" | "elevated" | "outlined" | "ghost" | "glass" | "solid" | "gradient"
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
          // Base Superhuman styles - rounded, clean, modern
          "flex flex-col rounded-2xl border superhuman-transition group relative overflow-hidden",
          "text-card-foreground will-change-transform",

          // Variant styles
          {
            // Default Superhuman glass card
            "bg-background/50 border-border/30 shadow-md superhuman-glass backdrop-blur-sm": variant === "default",
            
            // Elevated with stronger shadow and glow
            "bg-background/60 border-border/20 shadow-xl shadow-primary/5 superhuman-glass backdrop-blur-md": variant === "elevated",
            
            // Clean outlined card
            "bg-background/30 border-2 border-border/40 hover:border-primary/30 hover:bg-background/50 backdrop-blur-sm": variant === "outlined",
            
            // Minimal ghost card
            "bg-transparent border-transparent hover:bg-background/20 hover:backdrop-blur-sm": variant === "ghost",
            
            // Strong glass morphism
            "bg-background/40 border-border/20 shadow-lg backdrop-blur-md superhuman-glass": variant === "glass",
            
            // Solid background
            "bg-background border-border/50 shadow-sm": variant === "solid",
            
            // Superhuman gradient card
            "bg-gradient-to-br from-background/90 via-background/50 to-primary/5 border-primary/20 shadow-lg superhuman-gradient-subtle": variant === "gradient",
          },

          // Interactive states with Superhuman micro-interactions
          interactive && [
            "cursor-pointer hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10",
            "active:translate-y-0 active:scale-100 active:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            "superhuman-hover superhuman-glow",
          ],

          clickable && "cursor-pointer",

          // Padding variants
          {
            "p-0": padding === "none",
            "p-3": padding === "xs",
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
          "flex flex-col space-y-2 p-6 pb-4",
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
          "border-t border-border/30 bg-muted/10 backdrop-blur-sm",
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = "CardFooter"

// Enhanced StatsCard with Superhuman styling
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
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground"
  }

  const trendIcons = {
    up: "↗",
    down: "↘", 
    neutral: "→"
  }

  return (
    <Card
      ref={ref}
      variant="glass"
      interactive
      className={cn("hover:scale-[1.02] superhuman-hover superhuman-glow", className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            {trend && trendValue && (
              <div className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                "bg-background/50 border border-border/30",
                trendColors[trend]
              )}>
                <span className="text-sm">{trendIcons[trend]}</span>
                {trendValue}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center superhuman-transition hover:bg-primary/15">
              <div className="text-primary [&_svg]:size-6">
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

// New Superhuman MetricCard component
const MetricCard = forwardRef<HTMLDivElement, CardProps & {
  label: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  color?: "primary" | "emerald" | "red" | "amber"
}>(({ 
  label,
  value,
  change,
  icon,
  color = "primary",
  className,
  ...props
}, ref) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20",
    red: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/20",
    amber: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/20"
  }

  return (
    <Card
      ref={ref}
      variant="glass"
      className={cn("superhuman-hover", className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium",
                  change.trend === "up" && "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20",
                  change.trend === "down" && "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/20",
                  change.trend === "neutral" && "text-muted-foreground bg-muted"
                )}>
                  {change.trend === "up" && "↗"}
                  {change.trend === "down" && "↘"}
                  {change.trend === "neutral" && "→"}
                  {change.value}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center superhuman-transition",
              colorClasses[color]
            )}>
              <div className="[&_svg]:size-5">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

MetricCard.displayName = "MetricCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  StatsCard,
  MetricCard,
  type CardProps,
}
