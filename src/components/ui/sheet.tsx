import * as React from "react"
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react"

// Sheet components mapped to Chakra UI Drawer
const Sheet = ({ children, ...props }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SheetTrigger = ({ children, asChild, ...props }: { children: React.ReactNode, asChild?: boolean }) => {
  return <>{children}</>
}

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    isOpen?: boolean
    onClose?: () => void
    placement?: "top" | "right" | "bottom" | "left"
    size?: string
    side?: "top" | "right" | "bottom" | "left"
  }
>(({ children, isOpen = false, onClose = () => {}, placement, side, size = "md", ...props }, ref) => (
  <Drawer 
    isOpen={isOpen} 
    onClose={onClose} 
    placement={placement || side || "right"}
    size={size}
  >
    <DrawerOverlay />
    <DrawerContent ref={ref} {...props}>
      <DrawerCloseButton />
      {children}
    </DrawerContent>
  </Drawer>
))
SheetContent.displayName = "SheetContent"

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <DrawerHeader ref={ref} {...props}>
    {children}
  </DrawerHeader>
))
SheetHeader.displayName = "SheetHeader"

const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <DrawerFooter ref={ref} {...props}>
    {children}
  </DrawerFooter>
))
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Text ref={ref} fontSize="lg" fontWeight="bold" {...props}>
    {children}
  </Text>
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Text ref={ref} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} {...props}>
    {children}
  </Text>
))
SheetDescription.displayName = "SheetDescription"

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => (
  <DrawerCloseButton ref={ref} {...props} />
))
SheetClose.displayName = "SheetClose"

// Keep these for compatibility but they're not needed with Chakra Drawer
const SheetPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SheetOverlay = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  Sheet, 
  SheetClose,
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetOverlay, 
  SheetPortal, 
  SheetTitle, 
  SheetTrigger
}

