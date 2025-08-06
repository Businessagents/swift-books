import * as React from "react"
import { FieldLabel as ChakraFieldLabel, FieldLabel } from "@chakra-ui/react"

export interface LabelProps extends React.ComponentProps<typeof FieldLabel> {
  // Additional props can be added here if needed
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ ...props }, ref) => {
    return (
      <ChakraFieldLabel
        ref={ref}
        fontSize="sm"
        fontWeight="medium"
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }
