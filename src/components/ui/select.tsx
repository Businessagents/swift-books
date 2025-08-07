/**
 * Select Component - Chakra UI v3 wrapper
 * 
 * Provides a select dropdown using Chakra UI Select component.
 * Includes compatibility components for consistent API patterns.
 * 
 * @example
 * <Select>
 *   <SelectItem value="option1">Option 1</SelectItem>
 *   <SelectItem value="option2">Option 2</SelectItem>
 * </Select>
 */
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

// For API compatibility with component patterns, we provide these as passthrough components
const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectValue = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectLabel = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectItem = ({ children, value }: { children: React.ReactNode, value: string }) => (
  <option value={value}>{children}</option>
)
const SelectSeparator = () => <></>
const SelectScrollUpButton = () => <></>
const SelectScrollDownButton = () => <></>

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
