import * as React from "react"
import { Button, ButtonProps } from "@chakra-ui/react"

interface ToggleProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const getChakraVariant = (variant?: string, pressed?: boolean) => {
  if (pressed) {
    return 'solid'
  }
  return variant === 'outline' ? 'outline' : 'ghost'
}

const getChakraColorScheme = (pressed?: boolean) => {
  return pressed ? 'primary' : 'gray'
}

const getChakraSize = (size?: string) => {
  switch (size) {
    case 'sm':
      return 'sm'
    case 'lg':
      return 'lg'
    case 'default':
    default:
      return 'md'
  }
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ variant = 'default', size = 'default', pressed, onPressedChange, children, ...props }, ref) => (
    <Button
      ref={ref}
      variant={getChakraVariant(variant, pressed)}
      colorScheme={getChakraColorScheme(pressed)}
      size={getChakraSize(size)}
      borderRadius="md"
      fontWeight="medium"
      onClick={() => onPressedChange?.(!pressed)}
      aria-pressed={pressed}
      {...props}
    >
      {children}
    </Button>
  )
)

Toggle.displayName = "Toggle"

// Legacy export for compatibility
const toggleVariants = () => ""

export { Toggle, toggleVariants }
