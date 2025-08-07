import * as React from "react"
import { 
  Avatar as ChakraAvatar, 
  AvatarProps as ChakraAvatarProps
} from "@chakra-ui/react"

/**
 * Avatar component based on Chakra UI v3.
 * In Chakra UI v3, Avatar doesn't use separate AvatarImage/AvatarFallback components.
 * Instead, pass the src directly to Avatar and children act as fallback content.
 */
const Avatar = React.forwardRef<HTMLDivElement, ChakraAvatarProps & { className?: string }>(
  ({ children, className, ...props }, ref) => (
    <ChakraAvatar ref={ref} {...props}>
      {children}
    </ChakraAvatar>
  )
)
Avatar.displayName = "Avatar"

/**
 * AvatarImage - not needed in Chakra UI v3, just pass src to Avatar directly
 */
const AvatarImage = ({ src, alt, ...props }: { src?: string; alt?: string }) => null

/**
 * AvatarFallback - not needed in Chakra UI v3, children of Avatar act as fallback
 */
const AvatarFallback = ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => (
  <>{children}</>
)

/**
 * AvatarGroup - wrapper for multiple avatars
 */
const AvatarGroup = ({ children, ...props }: { children: React.ReactNode }) => (
  <div style={{ display: "flex" }} {...props}>
    {children}
  </div>
)

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup }