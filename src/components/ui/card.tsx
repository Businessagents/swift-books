import * as React from "react"
import { 
  Card as ChakraCard, 
  CardHeader as ChakraCardHeader,
  CardBody as ChakraCardBody,
  CardFooter as ChakraCardFooter,
  Heading,
  Text,
  Box
} from "@chakra-ui/react"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'elevated' | 'outline' }
>(({ variant = 'elevated', ...props }, ref) => (
  <ChakraCard
    ref={ref}
    variant={variant}
    transition="all 0.2s ease-in-out"
    _hover={{
      transform: 'translateY(-2px)',
      boxShadow: 'xl'
    }}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <ChakraCardHeader
    ref={ref}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ ...props }, ref) => (
  <Heading
    as="h3"
    ref={ref}
    size="lg"
    fontWeight="semibold"
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ ...props }, ref) => (
  <Text
    ref={ref}
    fontSize="sm"
    color="gray.600"
    _dark={{ color: "gray.400" }}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <ChakraCardBody ref={ref} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <ChakraCardFooter
    ref={ref}
    display="flex"
    alignItems="center"
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
