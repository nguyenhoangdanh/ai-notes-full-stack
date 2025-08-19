import { ComponentProps, forwardRef } from "react"

import { cn } from "../../lib/utils"

interface InputProps extends ComponentProps<"input"> {
  error?: boolean
  success?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          // Base styles
          "flex h-11 w-full min-w-0 rounded-xl border bg-background px-4 py-2.5 text-sm transition-all duration-200 outline-none",
          "placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground",

          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground file:mr-4 file:py-1 file:px-2 file:rounded-md file:bg-muted/50 hover:file:bg-muted/80",

          // Normal state
          "glass-effect border-border/40 shadow-sm",
          "hover:border-border/60 hover:shadow-md hover:scale-[1.01]",

          // Focus state
          "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20",
          "focus-visible:bg-background focus-visible:shadow-lg focus-visible:scale-[1.02]",

          // Error state
          error && [
            "border-red-500/50 bg-red-50/50 dark:bg-red-950/20 shadow-sm",
            "focus-visible:border-red-500 focus-visible:ring-red-500/20 focus-visible:shadow-lg",
          ],

          // Success state
          success && [
            "border-green-500/50 bg-green-50/50 dark:bg-green-950/20 shadow-sm",
            "focus-visible:border-green-500 focus-visible:ring-green-500/20 focus-visible:shadow-lg",
          ],

          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 disabled:hover:scale-100",

          className
        )}
        aria-invalid={error}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input, type InputProps }
