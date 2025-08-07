import * as React from "react"
import { 
  TabsRoot, 
  TabsList as ChakraTabsList,
  TabsTrigger as ChakraTabsTrigger,
  TabsContent as ChakraTabsContent,
  TabsContentGroup
} from "@chakra-ui/react"

// Re-export Chakra Tabs components with compatible naming
const Tabs = ({ children, ...props }: any) => (
  <TabsRoot {...props}>{children}</TabsRoot>
)

const TabsList = ({ children, ...props }: { children: React.ReactNode }) => (
  <ChakraTabsList {...props}>{children}</ChakraTabsList>
)

const TabsTrigger = ({ children, ...props }: { children: React.ReactNode }) => (
  <ChakraTabsTrigger {...props}>{children}</ChakraTabsTrigger>
)

const TabsContent = ({ children, ...props }: { children: React.ReactNode; value: string }) => (
  <ChakraTabsContent value={props.value} {...props}>{children}</ChakraTabsContent>
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
