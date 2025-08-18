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
          "flex h-10 w-full min-w-0 rounded-lg border bg-background px-4 py-2 text-sm transition-all duration-200 outline-none",
          "placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground",

          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground file:mr-4 file:py-1 file:px-2 file:rounded-md file:bg-muted/50 hover:file:bg-muted/80",

          // Normal state
          "border-input bg-background/50 backdrop-blur-sm",
          "hover:border-input/80 hover:bg-background/80",

          // Focus state
          "focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
          "focus-visible:bg-background focus-visible:shadow-sm",

          // Error state
          error && [
            "border-destructive/50 bg-destructive/5",
            "focus-visible:border-destructive focus-visible:ring-destructive/20",
          ],

          // Success state
          success && [
            "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
            "focus-visible:border-green-500 focus-visible:ring-green-500/20",
          ],

          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",

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
