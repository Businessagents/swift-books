import * as React from "react"
import { Input as ChakraInput, InputProps as ChakraInputProps } from "@chakra-ui/react"

export interface InputProps extends ChakraInputProps {
  // Additional props can be added here if needed
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ ...props }, ref) => {
    return (
      <ChakraInput
        ref={ref}
        focusBorderColor="primary.500"
        errorBorderColor="red.500"
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
