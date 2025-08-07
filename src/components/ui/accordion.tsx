import * as React from "react"
import { AccordionRoot, AccordionItem as ChakraAccordionItem, AccordionItemTrigger, AccordionItemContent, AccordionItemIndicator } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionRoot

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof ChakraAccordionItem>,
  React.ComponentPropsWithoutRef<typeof ChakraAccordionItem>
>(({ className, ...props }, ref) => (
  <ChakraAccordionItem
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionItemTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionItemTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionItemTrigger
    ref={ref}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
      className
    )}
    {...props}
  >
    {children}
    <AccordionItemIndicator>
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionItemIndicator>
  </AccordionItemTrigger>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionItemContent>,
  React.ComponentPropsWithoutRef<typeof AccordionItemContent>
>(({ className, children, ...props }, ref) => (
  <AccordionItemContent
    ref={ref}
    className="overflow-hidden text-sm transition-all"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionItemContent>
))

AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
