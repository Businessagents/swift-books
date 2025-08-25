import * as React from "react"
import { Avatar as AntAvatar } from "antd"
import type { AvatarProps as AntAvatarProps } from "antd"

/**
 * Avatar component based on Ant Design.
 */
const Avatar = React.forwardRef<HTMLDivElement, AntAvatarProps & { className?: string }>(
  ({ children, className, ...props }, ref) => (
    <AntAvatar {...props}>
      {children}
    </AntAvatar>
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, React.ComponentProps<"img">>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={className}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }