import { Plus, BookOpen, Folder, Sparkles, ArrowRight, CheckCircle, Bell, Eye, EyeOff } from "lucide-react"
import { ComponentProps, forwardRef, useState } from "react"
import { cn } from "../../lib/utils"
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
    placeholder,
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
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-primary superhuman-transition">
              <span className="flex items-center justify-center [&_svg]:size-4">
                {leftIcon}
              </span>
            </div>
          )}
          <input
            type={inputType}
            ref={ref}
            data-slot="input"
            placeholder={placeholder}
            className={cn(
              // Base Superhuman styles - pill-shaped, clean
              "flex h-12 w-full min-w-0 rounded-full border bg-background/50 text-sm superhuman-transition outline-none relative z-0",
              "placeholder:text-muted-foreground/50 selection:bg-primary/20 selection:text-primary",
              "backdrop-blur-sm",
              // Padding adjustments for icons
              leftIcon ? "pl-12" : "pl-6",
              rightIcon || clearable || isPassword ? "pr-12" : "pr-6",
              "py-3",
              // File input styles
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:bg-muted/30",
              "hover:file:bg-muted/50 file:superhuman-transition",
              // Normal state - Superhuman glass effect
              "border-border/30 shadow-sm superhuman-glass",
              "hover:border-border/50 hover:shadow-md hover:bg-background/70",
              // Focus state - enhanced Superhuman glow
              "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
              "focus:bg-background/80 focus:shadow-lg focus:backdrop-blur-md",
              "focus:superhuman-glow",
              // Error state
              error && [
                "border-red-400/60 bg-red-50/20 dark:bg-red-950/10",
                "focus:border-red-500 focus:ring-red-500/10",
                "shadow-sm shadow-red-500/10",
              ],
              // Success state
              success && [
                "border-emerald-400/60 bg-emerald-50/20 dark:bg-emerald-950/10",
                "focus:border-emerald-500 focus:ring-emerald-500/10",
                "shadow-sm shadow-emerald-500/10",
              ],
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/20",
              "disabled:border-border/20 disabled:shadow-none",
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
            {/* Clear button */}
            {clearable && props.value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-muted-foreground hover:text-foreground superhuman-transition rounded-full hover:bg-muted/30"
                aria-label="Clear input"
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Password toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-muted-foreground hover:text-foreground superhuman-transition rounded-full hover:bg-muted/30"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            )}
            {/* Custom right icon */}
            {rightIcon && !isPassword && (
              <div className="text-muted-foreground group-focus-within:text-primary superhuman-transition">
                <span className="flex items-center justify-center [&_svg]:size-4">
                  {rightIcon}
                </span>
              </div>
            )}
          </div>
          {/* Enhanced focus ring animation */}
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-primary/30 opacity-0 scale-95 superhuman-transition pointer-events-none",
            isFocused && "opacity-100 scale-100"
          )} />
        </div>
        {/* Helper text */}
        {helperText && (
          <p
            id={props.id ? `${props.id}-helper` : undefined}
            className={cn(
              "mt-2 text-sm superhuman-transition px-2",
              error ? "text-red-600 dark:text-red-400" : 
              success ? "text-emerald-600 dark:text-emerald-400" :
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
// Enhanced Textarea with Superhuman styling
const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & {
    error?: boolean
    success?: boolean
    helperText?: string
  }
>(({ className, error, success, helperText, placeholder, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <div className="w-full">
      <div className="relative group">
        <textarea
          ref={ref}
          data-slot="textarea"
          placeholder={placeholder}
          className={cn(
            // Base Superhuman styles
            "flex min-h-[120px] w-full rounded-2xl border bg-background/50 px-6 py-4 text-sm superhuman-transition outline-none resize-y",
            "placeholder:text-muted-foreground/50 selection:bg-primary/20 selection:text-primary",
            "backdrop-blur-sm",
            // Normal state
            "border-border/30 shadow-sm superhuman-glass",
            "hover:border-border/50 hover:shadow-md hover:bg-background/70",
            // Focus state
            "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
            "focus:bg-background/80 focus:shadow-lg focus:backdrop-blur-md",
            "focus:superhuman-glow",
            // Error state
            error && [
              "border-red-400/60 bg-red-50/20 dark:bg-red-950/10",
              "focus:border-red-500 focus:ring-red-500/10",
            ],
            // Success state
            success && [
              "border-emerald-400/60 bg-emerald-50/20 dark:bg-emerald-950/10",
              "focus:border-emerald-500 focus:ring-emerald-500/10",
            ],
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/20",
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
          "absolute inset-0 rounded-2xl border-2 border-primary/30 opacity-0 scale-95 superhuman-transition pointer-events-none",
          isFocused && "opacity-100 scale-100"
        )} />
      </div>
      {/* Helper text */}
      {helperText && (
        <p
          id={props.id ? `${props.id}-helper` : undefined}
          className={cn(
            "mt-2 text-sm superhuman-transition px-2",
            error ? "text-red-600 dark:text-red-400" : 
            success ? "text-emerald-600 dark:text-emerald-400" :
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
