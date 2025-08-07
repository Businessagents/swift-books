import * as React from "react"
import { ProgressRoot, ProgressTrack, ProgressRange } from "@chakra-ui/react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressRoot>,
  React.ComponentPropsWithoutRef<typeof ProgressRoot>
>(({ className, value, ...props }, ref) => (
  <ProgressRoot
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    value={value}
    {...props}
  >
    <ProgressTrack>
      <ProgressRange className="h-full bg-primary transition-all" />
    </ProgressTrack>
  </ProgressRoot>
))
Progress.displayName = "Progress"

export { Progress }
