import { ComponentProps, forwardRef } from "react"

import { cn } from "../../lib/utils"

interface CardProps extends ComponentProps<"div"> {
  variant?: "default" | "elevated" | "outlined" | "ghost"
  padding?: "none" | "sm" | "md" | "lg"
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          "flex flex-col rounded-2xl border transition-all duration-300 group",
          {
            // Variants
            "glass-effect border-border/40 shadow-md hover:shadow-lg hover:border-border/60 hover:scale-[1.02]": variant === "default",
            "glass-effect border-border/30 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] shadow-colored": variant === "elevated",
            "bg-transparent border-2 border-border/60 hover:border-primary/40 hover:bg-card/20 hover:backdrop-blur-sm hover:shadow-sm": variant === "outlined",
            "bg-transparent border-transparent hover:bg-card/20 hover:backdrop-blur-sm": variant === "ghost",

            // Padding
            "p-0": padding === "none",
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
          },
          "text-card-foreground",
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
