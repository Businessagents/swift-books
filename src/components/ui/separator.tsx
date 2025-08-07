import * as React from "react"
import { Separator as ChakraSeparator } from "@chakra-ui/react"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof ChakraSeparator>,
  React.ComponentPropsWithoutRef<typeof ChakraSeparator>
>(
  (
    { className, orientation = "horizontal", ...props },
    ref
  ) => (
    <ChakraSeparator
      ref={ref}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
