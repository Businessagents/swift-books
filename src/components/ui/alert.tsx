import * as React from "react"
import { 
  Alert as ChakraAlert, 
  AlertIcon, 
  AlertTitle as ChakraAlertTitle, 
  AlertDescription as ChakraAlertDescription,
  AlertProps as ChakraAlertProps
} from "@chakra-ui/react"

interface AlertProps extends ChakraAlertProps {
  variant?: 'default' | 'destructive'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', status, ...props }, ref) => {
    // Map variant to Chakra status
    const chakraStatus = variant === 'destructive' ? 'error' : (status || 'info')
    
    return (
      <ChakraAlert 
        ref={ref} 
        status={chakraStatus as any}
        borderRadius="lg"
        {...props} 
      />
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <ChakraAlertTitle ref={ref} {...props}>
      {children}
    </ChakraAlertTitle>
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <ChakraAlertDescription ref={ref} {...props}>
      {children}
    </ChakraAlertDescription>
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, AlertIcon }
