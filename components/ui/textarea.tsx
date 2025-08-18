import { ComponentProps, forwardRef } from "react"

import { cn } from "../../lib/utils"

interface TextareaProps extends ComponentProps<"textarea"> {
  error?: boolean
  success?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, resize = "vertical", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          // Base styles
          "flex min-h-[80px] w-full rounded-lg border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm transition-all duration-200 outline-none",
          "placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground",
          
          // Resize behavior
          {
            "resize-none": resize === "none",
            "resize-y": resize === "vertical", 
            "resize-x": resize === "horizontal",
            "resize": resize === "both",
          },
          
          // Normal state
          "border-input hover:border-input/80 hover:bg-background/80",
          
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

Textarea.displayName = "Textarea"

export { Textarea, type TextareaProps }
