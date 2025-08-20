import { ComponentProps, forwardRef } from "react"
import { cn } from "../../lib/utils"

interface CardProps extends ComponentProps<"div"> {
  variant?: "default" | "elevated" | "outlined" | "ghost" | "glass" | "solid" | "gradient" | "feature"
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  interactive?: boolean
  clickable?: boolean
  hover?: "lift" | "glow" | "scale" | "none"
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    padding = "md", 
    interactive = false,
    clickable = false,
    hover = "lift",
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          // Base modern card styles
          "flex flex-col rounded-2xl transition-modern group relative overflow-hidden",
          "text-text will-change-transform",

          // Variant styles
          {
            // Default glass card with subtle background
            "bg-surface border border-border shadow-1 hover:shadow-2": variant === "default",
            
            // Elevated card with stronger shadow
            "bg-surface-elevated border border-border-subtle shadow-2 hover:shadow-3": variant === "elevated",
            
            // Clean outlined card
            "bg-surface border-2 border-border hover:border-brand-300": variant === "outlined",
            
            // Minimal ghost card
            "bg-transparent border-transparent hover:bg-surface-hover": variant === "ghost",
            
            // Glass morphism effect
            "glass border border-border-subtle shadow-2": variant === "glass",
            
            // Solid background
            "bg-surface border border-border shadow-1": variant === "solid",
            
            // Gradient background for marketing appeal
            "bg-gradient-to-br from-surface via-surface-elevated to-brand-50 border border-brand-200 shadow-2": variant === "gradient",
            
            // Feature card with enhanced styling
            "bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 shadow-3 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-brand-500/5 before:to-transparent before:pointer-events-none": variant === "feature",
          },

          // Hover effects
          interactive && hover === "lift" && [
            "cursor-pointer hover:-translate-y-1 hover:scale-[1.01]",
            "active:translate-y-0 active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          ],

          interactive && hover === "glow" && [
            "cursor-pointer hover:shadow-glow transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          ],

          interactive && hover === "scale" && [
            "cursor-pointer hover:scale-[1.02] transition-transform duration-200",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
          "text-xl font-semibold leading-tight tracking-tight text-text",
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
          "text-sm text-text-secondary leading-relaxed",
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
          "border-t border-border-subtle bg-bg-muted/50",
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = "CardFooter"

// Enhanced StatsCard for marketing dashboards
const StatsCard = forwardRef<HTMLDivElement, CardProps & {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "brand" | "success" | "warning" | "danger" | "info"
}>(({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue,
  color = "brand",
  className, 
  ...props 
}, ref) => {
  const trendColors = {
    up: "text-success bg-success-bg border border-success-border",
    down: "text-danger bg-danger-bg border border-danger-border",
    neutral: "text-text-muted bg-bg-muted border border-border-subtle"
  }

  const trendIcons = {
    up: "↗",
    down: "↘", 
    neutral: "→"
  }

  const colorClasses = {
    brand: "text-brand-600 bg-brand-50 border border-brand-200",
    success: "text-success bg-success-bg border border-success-border",
    warning: "text-warning bg-warning-bg border border-warning-border",
    danger: "text-danger bg-danger-bg border border-danger-border",
    info: "text-info bg-info-bg border border-info-border"
  }

  return (
    <Card
      ref={ref}
      variant="elevated"
      interactive
      hover="lift"
      className={cn("group hover:border-brand-200", className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-text-secondary">
              {title}
            </p>
            <p className="text-3xl font-bold text-text tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-text-muted leading-relaxed">
                {description}
              </p>
            )}
            {trend && trendValue && (
              <div className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full",
                trendColors[trend]
              )}>
                <span className="text-sm font-semibold">{trendIcons[trend]}</span>
                {trendValue}
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-modern",
              "group-hover:scale-110",
              colorClasses[color]
            )}>
              <div className="[&_svg]:size-6">
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

// Modern MetricCard for key performance indicators
const MetricCard = forwardRef<HTMLDivElement, CardProps & {
  label: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  color?: "brand" | "success" | "warning" | "danger" | "info"
  size?: "sm" | "default" | "lg"
}>(({ 
  label,
  value,
  change,
  icon,
  color = "brand",
  size = "default",
  className,
  ...props
}, ref) => {
  const colorClasses = {
    brand: "text-brand-600 bg-brand-50 border border-brand-200",
    success: "text-success bg-success-bg border border-success-border",
    warning: "text-warning bg-warning-bg border border-warning-border",
    danger: "text-danger bg-danger-bg border border-danger-border",
    info: "text-info bg-info-bg border border-info-border"
  }

  const sizeClasses = {
    sm: {
      padding: "p-4",
      value: "text-xl",
      icon: "h-8 w-8 [&_svg]:size-4"
    },
    default: {
      padding: "p-6",
      value: "text-2xl",
      icon: "h-10 w-10 [&_svg]:size-5"
    },
    lg: {
      padding: "p-8",
      value: "text-3xl",
      icon: "h-12 w-12 [&_svg]:size-6"
    }
  }

  return (
    <Card
      ref={ref}
      variant="glass"
      interactive
      hover="glow"
      className={cn("group", className)}
      {...props}
    >
      <CardContent className={sizeClasses[size].padding}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 min-w-0 flex-1">
            <p className="text-sm text-text-secondary font-medium truncate">{label}</p>
            <p className={cn("font-bold tracking-tight text-text", sizeClasses[size].value)}>
              {value}
            </p>
            {change && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium",
                  change.trend === "up" && "text-success bg-success-bg border border-success-border",
                  change.trend === "down" && "text-danger bg-danger-bg border border-danger-border",
                  change.trend === "neutral" && "text-text-muted bg-bg-muted border border-border-subtle"
                )}>
                  {change.trend === "up" && "↗"}
                  {change.trend === "down" && "↘"}
                  {change.trend === "neutral" && "→"}
                  <span className="font-semibold">{change.value}</span>
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "flex-shrink-0 rounded-xl flex items-center justify-center transition-modern",
              "group-hover:scale-110 group-hover:rotate-3",
              sizeClasses[size].icon,
              colorClasses[color]
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

MetricCard.displayName = "MetricCard"

// Feature card for marketing pages
const FeatureCard = forwardRef<HTMLDivElement, CardProps & {
  title: string
  description: string
  icon?: React.ReactNode
  badge?: string
  href?: string
}>(({ 
  title,
  description,
  icon,
  badge,
  href,
  className,
  ...props
}, ref) => {
  const Comp = href ? "a" : "div"
  
  return (
    <Card
      ref={ref}
      as={Comp}
      href={href}
      variant="feature"
      interactive
      hover="lift"
      className={cn("group text-left", className)}
      {...props}
    >
      <CardContent className="p-8">
        <div className="space-y-4">
          {badge && (
            <div className="inline-block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 border border-brand-200">
                {badge}
              </span>
            </div>
          )}
          
          {icon && (
            <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform duration-200">
              <div className="[&_svg]:size-6">
                {icon}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-text tracking-tight">
              {title}
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
          
          {href && (
            <div className="pt-2">
              <span className="inline-flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700">
                Learn more
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

FeatureCard.displayName = "FeatureCard"

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
  FeatureCard,
  type CardProps,
}
