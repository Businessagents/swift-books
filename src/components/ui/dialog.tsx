import * as React from "react"
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent as ChakraDialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
  DialogTrigger as ChakraDialogTrigger
} from "@chakra-ui/react"

// Dialog components using new Chakra UI v3 Dialog API
const Dialog = ({ children, ...props }: React.ComponentProps<typeof DialogRoot>) => {
  return <DialogRoot {...props}>{children}</DialogRoot>
}

const DialogTrigger = ({ children, asChild, ...props }: React.ComponentProps<typeof ChakraDialogTrigger> & { asChild?: boolean }) => {
  return <ChakraDialogTrigger {...props}>{children}</ChakraDialogTrigger>
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChakraDialogContent>
>(({ children, ...props }, ref) => (
  <DialogBackdrop>
    <ChakraDialogContent ref={ref} {...props}>
      {children}
    </ChakraDialogContent>
  </DialogBackdrop>
))
DialogContent.displayName = "DialogContent"

const DialogHeaderComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogHeader>
>(({ children, ...props }, ref) => (
  <DialogHeader ref={ref} {...props}>
    {children}
  </DialogHeader>
))
DialogHeaderComponent.displayName = "DialogHeader"

const DialogFooterComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogFooter>
>(({ children, ...props }, ref) => (
  <DialogFooter ref={ref} {...props}>
    {children}
  </DialogFooter>
))
DialogFooterComponent.displayName = "DialogFooter"

const DialogTitleComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogTitle>
>(({ children, ...props }, ref) => (
  <DialogTitle ref={ref} {...props}>
    {children}
  </DialogTitle>
))
DialogTitleComponent.displayName = "DialogTitle"

const DialogDescriptionComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogDescription>
>(({ children, ...props }, ref) => (
  <DialogDescription ref={ref} {...props}>
    {children}
  </DialogDescription>
))
DialogDescriptionComponent.displayName = "DialogDescription"

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof DialogCloseTrigger> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => (
  <DialogCloseTrigger ref={ref} {...props}>{children}</DialogCloseTrigger>
))
DialogClose.displayName = "DialogClose"

// Keep these for compatibility
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DialogOverlay = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeaderComponent as DialogHeader,
  DialogFooterComponent as DialogFooter,
  DialogTitleComponent as DialogTitle,
  DialogDescriptionComponent as DialogDescription,
}