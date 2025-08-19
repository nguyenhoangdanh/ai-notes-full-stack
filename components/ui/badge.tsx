import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-xl border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/90 text-primary-foreground [a&]:hover:from-primary/90 [a&]:hover:to-primary/80 [a&]:hover:shadow-md [a&]:hover:scale-105",
        secondary:
          "border-transparent glass-effect bg-secondary/80 text-secondary-foreground [a&]:hover:bg-secondary/90 [a&]:hover:shadow-md [a&]:hover:scale-105",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white [a&]:hover:from-red-600 [a&]:hover:to-red-700 [a&]:hover:shadow-md [a&]:hover:scale-105 focus-visible:ring-red-500/20",
        outline:
          "border-border/60 glass-effect text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:border-primary/40 [a&]:hover:shadow-sm [a&]:hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
