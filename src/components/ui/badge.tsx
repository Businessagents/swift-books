// SwiftBooks Badge Component - Ant Design wrapper
import React from 'react'
import { Badge as AntBadge, Tag } from 'antd'
import type { BadgeProps as AntBadgeProps } from 'antd'

interface BadgeProps {
  children?: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'destructive'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className 
}) => {
  // Map variant to Ant Design Tag color
  const getColor = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'blue'
      case 'secondary':
        return 'default'
      case 'success':
        return 'green'
      case 'warning':
        return 'orange'
      case 'error':
      case 'destructive':
        return 'red'
      default:
        return 'default'
    }
  }

  return (
    <Tag color={getColor(variant)} className={className}>
      {children}
    </Tag>
  )
}

export default Badge
