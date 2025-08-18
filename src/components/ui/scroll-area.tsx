import * as React from "react"
import { Box } from "@chakra-ui/react"

// Simple scroll area implementation using Chakra Box
const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <Box
    ref={ref}
    className={className}
    overflowY="auto"
    maxHeight="400px"
    {...props}
  >
    {children}
  </Box>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
