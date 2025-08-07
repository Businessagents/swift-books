/**
 * Button Component - Chakra UI v3 wrapper
 * 
 * Provides API compatibility with standard button patterns while using Chakra UI underneath.
 * Maps variant props to appropriate Chakra button styles and color schemes.
 * 
 * @example
 * <Button variant="destructive" size="lg">Delete</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 */
import * as React from "react"
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react"

// Map variant props to Chakra UI button variants
const getChakraVariant = (variant?: string) => {
  switch (variant) {
    case 'default':
      return 'solid'
    case 'destructive':
      return 'solid'
    case 'outline':
      return 'outline'
    case 'secondary':
      return 'solid'
    case 'ghost':
      return 'ghost'
    case 'link':
      return 'ghost'
    case 'success':
      return 'solid'
    case 'warning':
      return 'solid'
    default:
      return 'solid'
  }
}

// Map variant props to Chakra UI color schemes
const getChakraColorScheme = (variant?: string) => {
  switch (variant) {
    case 'default':
      return 'primary'
    case 'destructive':
      return 'red'
    case 'outline':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'ghost':
      return 'primary'
    case 'link':
      return 'primary'
    case 'success':
      return 'success'
    case 'warning':
      return 'orange'
    default:
      return 'primary'
  }
}

// Map size props to Chakra UI button sizes
const getChakraSize = (size?: string) => {
  switch (size) {
    case 'sm':
      return 'sm'
    case 'lg':
      return 'lg'
    case 'icon':
      return 'md'
    case 'default':
    default:
      return 'md'
  }
}

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size' | 'colorScheme'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'gradient'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    // If asChild is true, we'll just render the children directly
    // This is a simplified approach since we don't have Slot
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ref, ...props })
    }

    return (
      <ChakraButton
        ref={ref}
        variant={getChakraVariant(variant)}
        colorScheme={getChakraColorScheme(variant)}
        size={getChakraSize(size)}
        {...props}
      >
        {children}
      </ChakraButton>
    )
  }
)
Button.displayName = "Button"

// Legacy export for compatibility
const buttonVariants = () => ""

export { Button, buttonVariants }
