/**
 * Card Component - Chakra UI v3 native implementation
 * 
 * Uses Chakra UI v3's Card.Root structure with proper namespace imports.
 * 
 * @example
 * <Card.Root>
 *   <Card.Header>
 *     <Card.Root.Title>Title</Card.Title>
 *     <Card.Root.Description>Description</Card.Description>
 *   </Card.Header>
 *   <Card.Body>Content here</Card.Body>
 * </Card.Root>
 */
import * as React from "react"
import { Card as ChakraCard } from "@chakra-ui/react"

// Re-export Chakra UI v3 Card components with proper namespacing
export const Card = {
  Root: ChakraCard.Root,
  Header: ChakraCard.Header,
  Body: ChakraCard.Body,
  Footer: ChakraCard.Footer,
  Title: ChakraCard.Title,
  Description: ChakraCard.Description,
}

// Legacy exports for backward compatibility during migration
export const CardRoot = Card.Root
export const CardHeader = Card.Header
export const CardBody = Card.Body
export const CardContent = Card.Body // Alias for backward compatibility
export const CardFooter = Card.Footer
export const CardTitle = Card.Title
export const CardDescription = Card.Description

// Default export for components expecting single Card import
export default Card
