/**
 * Card Component - Chakra UI v3 wrapper
 * 
 * Provides a consistent card layout using Chakra UI components.
 * Supports elevated and outline variants for different visual treatments.
 * 
 * @example
 * <Card variant="elevated">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 */
import * as React from "react"
import { 
  Card as ChakraCardRoot,
  CardHeader as ChakraCardHeader,
  CardBody as ChakraCardBody,
  CardFooter as ChakraCardFooter,
  Heading,
  Text
} from "@chakra-ui/react"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'elevated' | 'outline' }
>(({ variant = 'elevated', children, ...props }, ref) => (
  <ChakraCardRoot
    ref={ref}
    variant={variant}
    {...props}
  >
    {children}
  </ChakraCardRoot>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <ChakraCardHeader
    ref={ref}
    pb={3}
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
  <ChakraCardBody 
    ref={ref} 
    pt={0}
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <ChakraCardFooter
    ref={ref}
    pt={3}
    display="flex"
    alignItems="center"
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardBody = CardContent

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardBody }
