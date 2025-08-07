import * as React from "react"
import { FieldLabel, FieldLabelProps } from "@chakra-ui/react"

export interface LabelProps extends FieldLabelProps {
  // Additional props can be added here if needed
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ ...props }, ref) => {
    return (
      <FieldLabel
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
