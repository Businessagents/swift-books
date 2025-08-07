import * as React from "react"
import { Select as ChakraSelect, SelectProps as ChakraSelectProps } from "@chakra-ui/react"

// Use Chakra UI Select directly without shadcn/ui compatibility layer
export interface SelectProps extends ChakraSelectProps {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraSelect
        ref={ref}
        borderColor="gray.300"
        _focus={{ borderColor: "primary.500" }}
        _invalid={{ borderColor: "red.500" }}
        {...props}
      >
        {children}
      </ChakraSelect>
    )
  }
)
Select.displayName = "Select"

export { Select }
