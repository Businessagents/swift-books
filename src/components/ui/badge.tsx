import * as React from "react"
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from "@chakra-ui/react"

// Use Chakra UI v3 Badge directly without compatibility layer
export interface BadgeProps extends ChakraBadgeProps {}

function Badge({ ...props }: BadgeProps) {
  return (
    <ChakraBadge 
      size="sm"
      borderRadius="full"
      {...props} 
    />
  )
}

export { Badge }
