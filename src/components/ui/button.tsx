import * as React from "react"
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react"
import { Slot } from "@radix-ui/react-slot"

// Define button variant mapping from Tailwind to Chakra
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
      return 'link'
    case 'success':
      return 'solid'
    case 'warning':
      return 'solid'
    default:
      return 'solid'
  }
}

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
    if (asChild) {
      return <Slot ref={ref}>{children}</Slot>
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
