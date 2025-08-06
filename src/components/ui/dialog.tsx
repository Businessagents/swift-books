import * as React from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  useDisclosure
} from "@chakra-ui/react"

// Dialog components mapped to Chakra UI Modal
const Dialog = ({ children, ...props }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const DialogTrigger = ({ children, asChild, ...props }: { children: React.ReactNode, asChild?: boolean }) => {
  return <>{children}</>
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    isOpen?: boolean
    onClose?: () => void
    size?: string
  }
>(({ children, isOpen = false, onClose = () => {}, size = "md", ...props }, ref) => (
  <Modal isOpen={isOpen} onClose={onClose} size={size}>
    <ModalOverlay />
    <ModalContent ref={ref} {...props}>
      {children}
    </ModalContent>
  </Modal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ModalHeader ref={ref} {...props}>
    {children}
  </ModalHeader>
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ModalFooter ref={ref} {...props}>
    {children}
  </ModalFooter>
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Text ref={ref} fontSize="lg" fontWeight="bold" {...props}>
    {children}
  </Text>
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Text ref={ref} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} {...props}>
    {children}
  </Text>
))
DialogDescription.displayName = "DialogDescription"

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => (
  <ModalCloseButton ref={ref} {...props} />
))
DialogClose.displayName = "DialogClose"

// Keep these for compatibility but they're not needed with Chakra Modal
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