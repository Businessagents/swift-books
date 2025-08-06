import * as React from "react"
import {
  AlertDialog as ChakraAlertDialog,
  AlertDialogOverlay as ChakraAlertDialogOverlay,
  AlertDialogContent as ChakraAlertDialogContent,
  AlertDialogHeader as ChakraAlertDialogHeader,
  AlertDialogBody as ChakraAlertDialogBody,
  AlertDialogFooter as ChakraAlertDialogFooter,
  AlertDialogCloseButton,
  Button,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react"

// AlertDialog components mapped to Chakra UI AlertDialog
const AlertDialog = ({ children, ...props }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const AlertDialogTrigger = ({ children, asChild, ...props }: { children: React.ReactNode, asChild?: boolean }) => {
  return <>{children}</>
}

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    isOpen?: boolean
    onClose?: () => void
    leastDestructiveRef?: React.RefObject<HTMLElement>
  }
>(({ children, isOpen = false, onClose = () => {}, leastDestructiveRef, ...props }, ref) => (
  <ChakraAlertDialog
    isOpen={isOpen}
    leastDestructiveRef={leastDestructiveRef}
    onClose={onClose}
  >
    <ChakraAlertDialogOverlay />
    <ChakraAlertDialogContent ref={ref} {...props}>
      {children}
    </ChakraAlertDialogContent>
  </ChakraAlertDialog>
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ChakraAlertDialogHeader ref={ref} {...props}>
    {children}
  </ChakraAlertDialogHeader>
))
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <ChakraAlertDialogFooter ref={ref} {...props}>
    {children}
  </ChakraAlertDialogFooter>
))
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Text ref={ref} fontSize="lg" fontWeight="bold" {...props}>
    {children}
  </Text>
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Text ref={ref} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} {...props}>
    {children}
  </Text>
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { colorScheme?: string }
>(({ children, colorScheme = "red", ...props }, ref) => (
  <Button ref={ref} colorScheme={colorScheme} {...props}>
    {children}
  </Button>
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <Button ref={ref} variant="outline" {...props}>
    {children}
  </Button>
))
AlertDialogCancel.displayName = "AlertDialogCancel"

// Keep these for compatibility
const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const AlertDialogOverlay = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
