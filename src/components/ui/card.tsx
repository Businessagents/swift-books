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
  Box,
  Heading,
  Text
} from "@chakra-ui/react"

// Implementing Card components using Chakra UI Box as the base
// This ensures Chakra UI v3 API compliance while maintaining compatibility
const Card = ({ children, ...props }: any) => (
  <Box
    bg="white"
    border="1px"
    borderColor="gray.200"
    borderRadius="lg"
    boxShadow="sm"
    _dark={{ bg: "gray.800", borderColor: "gray.600" }}
    {...props}
  >
    {children}
  </Box>
)

const CardHeader = ({ children, ...props }: any) => (
  <Box p={6} pb={3} {...props}>
    {children}
  </Box>
)

const CardBody = ({ children, ...props }: any) => (
  <Box p={6} pt={0} {...props}>
    {children}
  </Box>
)

// Alias for backward compatibility
const CardContent = CardBody

const CardFooter = ({ children, ...props }: any) => (
  <Box p={6} pt={3} display="flex" alignItems="center" {...props}>
    {children}
  </Box>
)

const CardTitle = ({ children, ...props }: any) => (
  <Heading as="h3" size="md" {...props}>
    {children}
  </Heading>
)

const CardDescription = ({ children, ...props }: any) => (
  <Text color="gray.600" fontSize="sm" {...props}>
    {children}
  </Text>
)

// Export Chakra UI v3 API-compliant Card components
export { Card, CardHeader, CardBody, CardContent, CardFooter, CardTitle, CardDescription }
