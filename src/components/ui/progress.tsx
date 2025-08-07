import * as React from "react"
import { Progress as ChakraProgress, ProgressProps as ChakraProgressProps } from "@chakra-ui/react"

interface ProgressProps extends ChakraProgressProps {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, ...props }, ref) => (
    <ChakraProgress
      ref={ref}
      value={value}
      size="md"
      borderRadius="full"
      {...props}
    />
  )
)
Progress.displayName = "Progress"

export { Progress }
