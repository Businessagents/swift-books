import { useState } from "react"
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Checkbox,
  VStack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Center,
  Flex,
  useDisclosure,
  Heading
} from "@chakra-ui/react"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  FileText, 
  AlertCircle, 
  Receipt, 
  CreditCard,
  Settings,
  Eye,
  EyeOff,
  Grip
} from "lucide-react"

export interface Widget {
  id: string
  title: string
  component: React.ComponentType<any>
  enabled: boolean
  size: 'small' | 'medium' | 'large'
  category: 'finance' | 'operations' | 'analytics'
}

// Individual Widget Components
export function RevenueWidget() {
  const cardBg = useColorModeValue('white', 'gray.700')
  
  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
      <CardHeader>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Monthly Revenue</Text>
          <Icon as={DollarSign} boxSize={4} color="green.500" />
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="2xl" fontWeight="bold" color="green.500">$287,650</Text>
        <HStack spacing={2} mt={2}>
          <Icon as={TrendingUp} boxSize={3} color="green.500" />
          <Text fontSize="xs" color="gray.500">+18% from last month</Text>
        </HStack>
      </CardBody>
    </Card>
  )
}

export function ExpensesWidget() {
  const cardBg = useColorModeValue('white', 'gray.700')
  
  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
      <CardHeader>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Monthly Expenses</Text>
          <Icon as={CreditCard} boxSize={4} color="red.500" />
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="2xl" fontWeight="bold">$48,230</Text>
        <HStack spacing={2} mt={2}>
          <Icon as={TrendingDown} boxSize={3} color="red.500" />
          <Text fontSize="xs" color="gray.500">-5% from last month</Text>
        </HStack>
      </CardBody>
    </Card>
  )
}

export function InvoicesWidget() {
  const cardBg = useColorModeValue('white', 'gray.700')
  
  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
      <CardHeader>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Pending Invoices</Text>
          <Icon as={FileText} boxSize={4} color="orange.500" />
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="2xl" fontWeight="bold">12</Text>
        <Text fontSize="xs" color="gray.500" mt={1}>
          $43,280 outstanding
        </Text>
        <Badge colorScheme="orange" variant="outline" mt={2} size="sm">
          3 overdue
        </Badge>
      </CardBody>
    </Card>
  )
}

export function ReceiptsWidget() {
  const cardBg = useColorModeValue('white', 'gray.700')
  
  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
      <CardHeader>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="gray.500">Recent Receipts</Text>
          <Icon as={Receipt} boxSize={4} color="primary.500" />
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="2xl" fontWeight="bold">23</Text>
        <Text fontSize="xs" color="gray.500" mt={1}>
          8 pending processing
        </Text>
        <Badge colorScheme="blue" variant="solid" mt={2} size="sm">
          AI Processing
        </Badge>
      </CardBody>
    </Card>
  )
}

export function CashFlowWidget() {
  const cardBg = useColorModeValue('white', 'gray.700')
  const chartBg = useColorModeValue('gray.50', 'gray.600')
  
  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
      <CardHeader>
        <Text fontSize="sm" fontWeight="medium" color="gray.500">Cash Flow Trend</Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <SimpleGrid columns={3} spacing={4}>
            <Center flexDir="column">
              <Text fontSize="lg" fontWeight="bold" color="green.500">+$45K</Text>
              <Text fontSize="xs" color="gray.500">This Month</Text>
            </Center>
            <Center flexDir="column">
              <Text fontSize="lg" fontWeight="bold">$238K</Text>
              <Text fontSize="xs" color="gray.500">Net Profit</Text>
            </Center>
            <Center flexDir="column">
              <Text fontSize="lg" fontWeight="bold" color="primary.500">24.5%</Text>
              <Text fontSize="xs" color="gray.500">Margin</Text>
            </Center>
          </SimpleGrid>
          <Box 
            h="20" 
            bg={`linear-gradient(to right, var(--chakra-colors-green-100), var(--chakra-colors-primary-100), var(--chakra-colors-green-100))`}
            borderRadius="lg" 
            display="flex" 
            alignItems="flex-end" 
            justifyContent="space-between" 
            px={2} 
            pb={2}
          >
            {[65, 80, 72, 90, 85, 95, 88].map((height, i) => (
              <Box
                key={i}
                w="4"
                bg="primary.500"
                borderTopRadius="sm"
                style={{ height: `${(height / 100) * 60}px` }}
              />
            ))}
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}

export function QuickActionsWidget() {
  const cardBg = useColorModeValue('white', 'gray.700')
  
  return (
    <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
      <CardHeader>
        <Text fontSize="sm" fontWeight="medium" color="gray.500">Quick Actions</Text>
      </CardHeader>
      <CardBody pt={0}>
        <SimpleGrid columns={2} spacing={3}>
          <Button variant="outline" h="16" flexDir="column" gap={1}>
            <Icon as={Receipt} boxSize={5} />
            <Text fontSize="xs">Upload Receipt</Text>
          </Button>
          <Button variant="outline" h="16" flexDir="column" gap={1}>
            <Icon as={FileText} boxSize={5} />
            <Text fontSize="xs">New Invoice</Text>
          </Button>
          <Button variant="outline" h="16" flexDir="column" gap={1}>
            <Icon as={CreditCard} boxSize={5} />
            <Text fontSize="xs">Add Expense</Text>
          </Button>
          <Button variant="outline" h="16" flexDir="column" gap={1}>
            <Icon as={TrendingUp} boxSize={5} />
            <Text fontSize="xs">View Reports</Text>
          </Button>
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}

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
    id: 'invoices',
    title: 'Pending Invoices',
    component: InvoicesWidget,
    enabled: true,
    size: 'small',
    category: 'operations'
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
    id: 'cashflow',
    title: 'Cash Flow Trend',
    component: CashFlowWidget,
    enabled: true,
    size: 'large',
    category: 'analytics'
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
  const [widgets, setWidgets] = useState<Widget[]>(availableWidgets)
  const { isOpen: showCustomization, onOpen, onClose } = useDisclosure()

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, enabled: !widget.enabled }
        : widget
    ))
  }

  const enabledWidgets = widgets.filter(widget => widget.enabled)

  return (
    <Box>
      {/* Customization Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" mb={1}>Dashboard Overview</Heading>
          <Text fontSize="sm" color="gray.500">
            Customize your dashboard widgets to focus on what matters most
          </Text>
        </Box>
        <Button 
          variant="outline" 
          leftIcon={<Icon as={Settings} boxSize={4} />}
          onClick={onOpen}
        >
          Customize
        </Button>
      </Flex>

      {/* Widget Grid */}
      <Grid 
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} 
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
                lg: widget.size === 'large' ? 2 : 1
              }}
            >
              <WidgetComponent />
            </GridItem>
          )
        })}
      </Grid>

      {/* Widget Customization Modal */}
      <Modal isOpen={showCustomization} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customize Dashboard</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontSize="sm" color="gray.500" mb={6}>
              Choose which widgets to display on your dashboard. Changes are saved automatically.
            </Text>
            
            <VStack spacing={6} align="stretch">
              {['finance', 'operations', 'analytics'].map((category) => (
                <Box key={category}>
                  <Text 
                    fontSize="sm" 
                    fontWeight="semibold" 
                    textTransform="uppercase" 
                    color="gray.500"
                    mb={3}
                  >
                    {category}
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {widgets.filter(w => w.category === category).map((widget) => (
                      <Flex 
                        key={widget.id} 
                        justify="space-between" 
                        align="center"
                        p={3} 
                        borderWidth={1} 
                        borderRadius="md"
                      >
                        <HStack spacing={3}>
                          <Checkbox
                            isChecked={widget.enabled}
                            onChange={() => toggleWidget(widget.id)}
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {widget.title}
                            </Text>
                            <Badge colorScheme="gray" size="sm">
                              {widget.size}
                            </Badge>
                          </VStack>
                        </HStack>
                        
                        <HStack spacing={2}>
                          <Icon 
                            as={widget.enabled ? Eye : EyeOff} 
                            boxSize={4} 
                            color={widget.enabled ? 'green.500' : 'gray.400'}
                          />
                          <Icon as={Grip} boxSize={4} color="gray.400" cursor="move" />
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                setWidgets(availableWidgets.map(w => ({ ...w, enabled: true })))
              }}
            >
              Reset to Default
            </Button>
            <Button colorScheme="primary" onClick={onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}