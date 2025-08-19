import React from 'react'
import { Dialog as ChakraDialog } from "@chakra-ui/react"

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Dialog: React.FC<DialogProps> = ({ children, open = false, onOpenChange }) => {
  return (
    <ChakraDialog.Root 
      open={open} 
      onOpenChange={onOpenChange}
    >
      {children}
    </ChakraDialog.Root>
  )
}

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <ChakraDialog.Backdrop />
      <ChakraDialog.Positioner>
        <ChakraDialog.Content>
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </>
  )
}

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ChakraDialog.Header>{children}</ChakraDialog.Header>
}

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ChakraDialog.Title>{children}</ChakraDialog.Title>
}

export const DialogBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ChakraDialog.Body>{children}</ChakraDialog.Body>
}

export const DialogCloseTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <ChakraDialog.CloseTrigger>{children}</ChakraDialog.CloseTrigger>
}