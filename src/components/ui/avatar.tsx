import * as React from "react"
import { AvatarRoot, AvatarImage as ChakraAvatarImage, AvatarFallback as ChakraAvatarFallback } from "@chakra-ui/react"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarRoot>,
  React.ComponentPropsWithoutRef<typeof AvatarRoot>
>(({ className, ...props }, ref) => (
  <AvatarRoot
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof ChakraAvatarImage>,
  React.ComponentPropsWithoutRef<typeof ChakraAvatarImage>
>(({ className, ...props }, ref) => (
  <ChakraAvatarImage
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof ChakraAvatarFallback>,
  React.ComponentPropsWithoutRef<typeof ChakraAvatarFallback>
>(({ className, ...props }, ref) => (
  <ChakraAvatarFallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
