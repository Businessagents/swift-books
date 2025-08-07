// This component is replaced by Chakra UI's native toast system
// Kept for compatibility but all functionality is handled by createToaster

import * as React from "react"
import { 
  Alert,
  AlertDescription,
  AlertTitle,
  CloseButton,
  Box
} from "@chakra-ui/react"
import { X } from "lucide-react"

// Legacy components for compatibility - these don't need to be functional
// since we're using Chakra UI's native toast system

const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
const ToastViewport = () => null

interface ToastProps {
  variant?: 'default' | 'destructive'
  children?: React.ReactNode
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'default', children }, ref) => (
    <Alert
      ref={ref}
      status={variant === 'destructive' ? 'error' : 'info'}
      borderRadius="md"
      boxShadow="lg"
    >
      {children}
    </Alert>
  )
)
Toast.displayName = "Toast"

const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <CloseButton ref={ref} {...props}>
      {children}
    </CloseButton>
  )
)
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ ...props }, ref) => (
    <CloseButton ref={ref} {...props}>
      <X size={16} />
    </CloseButton>
  )
)
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <AlertTitle ref={ref} {...props}>
      {children}
    </AlertTitle>
  )
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <AlertDescription ref={ref} {...props}>
      {children}
    </AlertDescription>
  )
)
ToastDescription.displayName = "ToastDescription"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
