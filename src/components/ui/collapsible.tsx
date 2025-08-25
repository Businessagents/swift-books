// SwiftBooks Collapsible Component - Ant Design wrapper
import React, { useState } from 'react'
import { Collapse } from 'antd'
import type { CollapseProps } from 'antd'

const { Panel } = Collapse

interface CollapsibleProps {
  children?: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

interface CollapsibleTriggerProps {
  children?: React.ReactNode
  className?: string
}

interface CollapsibleContentProps {
  children?: React.ReactNode
  className?: string
}

export const Collapsible: React.FC<CollapsibleProps> = ({ 
  children, 
  defaultOpen = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Extract trigger and content from children
  const childrenArray = React.Children.toArray(children)
  const trigger = childrenArray.find(child => 
    React.isValidElement(child) && child.type === CollapsibleTrigger
  )
  const content = childrenArray.find(child => 
    React.isValidElement(child) && child.type === CollapsibleContent
  )

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: trigger,
      children: content,
    }
  ]

  return (
    <Collapse 
      items={items}
      defaultActiveKey={defaultOpen ? ['1'] : []}
      className={className}
      ghost
    />
  )
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default Collapsible
