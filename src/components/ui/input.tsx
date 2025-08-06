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
        borderColor="gray.300"
        _focus={{ borderColor: "primary.500" }}
        _invalid={{ borderColor: "red.500" }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
