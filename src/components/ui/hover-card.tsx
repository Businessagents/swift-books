import * as React from "react"
import { HoverCardRoot, HoverCardTrigger as ChakraHoverCardTrigger, HoverCardContent as ChakraHoverCardContent, HoverCardPositioner } from "@chakra-ui/react"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardRoot

const HoverCardTrigger = ChakraHoverCardTrigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof ChakraHoverCardContent>,
  React.ComponentPropsWithoutRef<typeof ChakraHoverCardContent>
>(({ className, ...props }, ref) => (
  <HoverCardPositioner>
    <ChakraHoverCardContent
      ref={ref}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    />
  </HoverCardPositioner>
))
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
