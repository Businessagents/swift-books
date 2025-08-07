import * as React from "react"
import { 
  Avatar as ChakraAvatar, 
  AvatarProps as ChakraAvatarProps,
  AvatarGroup,
  AvatarFallback as ChakraAvatarFallback,
  AvatarImage as ChakraAvatarImage
} from "@chakra-ui/react"

/**
 * Avatar component based on Chakra UI v3.
 */
const Avatar = React.forwardRef<HTMLSpanElement, ChakraAvatarProps>(
  ({ ...props }, ref) => (
    <ChakraAvatar ref={ref} {...props} />
  )
)
Avatar.displayName = "Avatar"

/**
 * AvatarImage wrapper for Chakra UI AvatarImage.
 */
const AvatarImage = ({ src, alt, ...props }: { src?: string; alt?: string }) => (
  <ChakraAvatarImage src={src} alt={alt} {...props} />
)

/**
 * AvatarFallback wrapper for Chakra UI AvatarFallback.
 */
const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <ChakraAvatarFallback ref={ref} {...props}>
      {children}
    </ChakraAvatarFallback>
  )
)
AvatarFallback.displayName = "AvatarFallback"

/**
 * To display a status badge (such as online/offline) on an Avatar in Chakra UI v3,
 * place a Box as a child of the Avatar and absolutely position it in the bottom right.
 * Example usage:
 * 
 * <Avatar>
 *   <AvatarImage src="..." alt="..." />
 *   <Box
 *     as="span"
 *     position="absolute"
 *     bottom="0"
 *     right="0"
 *     boxSize="1em"
 *     bg="green.400"
 *     border="2px solid white"
 *     borderRadius="full"
 *   />
 * </Avatar>
 * 
 * This replaces the old AvatarBadge pattern. See Chakra UI v3 docs for more.
 */

// Removed AvatarBadge compatibility export since it's not part of Chakra UI v3

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup }