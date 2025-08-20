import { ComponentProps } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

function Dialog({
  ...props
}: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Modern backdrop with enhanced blur
        "fixed inset-0 z-50 bg-bg-overlay backdrop-blur-xl",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=open]:duration-300 data-[state=closed]:duration-200",
        className
      )}
      {...props}
    />
  )
}

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  size?: "sm" | "default" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
  variant?: "default" | "glass" | "solid"
}

function DialogContent({
  className,
  children,
  size = "default",
  variant = "glass",
  ...props
}: DialogContentProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-xl", 
    xl: "max-w-2xl",
    "2xl": "max-w-4xl",
    "3xl": "max-w-6xl",
    "4xl": "max-w-7xl",
    full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
  }

  const variantClasses = {
    default: "bg-surface border border-border shadow-4",
    glass: "glass border border-border-subtle shadow-5",
    solid: "bg-surface border border-border shadow-3"
  }

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Base modern modal styling
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]",
          "gap-6 rounded-3xl p-8 text-text",
          
          // Size variants
          sizeClasses[size],
          
          // Variant styles
          variantClasses[variant],
          
          // Smooth animations with spring effect
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "data-[state=open]:duration-300 data-[state=closed]:duration-200",
          
          // Responsive adjustments
          "max-h-[calc(100vh-2rem)] overflow-auto",
          "mx-4 sm:mx-0",
          
          className
        )}
        {...props}
      >
        {children}
        
        {/* Enhanced close button */}
        <DialogPrimitive.Close className={cn(
          "absolute right-6 top-6 rounded-full p-2.5",
          "text-text-muted hover:text-text transition-modern",
          "hover:bg-surface-hover hover:scale-110",
          "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:pointer-events-none"
        )}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close dialog</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ 
  className, 
  ...props 
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-3 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ 
  className, 
  ...props 
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight text-text",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-text-secondary leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

// Enhanced AlertDialog for important confirmations
function AlertDialog({
  ...props
}: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

interface AlertDialogContentProps extends DialogContentProps {
  intent?: "info" | "warning" | "danger" | "success"
}

function AlertDialogContent({
  className,
  intent = "info",
  ...props
}: AlertDialogContentProps) {
  const intentClasses = {
    info: "border-info-border",
    warning: "border-warning-border", 
    danger: "border-danger-border",
    success: "border-success-border"
  }

  return (
    <DialogContent
      size="sm"
      className={cn(
        "gap-4 p-6",
        intentClasses[intent],
        className
      )}
      {...props}
    />
  )
}

// Modal for full-screen overlays
interface ModalProps extends ComponentProps<typeof DialogPrimitive.Content> {
  showClose?: boolean
  variant?: "default" | "fullscreen"
}

function Modal({
  className,
  children,
  showClose = true,
  variant = "default",
  ...props
}: ModalProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 text-text",
          variant === "fullscreen" ? [
            "inset-0 bg-surface",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200"
          ] : [
            "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
            "w-full max-w-4xl max-h-[90vh] overflow-auto",
            "rounded-3xl p-8 glass border border-border-subtle shadow-5",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=open]:duration-300 data-[state=closed]:duration-200"
          ],
          className
        )}
        {...props}
      >
        {children}
        
        {showClose && (
          <DialogPrimitive.Close className={cn(
            "absolute z-10 rounded-full p-2.5",
            "text-text-muted hover:text-text transition-modern",
            "hover:bg-surface-hover hover:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === "fullscreen" ? "right-4 top-4" : "right-6 top-6"
          )}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  AlertDialog,
  AlertDialogContent,
  Modal,
  type DialogContentProps,
  type AlertDialogContentProps,
  type ModalProps,
}
