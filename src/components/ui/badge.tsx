import * as React from "react"
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from "@chakra-ui/react"

export interface BadgeProps extends Omit<ChakraBadgeProps, 'variant' | 'colorScheme'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'
}

const getChakraColorScheme = (variant?: string) => {
  switch (variant) {
    case 'default':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'destructive':
      return 'red'
    case 'success':
      return 'success'
    case 'warning':
      return 'orange'
    case 'outline':
      return 'gray'
    default:
      return 'primary'
  }
}

const getChakraVariant = (variant?: string) => {
  switch (variant) {
    case 'outline':
      return 'outline'
    default:
      return 'solid'
  }
}

function Badge({ variant = 'default', ...props }: BadgeProps) {
  return (
    <ChakraBadge 
      colorScheme={getChakraColorScheme(variant)}
      variant={getChakraVariant(variant)}
      size="sm"
      borderRadius="full"
      {...props} 
    />
  )
}

// Legacy export for compatibility
const badgeVariants = () => ""

export { Badge, badgeVariants }
