import * as React from "react"
import { PopoverRoot, PopoverTrigger as ChakraPopoverTrigger, PopoverContent as ChakraPopoverContent, PopoverPositioner } from "@chakra-ui/react"

import { cn } from "@/lib/utils"

const Popover = PopoverRoot

const PopoverTrigger = ChakraPopoverTrigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof ChakraPopoverContent>,
  React.ComponentPropsWithoutRef<typeof ChakraPopoverContent>
>(({ className, ...props }, ref) => (
  <PopoverPositioner>
    <ChakraPopoverContent
      ref={ref}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    />
  </PopoverPositioner>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
