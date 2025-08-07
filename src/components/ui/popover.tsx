import * as React from "react"
import { 
  PopoverRoot, 
  PopoverTrigger as ChakraPopoverTrigger, 
  PopoverContent as ChakraPopoverContent,
  PopoverBody,
  PopoverArrow
} from "@chakra-ui/react"

const Popover = ({ children, ...props }: { children: React.ReactNode }) => (
  <PopoverRoot {...props}>{children}</PopoverRoot>
)

const PopoverTrigger = ({ children, ...props }: { children: React.ReactNode }) => (
  <ChakraPopoverTrigger {...props}>{children}</ChakraPopoverTrigger>
)

const PopoverContent = React.forwardRef<HTMLDivElement, { 
  children: React.ReactNode
  align?: 'center' | 'start' | 'end'
  sideOffset?: number
}>(({ children, align = "center", sideOffset = 4, ...props }, ref) => (
  <ChakraPopoverContent
    ref={ref}
    borderRadius="md"
    boxShadow="lg"
    border="1px solid"
    borderColor="gray.200"
    _dark={{ borderColor: "gray.600" }}
    {...props}
  >
    <PopoverArrow />
    <PopoverBody>
      {children}
    </PopoverBody>
  </ChakraPopoverContent>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
