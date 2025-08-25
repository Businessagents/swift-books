// SwiftBooks Card Component - Ant Design wrapper for consistency
import React from 'react'
import { Card as AntCard, Typography } from 'antd'
import type { CardProps as AntCardProps } from 'antd'

const { Title, Text } = Typography

interface CardProps extends Omit<AntCardProps, 'title'> {
  children?: React.ReactNode
}

interface CardHeaderProps {
  children?: React.ReactNode
  className?: string
}

interface CardTitleProps {
  children?: React.ReactNode
  className?: string
}

interface CardDescriptionProps {
  children?: React.ReactNode
  className?: string
}

interface CardBodyProps {
  children?: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <AntCard {...props}>
      {children}
    </AntCard>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={`card-header ${className || ''}`} style={{ marginBottom: 16 }}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <Title level={4} className={className} style={{ margin: 0, marginBottom: 4 }}>
      {children}
    </Title>
  )
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
  return (
    <Text type="secondary" className={className}>
      {children}
    </Text>
  )
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return (
    <div className={`card-body ${className || ''}`}>
      {children}
    </div>
  )
}

// Default export for the main Card component
export default Card
