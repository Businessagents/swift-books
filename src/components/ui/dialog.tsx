import * as React from "react"
import {
  Dialog as ChakraDialog,
  DialogContent as ChakraDialogContent,
  DialogHeader as ChakraDialogHeader,
  DialogBody as ChakraDialogBody,
  DialogFooter as ChakraDialogFooter,
  DialogCloseTrigger as ChakraDialogCloseTrigger,
  DialogTitle as ChakraDialogTitle,
  DialogDescription as ChakraDialogDescription,
  DialogTrigger as ChakraDialogTrigger,
  DialogRoot as ChakraDialogRoot,
  DialogBackdrop as ChakraDialogBackdrop,
  Button,
  VStack,
  Text,
  Box
} from "@chakra-ui/react"

// Dialog components mapped to Chakra UI Dialog
const Dialog = ChakraDialogRoot

const DialogTrigger = ChakraDialogTrigger

const DialogContent = ChakraDialogContent

const DialogHeader = ChakraDialogHeader

const DialogFooter = ChakraDialogFooter

const DialogTitle = ChakraDialogTitle

const DialogDescription = ChakraDialogDescription

const DialogClose = ChakraDialogCloseTrigger

// Keep these for compatibility
const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DialogOverlay = ChakraDialogBackdrop

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}