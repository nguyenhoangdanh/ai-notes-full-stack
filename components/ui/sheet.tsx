import { ComponentProps } from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

function Sheet({ ...props }: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        // Superhuman overlay
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50",
        "bg-background/80 backdrop-blur-xl",
        "data-[state=open]:duration-200 data-[state=closed]:duration-150",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          // Base Superhuman sheet styling
          "bg-background/95 data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-6 shadow-2xl superhuman-transition ease-in-out",
          "border-border/30 superhuman-glass backdrop-blur-2xl",
          "data-[state=closed]:duration-200 data-[state=open]:duration-300",
          
          // Side-specific positioning and animations
          side === "right" && [
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm md:max-w-md lg:max-w-lg",
          ],
          side === "left" && [
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm md:max-w-md lg:max-w-lg",
          ],
          side === "top" && [
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
            "inset-x-0 top-0 h-auto max-h-[80vh] border-b rounded-b-3xl",
          ],
          side === "bottom" && [
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "inset-x-0 bottom-0 h-auto max-h-[80vh] border-t rounded-t-3xl",
          ],
          className
        )}
        {...props}
      >
        {children}
        {/* Superhuman close button */}
        <SheetPrimitive.Close className="absolute top-6 right-6 rounded-full p-2 opacity-60 superhuman-transition hover:opacity-100 hover:bg-muted/50 hover:scale-110 focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-3 p-6 pb-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-3 p-6 pt-4 border-t border-border/30", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
