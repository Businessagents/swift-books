// SwiftBooks Button Component - Ant Design wrapper
import React from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'

interface ButtonProps extends Omit<AntButtonProps, 'variant'> {
  variant?: 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text'
  size?: 'small' | 'middle' | 'large'
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  children, 
  ...props 
}) => {
  // Map variant to Ant Design type
  const getType = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'primary'
      case 'ghost':
        return 'default'
      case 'dashed':
        return 'dashed'
      case 'link':
        return 'link'
      case 'text':
        return 'text'
      default:
        return 'default'
    }
  }

  return (
    <AntButton type={getType(variant)} {...props}>
      {children}
    </AntButton>
  )
}

export default Button
