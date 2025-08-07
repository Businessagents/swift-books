import * as React from "react"
import { 
  Avatar as ChakraAvatar, 
  AvatarProps as ChakraAvatarProps,
  AvatarBadge,
  AvatarGroup
} from "@chakra-ui/react"

const Avatar = React.forwardRef<HTMLSpanElement, ChakraAvatarProps>(
  ({ ...props }, ref) => (
    <ChakraAvatar ref={ref} {...props} />
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = ({ src, alt, ...props }: { src?: string; alt?: string }) => (
  // In Chakra UI, the image is handled by the Avatar component itself via the src prop
  null
)

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    // In Chakra UI, fallback is handled by the Avatar component itself via the name prop
    // We return a simple div for compatibility
    <div ref={ref} {...props}>
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarBadge }
