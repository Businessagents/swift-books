import * as React from "react"
import { Divider, DividerProps } from "@chakra-ui/react"

interface SeparatorProps extends DividerProps {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", decorative = true, ...props }, ref) => (
    <Divider
      ref={ref}
      orientation={orientation}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
