import * as React from "react"
import { FormLabel as ChakraFormLabel, FormLabelProps as ChakraFormLabelProps } from "@chakra-ui/react"

export interface LabelProps extends ChakraFormLabelProps {
  // Additional props can be added here if needed
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ ...props }, ref) => {
    return (
      <ChakraFormLabel
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
