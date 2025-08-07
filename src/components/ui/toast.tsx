import * as React from "react"
import { Toast, ToastCloseTrigger, ToastDescription, ToastTitle, createToaster } from "@chakra-ui/react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Use Chakra UI v3 toast system
const toaster = createToaster()

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ToastComponent = React.forwardRef<
  React.ElementRef<typeof Toast>,
  React.ComponentPropsWithoutRef<typeof Toast> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <Toast
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
ToastComponent.displayName = "Toast"

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastCloseTrigger>,
  React.ComponentPropsWithoutRef<typeof ToastCloseTrigger>
>(({ className, ...props }, ref) => (
  <ToastCloseTrigger
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastCloseTrigger>
))
ToastClose.displayName = "ToastClose"

const ToastTitleComponent = React.forwardRef<
  React.ElementRef<typeof ToastTitle>,
  React.ComponentPropsWithoutRef<typeof ToastTitle>
>(({ className, ...props }, ref) => (
  <ToastTitle
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitleComponent.displayName = "ToastTitle"

const ToastDescriptionComponent = React.forwardRef<
  React.ElementRef<typeof ToastDescription>,
  React.ComponentPropsWithoutRef<typeof ToastDescription>
>(({ className, ...props }, ref) => (
  <ToastDescription
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescriptionComponent.displayName = "ToastDescription"

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastComponent>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  ToastComponent as Toast,
  ToastTitleComponent as ToastTitle,
  ToastDescriptionComponent as ToastDescription,
  ToastAction,
  ToastClose,
  toaster,
}