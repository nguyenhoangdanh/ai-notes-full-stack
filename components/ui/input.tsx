import { ComponentProps, forwardRef, useState } from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  error?: boolean
  success?: boolean
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  variant?: "default" | "filled" | "ghost"
  size?: "sm" | "default" | "lg"
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
    variant = "default",
    size = "default",
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

    const sizeClasses = {
      sm: "h-9 text-sm",
      default: "h-12 text-sm",
      lg: "h-14 text-base"
    }

    const paddingClasses = {
      sm: cn(
        leftIcon ? "pl-9" : "pl-4",
        rightIcon || clearable || isPassword ? "pr-9" : "pr-4"
      ),
      default: cn(
        leftIcon ? "pl-12" : "pl-6",
        rightIcon || clearable || isPassword ? "pr-12" : "pr-6"
      ),
      lg: cn(
        leftIcon ? "pl-14" : "pl-8",
        rightIcon || clearable || isPassword ? "pr-14" : "pr-8"
      )
    }

    const iconSizes = {
      sm: "size-4",
      default: "size-4",
      lg: "size-5"
    }

    const iconPositions = {
      sm: { left: "left-3", right: "right-3" },
      default: { left: "left-4", right: "right-4" },
      lg: { left: "left-5", right: "right-5" }
    }

    return (
      <div className="w-full">
        <div className="relative group">
          {/* Left icon */}
          {leftIcon && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10 text-text-muted group-focus-within:text-brand-600 transition-fast",
              iconPositions[size].left
            )}>
              <span className={cn("flex items-center justify-center", `[&_svg]:${iconSizes[size]}`)}>
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
              // Base modern styles
              "flex w-full min-w-0 outline-none transition-modern relative z-0",
              "placeholder:text-text-subtle selection:bg-brand-100 selection:text-brand-900",
              sizeClasses[size],
              paddingClasses[size],
              "py-3",
              
              // File input styles
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text",
              "file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:bg-bg-muted",
              "hover:file:bg-bg-subtle file:transition-fast",

              // Variant styles
              variant === "default" && [
                "rounded-full border bg-surface text-text",
                "border-border hover:border-border-strong",
                "focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
                "shadow-1 hover:shadow-2 focus:shadow-2"
              ],
              
              variant === "filled" && [
                "rounded-xl border-0 bg-bg-muted text-text",
                "hover:bg-bg-subtle",
                "focus:bg-surface focus:ring-4 focus:ring-brand-100",
                "shadow-none hover:shadow-1 focus:shadow-1"
              ],
              
              variant === "ghost" && [
                "rounded-lg border-0 bg-transparent text-text",
                "hover:bg-bg-muted",
                "focus:bg-surface focus:ring-2 focus:ring-brand-200",
                "shadow-none"
              ],

              // State styles
              error && [
                "border-danger-border bg-danger-bg text-text",
                "focus:border-danger focus:ring-danger/20",
                "shadow-1"
              ],
              
              success && [
                "border-success-border bg-success-bg text-text",
                "focus:border-success focus:ring-success/20",
                "shadow-1"
              ],
              
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-muted",
              "disabled:border-border-subtle disabled:shadow-none",
              
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
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 z-10 flex items-center gap-1",
            iconPositions[size].right
          )}>
            {/* Clear button */}
            {clearable && props.value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-text-muted hover:text-text transition-fast rounded-md hover:bg-bg-muted"
                aria-label="Clear input"
              >
                <X className={iconSizes[size]} />
              </button>
            )}
            
            {/* Password toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-text-muted hover:text-text transition-fast rounded-md hover:bg-bg-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className={iconSizes[size]} />
                ) : (
                  <Eye className={iconSizes[size]} />
                )}
              </button>
            )}
            
            {/* Custom right icon */}
            {rightIcon && !isPassword && (
              <div className="text-text-muted group-focus-within:text-brand-600 transition-fast">
                <span className={cn("flex items-center justify-center", `[&_svg]:${iconSizes[size]}`)}>
                  {rightIcon}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            id={props.id ? `${props.id}-helper` : undefined}
            className={cn(
              "mt-2 text-sm transition-fast px-2",
              error ? "text-danger" : 
              success ? "text-success" :
              "text-text-muted"
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

// Enhanced Textarea with modern styling
const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & {
    error?: boolean
    success?: boolean
    helperText?: string
    variant?: "default" | "filled" | "ghost"
    resize?: boolean
  }
>(({ 
  className, 
  error, 
  success, 
  helperText, 
  placeholder, 
  variant = "default",
  resize = true,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="w-full">
      <div className="relative group">
        <textarea
          ref={ref}
          data-slot="textarea"
          placeholder={placeholder}
          className={cn(
            // Base modern styles
            "flex min-h-[120px] w-full px-6 py-4 text-sm transition-modern outline-none",
            "placeholder:text-text-subtle selection:bg-brand-100 selection:text-brand-900",
            resize ? "resize-y" : "resize-none",
            
            // Variant styles
            variant === "default" && [
              "rounded-2xl border bg-surface text-text",
              "border-border hover:border-border-strong",
              "focus:border-brand-500 focus:ring-4 focus:ring-brand-100",
              "shadow-1 hover:shadow-2 focus:shadow-2"
            ],
            
            variant === "filled" && [
              "rounded-xl border-0 bg-bg-muted text-text",
              "hover:bg-bg-subtle",
              "focus:bg-surface focus:ring-4 focus:ring-brand-100",
              "shadow-none hover:shadow-1 focus:shadow-1"
            ],
            
            variant === "ghost" && [
              "rounded-lg border-0 bg-transparent text-text",
              "hover:bg-bg-muted",
              "focus:bg-surface focus:ring-2 focus:ring-brand-200",
              "shadow-none"
            ],

            // State styles
            error && [
              "border-danger-border bg-danger-bg text-text",
              "focus:border-danger focus:ring-danger/20"
            ],
            
            success && [
              "border-success-border bg-success-bg text-text", 
              "focus:border-success focus:ring-success/20"
            ],
            
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-muted",
            
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
      </div>
      
      {/* Helper text */}
      {helperText && (
        <p
          id={props.id ? `${props.id}-helper` : undefined}
          className={cn(
            "mt-2 text-sm transition-fast px-2",
            error ? "text-danger" : 
            success ? "text-success" :
            "text-text-muted"
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
