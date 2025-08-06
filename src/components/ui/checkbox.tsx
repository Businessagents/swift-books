import * as React from "react"
import { Checkbox as ChakraCheckbox, CheckboxProps as ChakraCheckboxProps } from "@chakra-ui/react"

export interface CheckboxProps extends ChakraCheckboxProps {
  // Additional props can be added here if needed
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ ...props }, ref) => {
    return (
      <ChakraCheckbox
        ref={ref}
        colorScheme="primary"
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
