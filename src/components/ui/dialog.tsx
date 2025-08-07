import * as React from "react"
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent as ChakraDialogContent,
  DialogHeader as ChakraDialogHeader,
  DialogBody,
  DialogFooter as ChakraDialogFooter,
  DialogTitle as ChakraDialogTitle,
  DialogDescription as ChakraDialogDescription,
  DialogCloseTrigger,
  DialogTrigger as ChakraDialogTrigger,
  Button,
  VStack,
  Text,
  Box
} from "@chakra-ui/react"

// Dialog components mapped to Chakra UI Dialog
const Dialog = ({ children, open, onOpenChange, ...props }: { 
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </DialogRoot>
  )
}

const DialogTrigger = ({ children, asChild, ...props }: { children: React.ReactNode, asChild?: boolean }) => {
  return <ChakraDialogTrigger asChild={asChild} {...props}>{children}</ChakraDialogTrigger>
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <>
    <DialogBackdrop />
    <ChakraDialogContent ref={ref} {...props}>
      {children}
    </ChakraDialogContent>
  </>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ChakraDialogHeader ref={ref} {...props}>
    {children}
  </ChakraDialogHeader>
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ChakraDialogFooter ref={ref} {...props}>
    {children}
  </ChakraDialogFooter>
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ChakraDialogTitle ref={ref} {...props}>
    {children}
  </ChakraDialogTitle>
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ChakraDialogDescription ref={ref} {...props}>
    {children}
  </ChakraDialogDescription>
))
DialogDescription.displayName = "DialogDescription"

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => (
  <DialogCloseTrigger asChild={asChild} ref={ref} {...props}>
    {children}
  </DialogCloseTrigger>
))
DialogClose.displayName = "DialogClose"

// Keep these for compatibility but they're not needed with Chakra Dialog
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DialogOverlay = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}