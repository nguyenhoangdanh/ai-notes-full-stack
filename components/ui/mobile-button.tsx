'use client'

import { ComponentProps, forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:bg-primary/95 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        destructive:
          "bg-destructive text-white shadow-md hover:bg-destructive/90 active:bg-destructive/95 active:scale-95 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
        outline:
          "border-2 border-input bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
      },
      size: {
        default: "h-12 px-6 py-3 text-base mobile-tap-target",
        sm: "h-10 px-4 text-sm mobile-tap-target",
        lg: "h-14 px-8 text-lg mobile-tap-target",
        icon: "size-12 mobile-tap-target",
        "icon-sm": "size-10 mobile-tap-target",
        "icon-lg": "size-14 mobile-tap-target",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
)

interface MobileButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(mobileButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

MobileButton.displayName = "MobileButton"

export { MobileButton, mobileButtonVariants, type MobileButtonProps }
