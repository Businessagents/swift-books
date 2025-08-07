import {
  Box,
  Grid,
  GridItem,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Center,
  Flex,
  Heading
} from "@chakra-ui/react"
import { Card } from "@/components/ui/card"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Receipt, 
  CreditCard
} from "lucide-react"

export interface Widget {
  id: string
  title: string
  component: React.ComponentType<any>
  enabled: boolean
  size: 'small' | 'medium' | 'large'
  category: 'finance' | 'operations' | 'analytics'
}

// Streamlined Widget Components
export function RevenueWidget() {
  return (
    <Card>
      <Box p={4}>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Monthly Revenue</Text>
          <Icon as={DollarSign} boxSize={4} color="green.500" />
        </HStack>
      </Box>
      <Box px={4} pb={4}>
        <Text fontSize="2xl" fontWeight="bold" color="green.500">$287,650</Text>
        <HStack gap={2} mt={2}>
          <Icon as={TrendingUp} boxSize={3} color="green.500" />
          <Text fontSize="xs" color="gray.500">+18% from last month</Text>
        </HStack>
      </Box>
    </Card>
  )
}

export function ExpensesWidget() {
  return (
    <Card>
      <Box p={4}>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Monthly Expenses</Text>
          <Icon as={CreditCard} boxSize={4} color="red.500" />
        </HStack>
      </Box>
      <Box px={4} pb={4}>
        <Text fontSize="2xl" fontWeight="bold">$48,230</Text>
        <HStack gap={2} mt={2}>
          <Icon as={TrendingDown} boxSize={3} color="red.500" />
          <Text fontSize="xs" color="gray.500">-5% from last month</Text>
        </HStack>
      </Box>
    </Card>
  )
}


export function ReceiptsWidget() {
  return (
    <Card>
      <Box p={4}>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Recent Receipts</Text>
          <Icon as={Receipt} boxSize={4} color="primary.500" />
        </HStack>
      </Box>
      <Box px={4} pb={4}>
        <Text fontSize="2xl" fontWeight="bold">23</Text>
        <Text fontSize="xs" color="gray.500" mt={1}>
          8 pending processing
        </Text>
        <Badge colorScheme="blue" variant="solid" mt={2} size="sm">
          AI Processing
        </Badge>
      </Box>
    </Card>
  )
}


export function QuickActionsWidget() {
  return (
    <Card>
      <Box p={4}>
        <Text fontSize="sm" fontWeight="medium" color="gray.500">Quick Actions</Text>
      </Box>
      <Box px={4} pb={4}>
        <SimpleGrid columns={2} gap={3}>
          <Button 
            variant="outline" 
            h="16" 
            flexDir="column" 
            gap={1}
            onClick={() => console.log('Upload Receipt clicked')}
            _hover={{ bg: 'primary.50', borderColor: 'primary.300' }}
          >
            <Icon as={Receipt} boxSize={5} />
            <Text fontSize="xs">Upload Receipt</Text>
          </Button>
          <Button 
            variant="outline" 
            h="16" 
            flexDir="column" 
            gap={1}
            onClick={() => console.log('New Invoice clicked')}
            _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
          >
            <Icon as={FileText} boxSize={5} />
            <Text fontSize="xs">New Invoice</Text>
          </Button>
          <Button 
            variant="outline" 
            h="16" 
            flexDir="column" 
            gap={1}
            onClick={() => console.log('Add Expense clicked')}
            _hover={{ bg: 'red.50', borderColor: 'red.300' }}
          >
            <Icon as={CreditCard} boxSize={5} />
            <Text fontSize="xs">Add Expense</Text>
          </Button>
          <Button 
            variant="outline" 
            h="16" 
            flexDir="column" 
            gap={1}
            onClick={() => console.log('View Reports clicked')}
            _hover={{ bg: 'green.50', borderColor: 'green.300' }}
          >
            <Icon as={TrendingUp} boxSize={5} />
            <Text fontSize="xs">View Reports</Text>
          </Button>
        </SimpleGrid>
      </Box>
    </Card>
  )
}

// Streamlined widgets - keeping only essential ones per checklist
const availableWidgets: Widget[] = [
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    component: RevenueWidget,
    enabled: true,
    size: 'small',
    category: 'finance'
  },
  {
    id: 'expenses',
    title: 'Monthly Expenses',
    component: ExpensesWidget,
    enabled: true,
    size: 'small',
    category: 'finance'
  },
  {
    id: 'receipts',
    title: 'Recent Receipts',
    component: ReceiptsWidget,
    enabled: true,
    size: 'small',
    category: 'operations'
  },
  {
    id: 'quickactions',
    title: 'Quick Actions',
    component: QuickActionsWidget,
    enabled: true,
    size: 'large',
    category: 'operations'
  }
]

interface WidgetSystemProps {
  // No className needed for Chakra
}

export function WidgetSystem({}: WidgetSystemProps) {
  // Simplified - no customization needed for streamlined dashboard
  const enabledWidgets = availableWidgets.filter(widget => widget.enabled)

  return (
    <Box>
      {/* Simplified Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" mb={1}>Dashboard Overview</Heading>
          <Text fontSize="sm" color="gray.500">
            Essential business metrics and quick actions
          </Text>
        </Box>
      </Flex>

      {/* Streamlined Widget Grid */}
      <Grid 
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} 
        gap={6}
      >
        {enabledWidgets.map((widget) => {
          const WidgetComponent = widget.component
          return (
            <GridItem
              key={widget.id}
              colSpan={{
                base: 1,
                md: widget.size === 'large' ? 2 : 1,
                lg: widget.size === 'large' ? 3 : 1
              }}
            >
              <WidgetComponent />
            </GridItem>
          )
        })}
      </Grid>

    </Box>
  )
}