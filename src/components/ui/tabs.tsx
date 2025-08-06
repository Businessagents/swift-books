import * as React from "react"
import { 
  Tabs as ChakraTabs, 
  TabList as ChakraTabList,
  Tab as ChakraTab,
  TabPanels as ChakraTabPanels,
  TabPanel as ChakraTabPanel,
  TabsProps as ChakraTabsProps
} from "@chakra-ui/react"

// Re-export Chakra Tabs components with compatible naming
const Tabs = ({ children, ...props }: ChakraTabsProps) => (
  <ChakraTabs {...props}>{children}</ChakraTabs>
)

const TabsList = ({ children, ...props }: { children: React.ReactNode }) => (
  <ChakraTabList {...props}>{children}</ChakraTabList>
)

const TabsTrigger = ({ children, ...props }: { children: React.ReactNode }) => (
  <ChakraTab {...props}>{children}</ChakraTab>
)

const TabsContent = ({ children, ...props }: { children: React.ReactNode }) => (
  <ChakraTabPanel {...props}>{children}</ChakraTabPanel>
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
