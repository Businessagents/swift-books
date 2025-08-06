import * as React from "react"
import { 
  Tabs as ChakraTabs, 
  TabsList as ChakraTabsList,
  TabsTrigger as ChakraTabsTrigger,
  TabsContent as ChakraTabsContent
} from "@chakra-ui/react"

// Re-export Chakra Tabs components with compatible naming
const Tabs = ChakraTabs

const TabsList = ChakraTabsList

const TabsTrigger = ChakraTabsTrigger

const TabsContent = ChakraTabsContent

export { Tabs, TabsList, TabsTrigger, TabsContent }
