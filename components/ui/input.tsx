import { ComponentProps, forwardRef, useState } from "react"
import { cn } from "../../lib/utils"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

interface InputProps extends ComponentProps<"input"> {
  error?: boolean
  success?: boolean
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    success, 
    helperText,
    leftIcon,
    rightIcon,
    clearable,
    onClear,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
    }

    return (
      <div className="w-full">
        <div className="relative group">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-accent transition-colors duration-200">
              <span className="flex items-center justify-center [&_svg]:size-4">
                {leftIcon}
              </span>
            </div>
          )}

          <input
            type={inputType}
            ref={ref}
            data-slot="input"
            className={cn(
              // Base styles
              "flex h-11 w-full min-w-0 rounded-xl border bg-background text-sm transition-all duration-200 outline-none relative z-0",
              "placeholder:text-muted-foreground/60 selection:bg-accent selection:text-accent-contrast",
              
              // Padding adjustments for icons
              leftIcon ? "pl-10" : "pl-4",
              rightIcon || clearable || isPassword ? "pr-10" : "pr-4",
              "py-2.5",

              // File input styles
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:bg-muted/50",
              "hover:file:bg-muted/80 file:transition-colors file:duration-200",

              // Normal state
              "glass-effect border-border/40 shadow-sm backdrop-blur-sm",
              "hover:border-border/60 hover:shadow-md",

              // Focus state
              "focus:border-accent focus:ring-4 focus:ring-accent/15",
              "focus:bg-background/80 focus:shadow-lg focus:backdrop-blur-md",

              // Error state
              error && [
                "border-red-500/60 bg-red-50/30 dark:bg-red-950/10",
                "focus:border-red-500 focus:ring-red-500/15",
                "shadow-sm shadow-red-500/10",
              ],

              // Success state
              success && [
                "border-green-500/60 bg-green-50/30 dark:bg-green-950/10",
                "focus:border-green-500 focus:ring-green-500/15",
                "shadow-sm shadow-green-500/10",
              ],

              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/30",
              "disabled:border-border/30 disabled:shadow-none",

              // Reduced motion support
              "@media (prefers-reduced-motion: reduce) { transition-duration: 1ms }",

              className
            )}
            aria-invalid={error}
            aria-describedby={helperText ? `${props.id}-helper` : undefined}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {/* Right side icons/actions */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
            {/* Clear button */}
            {clearable && props.value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-muted/50"
                aria-label="Clear input"
              >
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Password toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-muted/50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            )}

            {/* Custom right icon */}
            {rightIcon && !isPassword && (
              <div className="text-muted-foreground group-focus-within:text-accent transition-colors duration-200">
                <span className="flex items-center justify-center [&_svg]:size-4">
                  {rightIcon}
                </span>
              </div>
            )}
          </div>

          {/* Focus ring animation */}
          <div className={cn(
            "absolute inset-0 rounded-xl border-2 border-accent/30 opacity-0 scale-95 transition-all duration-200 pointer-events-none",
            isFocused && "opacity-100 scale-100"
          )} />
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            id={props.id ? `${props.id}-helper` : undefined}
            className={cn(
              "mt-1.5 text-sm transition-colors duration-200",
              error ? "text-red-600 dark:text-red-400" : 
              success ? "text-green-600 dark:text-green-400" :
              "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

// Textarea component with similar styling
const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & {
    error?: boolean
    success?: boolean
    helperText?: string
  }
>(({ className, error, success, helperText, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="w-full">
      <div className="relative group">
        <textarea
          ref={ref}
          data-slot="textarea"
          className={cn(
            // Base styles
            "flex min-h-[120px] w-full rounded-xl border bg-background px-4 py-3 text-sm transition-all duration-200 outline-none resize-y",
            "placeholder:text-muted-foreground/60 selection:bg-accent selection:text-accent-contrast",

            // Normal state
            "glass-effect border-border/40 shadow-sm backdrop-blur-sm",
            "hover:border-border/60 hover:shadow-md",

            // Focus state
            "focus:border-accent focus:ring-4 focus:ring-accent/15",
            "focus:bg-background/80 focus:shadow-lg focus:backdrop-blur-md",

            // Error state
            error && [
              "border-red-500/60 bg-red-50/30 dark:bg-red-950/10",
              "focus:border-red-500 focus:ring-red-500/15",
            ],

            // Success state
            success && [
              "border-green-500/60 bg-green-50/30 dark:bg-green-950/10",
              "focus:border-green-500 focus:ring-green-500/15",
            ],

            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/30",

            className
          )}
          aria-invalid={error}
          aria-describedby={helperText ? `${props.id}-helper` : undefined}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Focus ring animation */}
        <div className={cn(
          "absolute inset-0 rounded-xl border-2 border-accent/30 opacity-0 scale-95 transition-all duration-200 pointer-events-none",
          isFocused && "opacity-100 scale-100"
        )} />
      </div>

      {/* Helper text */}
      {helperText && (
        <p
          id={props.id ? `${props.id}-helper` : undefined}
          className={cn(
            "mt-1.5 text-sm transition-colors duration-200",
            error ? "text-red-600 dark:text-red-400" : 
            success ? "text-green-600 dark:text-green-400" :
            "text-muted-foreground"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = "Textarea"

export { Input, Textarea, type InputProps }
