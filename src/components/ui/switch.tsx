import * as React from "react"
import { Switch as ChakraSwitch, SwitchProps as ChakraSwitchProps } from "@chakra-ui/react"

export interface SwitchProps extends ChakraSwitchProps {
  // Additional props can be added here if needed
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ ...props }, ref) => {
    return (
      <ChakraSwitch
        ref={ref}
        {...props}
      />
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
