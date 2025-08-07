import * as React from "react"
import { Box, BoxProps } from "@chakra-ui/react"

interface ScrollAreaProps extends BoxProps {
  children: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      overflowY="auto"
      position="relative"
      {...props}
    >
      {children}
    </Box>
  )
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = ({ orientation = "vertical", ...props }: { orientation?: 'vertical' | 'horizontal' }) => (
  // ScrollBar is handled automatically by the browser/Chakra UI
  null
)

export { ScrollArea, ScrollBar }
