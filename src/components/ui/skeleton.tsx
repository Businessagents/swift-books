import { Skeleton as ChakraSkeleton, SkeletonProps as ChakraSkeletonProps } from "@chakra-ui/react"
import { forwardRef } from "react"

interface SkeletonProps extends Omit<ChakraSkeletonProps, 'isLoaded'> {
  className?: string // For backward compatibility
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <ChakraSkeleton
        ref={ref}
        borderRadius="md"
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
