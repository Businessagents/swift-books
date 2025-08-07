import * as React from "react"
import { RadioGroupRoot, RadioGroupItem as ChakraRadioGroupItem, RadioGroupItemControl, RadioGroupItemIndicator } from "@chakra-ui/react"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupRoot>,
  React.ComponentPropsWithoutRef<typeof RadioGroupRoot>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupRoot
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof ChakraRadioGroupItem>,
  React.ComponentPropsWithoutRef<typeof ChakraRadioGroupItem>
>(({ className, ...props }, ref) => {
  return (
    <ChakraRadioGroupItem
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <RadioGroupItemControl
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <RadioGroupItemIndicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupItemIndicator>
      </RadioGroupItemControl>
    </ChakraRadioGroupItem>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
