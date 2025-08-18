import * as React from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

// Simple popover implementation using dialog
const Popover = Dialog
const PopoverTrigger = DialogTrigger
const PopoverContent = ({ children, ...props }: any) => (
  <DialogContent {...props}>
    {children}
  </DialogContent>
)

export { Popover, PopoverContent, PopoverTrigger }
