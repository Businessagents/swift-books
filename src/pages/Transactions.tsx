import { useState } from "react"
import { Header } from "@/components/ui/header"
import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Text, 
  Heading,
  Button,
  Badge,
  SimpleGrid,
  useDisclosure,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
  DialogTitle
} from "@chakra-ui/react"
import { Card, CardHeader, CardBody } from "@/components/ui/card"
import { useColorMode } from "@/hooks/use-color-mode"
import { SimpleExpenseManagement } from "@/components/expenses/simple-expense-management"
import { InvoiceList } from "@/components/invoices/invoice-list"
import { ReceiptUploadEnhanced } from "@/components/receipt-upload-enhanced"
import { 
  CreditCard, 
  FileText, 
  Receipt as ReceiptIcon, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock
} from "lucide-react"

const Transactions = () => {
  const { open: showReceiptUpload, onOpen: openReceiptUpload, onClose: closeReceiptUpload } = useDisclosure()
  const { colorMode } = useColorMode()
  const bg = colorMode === 'light' ? 'gray.50' : 'gray.800'

  // Transaction stats - TODO: Implement real data from hooks/API
  const transactionStats = {
    totalIncome: 0,
    totalExpenses: 0,
    pendingInvoices: 0,
    processedReceipts: 0,
    monthlyChange: 0
  }

  const quickActions = [
    {
      title: "New Expense",
      description: "Add a manual expense entry",
      icon: CreditCard,
      action: () => {
        // TODO: Navigate to expense form or open expense modal
        alert('Expense form functionality coming soon!')
      },
      colorScheme: "red",
      disabled: false
    },
    {
      title: "Create Invoice", 
      description: "Generate a new client invoice",
      icon: FileText,
      action: () => {
        // TODO: Navigate to invoice form or open invoice modal
        alert('Invoice creation functionality coming soon!')
      },
      colorScheme: "blue",
      disabled: false
    },
    {
      title: "Upload Receipt",
      description: "Process receipt with AI",
      icon: ReceiptIcon,
      action: openReceiptUpload,
      colorScheme: "green",
      disabled: false
    }
  ]

  return (
    <Box minH="100vh" bg={bg}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
        <VStack gap={8} align="stretch">
          {/* Header Section */}
          <Card.Root>
            <Card.Body>
              <VStack gap={6} align="stretch">
                <VStack gap={3} align="start">
                  <HStack gap={3}>
                    <Box p={2} bg="primary.500" rounded="lg">
                      <CreditCard size={24} color="white" />
                    </Box>
                    <Heading size={{ base: "xl", md: "2xl" }}>
                      Transactions
                    </Heading>
                  </HStack>
                  <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
                    Unified view of all your business transactions - expenses, invoices, and receipts in one place
                  </Text>
                </VStack>
                
                {/* Quick Stats Overview */}
                <SimpleGrid columns={{ base: 2, lg: 3 }} gap={{ base: 4, lg: 6 }}>
                  <Card.Root size="sm">
                    <Card.Body textAlign="center">
                      <HStack justify="center" color="green.500" mb={1}>
                        <ArrowUpRight size={16} />
                        <Text fontSize="lg" fontWeight="bold">
                          ${transactionStats.totalIncome.toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">Income</Text>
                    </Card.Body>
                  </Card.Root>
                  <Card.Root size="sm">
                    <Card.Body textAlign="center">
                      <HStack justify="center" color="red.500" mb={1}>
                        <ArrowDownLeft size={16} />
                        <Text fontSize="lg" fontWeight="bold">
                          ${transactionStats.totalExpenses.toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">Expenses</Text>
                    </Card.Body>
                  </Card.Root>
                  <Card.Root size="sm" display={{ base: "none", lg: "block" }}>
                    <Card.Body textAlign="center">
                      <HStack justify="center" color="primary.500" mb={1}>
                        <TrendingUp size={16} />
                        <Text fontSize="lg" fontWeight="bold">
                          +{transactionStats.monthlyChange}%
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">Growth</Text>
                    </Card.Body>
                  </Card.Root>
                </SimpleGrid>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Quick Actions */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card.Root 
                  key={action.title} 
                  cursor={action.disabled ? "not-allowed" : "pointer"}
                  opacity={action.disabled ? 0.6 : 1}
                  transition="all 0.3s"
                  _hover={!action.disabled ? { shadow: "md", transform: "translateY(-2px)" } : {}}
                  onClick={!action.disabled ? action.action : undefined}
                >
                  <Card.Body>
                    <HStack gap={4}>
                      <Box 
                        p={3} 
                        rounded="xl" 
                        bg={`${action.colorScheme}.100`}
                        color={`${action.colorScheme}.600`}
                      >
                        <Icon size={24} />
                      </Box>
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="semibold">
                          {action.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {action.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              )
            })}
          </SimpleGrid>

          {/* Main Content - Simplified */}
          <VStack gap={6} align="stretch">
            {/* Expenses Section */}
            <Card.Root>
              <Card.Header>
                <HStack gap={2}>
                  <CreditCard size={20} />
                  <VStack align="start" gap={0}>
                    <Heading size="md">Expense Management</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Track and categorize your business expenses with AI-powered insights
                    </Text>
                  </VStack>
                </HStack>
              </Card.Header>
              <Card.Body p={0}>
                <SimpleExpenseManagement />
              </Card.Body>
            </Card.Root>
            
            {/* Status Overview */}
            <HStack gap={2} justify="center">
              <Badge colorScheme="yellow" variant="outline">
                <HStack gap={1} align="center">
                  <Clock size={12} />
                  <Text fontSize="xs">{transactionStats.pendingInvoices} Pending</Text>
                </HStack>
              </Badge>
              <Badge colorScheme="green">
                <Text fontSize="xs">{transactionStats.processedReceipts} Processed</Text>
              </Badge>
            </HStack>
          </VStack>

        </VStack>
      </Container>

      {/* Receipt Upload Dialog */}
      <DialogRoot open={showReceiptUpload} onOpenChange={({ open }) => !open && closeReceiptUpload()} size="xl">
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <VStack align="start" gap={1}>
              <DialogTitle>Upload Receipt</DialogTitle>
              <Text fontSize="sm" fontWeight="normal" color="gray.600">
                Upload a receipt image for automatic processing and categorization.
              </Text>
            </VStack>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
            <ReceiptUploadEnhanced 
              onReceiptProcessed={closeReceiptUpload}
              onExpenseCreated={closeReceiptUpload}
            />
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Box>
  )
}

export default Transactions