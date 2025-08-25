import React from 'react'
import { Modal, Button } from 'antd'
import type { ModalProps } from 'antd'
import './dialog.css'

interface DialogProps extends Omit<ModalProps, 'open' | 'onCancel'> {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Dialog: React.FC<DialogProps> = ({ 
  children, 
  open = false, 
  onOpenChange,
  ...props 
}) => {
  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange?.(false)}
      footer={null}
      destroyOnClose
      {...props}
    >
      {children}
    </Modal>
  )
}

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="dialog-header">{children}</div>
}

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h3 className="dialog-title">{children}</h3>
}

export const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="dialog-description">{children}</p>
}

export const DialogBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="dialog-body">{children}</div>
}

export const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="dialog-footer">{children}</div>
}

export const DialogTrigger: React.FC<{ 
  children: React.ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => {
  return <span onClick={onClick}>{children}</span>
}

export const DialogCloseTrigger: React.FC<{ 
  children?: React.ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => {
  return <Button onClick={onClick}>{children || 'Close'}</Button>
}