import * as React from "react"
import { 
  AccordionRoot, 
  AccordionItem as ChakraAccordionItem, 
  AccordionItemTrigger,
  AccordionItemContent,
  AccordionItemIndicator
} from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"

const Accordion = ({ children, ...props }: any) => (
  <AccordionRoot {...props}>{children}</AccordionRoot>
)

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ children, ...props }, ref) => (
  <ChakraAccordionItem
    ref={ref}
    borderBottomWidth="1px"
    borderColor="gray.200"
    _dark={{ borderColor: "gray.600" }}
    {...props}
  >
    {children}
  </ChakraAccordionItem>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <AccordionItemTrigger
    ref={ref}
    display="flex"
    flex="1"
    alignItems="center"
    justifyContent="space-between"
    py={4}
    fontWeight="medium"
    _hover={{ textDecoration: "underline" }}
    {...props}
  >
    {children}
    <AccordionItemIndicator>
      <ChevronDown size={16} />
    </AccordionItemIndicator>
  </AccordionItemTrigger>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <AccordionItemContent
    ref={ref}
    fontSize="sm"
    pb={4}
    pt={0}
    {...props}
  >
    {children}
  </AccordionItemContent>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
