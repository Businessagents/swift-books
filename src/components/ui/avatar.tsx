import * as React from "react"
import { 
  Avatar as ChakraAvatar, 
  AvatarProps as ChakraAvatarProps,
  AvatarGroup,
  AvatarFallback as ChakraAvatarFallback,
  AvatarImage as ChakraAvatarImage
} from "@chakra-ui/react"

const Avatar = React.forwardRef<HTMLSpanElement, ChakraAvatarProps>(
  ({ ...props }, ref) => (
    <ChakraAvatar ref={ref} {...props} />
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = ({ src, alt, ...props }: { src?: string; alt?: string }) => (
  <ChakraAvatarImage src={src} alt={alt} {...props} />
)

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <ChakraAvatarFallback ref={ref} {...props}>
      {children}
    </ChakraAvatarFallback>
  )
)
AvatarFallback.displayName = "AvatarFallback"

// For compatibility, create AvatarBadge as a simple wrapper around AvatarFallback
const AvatarBadge = AvatarFallback

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarBadge }
