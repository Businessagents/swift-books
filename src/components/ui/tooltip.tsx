import * as React from "react"
import { 
  Tooltip as ChakraTooltip, 
  TooltipProps as ChakraTooltipProps 
} from "@chakra-ui/react"

// TooltipProvider is not needed in Chakra UI, so we provide a noop
const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const Tooltip = ({ children, label, ...props }: { 
  children: React.ReactNode
  label?: string
} & ChakraTooltipProps) => {
  return (
    <ChakraTooltip label={label} {...props}>
      {children}
    </ChakraTooltip>
  )
}

const TooltipTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
