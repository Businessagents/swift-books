import * as React from "react"
import { 
  TabsRoot as ChakraTabs, 
  TabsList as ChakraTabsList,
  TabsTrigger as ChakraTabsTrigger,
  TabsContent as ChakraTabsContent
} from "@chakra-ui/react"

// Re-export Chakra Tabs components with compatible naming
const Tabs = ({ children, ...props }: React.ComponentProps<typeof ChakraTabs>) => (
  <ChakraTabs {...props}>{children}</ChakraTabs>
)

const TabsList = ({ children, ...props }: React.ComponentProps<typeof ChakraTabsList>) => (
  <ChakraTabsList {...props}>{children}</ChakraTabsList>
)

const TabsTrigger = ({ children, ...props }: React.ComponentProps<typeof ChakraTabsTrigger>) => (
  <ChakraTabsTrigger {...props}>{children}</ChakraTabsTrigger>
)

const TabsContent = ({ children, ...props }: React.ComponentProps<typeof ChakraTabsContent>) => (
  <ChakraTabsContent {...props}>{children}</ChakraTabsContent>
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
