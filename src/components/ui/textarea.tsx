import * as React from "react"
import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps } from "@chakra-ui/react"

export interface TextareaProps extends ChakraTextareaProps {
  // Additional props can be added here if needed
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ ...props }, ref) => {
    return (
      <ChakraTextarea
        ref={ref}
        borderColor="gray.300"
        _focus={{ borderColor: "primary.500" }}
        _invalid={{ borderColor: "red.500" }}
        minH="80px"
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
