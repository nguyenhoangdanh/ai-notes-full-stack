import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  [
    // Base modern badge styles
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0",
    "text-xs font-semibold tracking-wide transition-modern",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "overflow-hidden relative",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white",
          "border border-brand-600/20 shadow-1",
          "[a&]:hover:from-brand-600 [a&]:hover:to-brand-700 [a&]:hover:shadow-2 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        secondary: [
          "bg-bg-subtle text-text-secondary border border-border",
          "[a&]:hover:bg-bg-muted [a&]:hover:text-text [a&]:hover:border-border-strong [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        success: [
          "bg-gradient-to-r from-success to-emerald-600 text-white",
          "border border-success/20 shadow-1",
          "[a&]:hover:from-emerald-600 [a&]:hover:to-emerald-700 [a&]:hover:shadow-2 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        warning: [
          "bg-gradient-to-r from-warning to-amber-500 text-white",
          "border border-warning/20 shadow-1",
          "[a&]:hover:from-amber-500 [a&]:hover:to-amber-600 [a&]:hover:shadow-2 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        danger: [
          "bg-gradient-to-r from-danger to-red-600 text-white",
          "border border-danger/20 shadow-1",
          "[a&]:hover:from-red-600 [a&]:hover:to-red-700 [a&]:hover:shadow-2 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        info: [
          "bg-gradient-to-r from-info to-blue-600 text-white",
          "border border-info/20 shadow-1",
          "[a&]:hover:from-blue-600 [a&]:hover:to-blue-700 [a&]:hover:shadow-2 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        outline: [
          "border border-border bg-surface text-text",
          "[a&]:hover:bg-surface-hover [a&]:hover:border-brand-300 [a&]:hover:text-brand-700 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        ghost: [
          "bg-transparent text-text-secondary",
          "[a&]:hover:bg-surface-hover [a&]:hover:text-text [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
        gradient: [
          "bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 text-white",
          "border border-brand-400/30 shadow-2",
          "[a&]:hover:from-brand-600 [a&]:hover:via-brand-700 [a&]:hover:to-brand-800 [a&]:hover:shadow-3 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/5 before:to-white/20",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        ],
        feature: [
          "bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700",
          "border border-brand-200 shadow-1",
          "[a&]:hover:from-brand-100 [a&]:hover:to-brand-200 [a&]:hover:text-brand-800 [a&]:hover:scale-105",
          "[a&]:active:scale-95",
        ],
      },
      size: {
        xs: "px-2 py-0.5 text-xs rounded-md min-h-[20px]",
        sm: "px-2.5 py-0.5 text-xs rounded-md min-h-[24px]",
        default: "px-3 py-1 text-xs rounded-lg min-h-[28px]",
        lg: "px-4 py-1.5 text-sm rounded-lg min-h-[32px]",
        xl: "px-5 py-2 text-sm rounded-xl min-h-[36px]",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  interactive?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Badge({
  className,
  variant,
  size,
  interactive,
  asChild = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, interactive }), className)}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0">
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {rightIcon && (
        <span className="shrink-0">
          {rightIcon}
        </span>
      )}
    </Comp>
  )
}

// Status Badge for specific use cases
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
  showDot?: boolean
}

function StatusBadge({ 
  status, 
  showDot = true, 
  children, 
  className,
  ...props 
}: StatusBadgeProps) {
  const statusConfig = {
    online: { variant: "success" as const, label: "Online", dotColor: "bg-success" },
    offline: { variant: "secondary" as const, label: "Offline", dotColor: "bg-text-muted" },
    away: { variant: "warning" as const, label: "Away", dotColor: "bg-warning" },
    busy: { variant: "danger" as const, label: "Busy", dotColor: "bg-danger" },
    active: { variant: "success" as const, label: "Active", dotColor: "bg-success" },
    inactive: { variant: "secondary" as const, label: "Inactive", dotColor: "bg-text-muted" },
    pending: { variant: "warning" as const, label: "Pending", dotColor: "bg-warning" },
    completed: { variant: "success" as const, label: "Completed", dotColor: "bg-success" },
    failed: { variant: "danger" as const, label: "Failed", dotColor: "bg-danger" },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={className}
      leftIcon={showDot ? (
        <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      ) : undefined}
      {...props}
    >
      {children || config.label}
    </Badge>
  )
}

// Trend Badge for metrics
interface TrendBadgeProps extends Omit<BadgeProps, 'variant'> {
  trend: 'up' | 'down' | 'neutral'
  value: string
}

function TrendBadge({ trend, value, className, ...props }: TrendBadgeProps) {
  const trendConfig = {
    up: { 
      variant: "success" as const, 
      icon: "↗",
      className: "text-success bg-success-bg border-success-border"
    },
    down: { 
      variant: "danger" as const, 
      icon: "↘",
      className: "text-danger bg-danger-bg border-danger-border"
    },
    neutral: { 
      variant: "secondary" as const, 
      icon: "→",
      className: "text-text-muted bg-bg-muted border-border-subtle"
    },
  }

  const config = trendConfig[trend]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      leftIcon={<span className="font-semibold">{config.icon}</span>}
      {...props}
    >
      {value}
    </Badge>
  )
}

// Count Badge for notifications
interface CountBadgeProps extends Omit<BadgeProps, 'variant' | 'size'> {
  count: number
  max?: number
  showZero?: boolean
  size?: "xs" | "sm" | "default"
}

function CountBadge({ 
  count, 
  max = 99, 
  showZero = false, 
  size = "xs",
  className,
  ...props 
}: CountBadgeProps) {
  if (count === 0 && !showZero) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <Badge
      variant="danger"
      size={size}
      className={cn(
        "font-bold tabular-nums min-w-0 px-1.5",
        size === "xs" && "text-[10px] leading-none",
        className
      )}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}

export { 
  Badge, 
  StatusBadge, 
  TrendBadge, 
  CountBadge, 
  badgeVariants,
  type BadgeProps,
  type StatusBadgeProps,
  type TrendBadgeProps,
  type CountBadgeProps,
}
