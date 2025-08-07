import { useState } from "react"
import { Header } from "@/components/ui/header"
import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Card, 
  CardHeader, 
  CardBody, 
  Text, 
  Heading,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger
} from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/color-mode"
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
  const { isOpen: showReceiptUpload, onOpen: openReceiptUpload, onClose: closeReceiptUpload } = useDisclosure()
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
      action: () => console.log("Open new expense form"),
      colorScheme: "red"
    },
    {
      title: "Create Invoice", 
      description: "Generate a new client invoice",
      icon: FileText,
      action: () => console.log("Open new invoice form"),
      colorScheme: "blue"
    },
    {
      title: "Upload Receipt",
      description: "Process receipt with AI",
      icon: ReceiptIcon,
      action: openReceiptUpload,
      colorScheme: "green"
    }
  ]

  return (
    <Box minH="100vh" bg={bg}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <VStack spacing={3} align="start">
                  <HStack spacing={3}>
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
                <SimpleGrid columns={{ base: 2, lg: 3 }} spacing={{ base: 4, lg: 6 }}>
                  <Card size="sm">
                    <CardBody textAlign="center">
                      <HStack justify="center" color="green.500" mb={1}>
                        <ArrowUpRight size={16} />
                        <Text fontSize="lg" fontWeight="bold">
                          ${transactionStats.totalIncome.toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">Income</Text>
                    </CardBody>
                  </Card>
                  <Card size="sm">
                    <CardBody textAlign="center">
                      <HStack justify="center" color="red.500" mb={1}>
                        <ArrowDownLeft size={16} />
                        <Text fontSize="lg" fontWeight="bold">
                          ${transactionStats.totalExpenses.toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">Expenses</Text>
                    </CardBody>
                  </Card>
                  <Card size="sm" display={{ base: "none", lg: "block" }}>
                    <CardBody textAlign="center">
                      <HStack justify="center" color="primary.500" mb={1}>
                        <TrendingUp size={16} />
                        <Text fontSize="lg" fontWeight="bold">
                          +{transactionStats.monthlyChange}%
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">Growth</Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card 
                  key={action.title} 
                  cursor="pointer"
                  transition="all 0.3s"
                  _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                  onClick={action.action}
                >
                  <CardBody>
                    <HStack spacing={4}>
                      <Box 
                        p={3} 
                        rounded="xl" 
                        bg={`${action.colorScheme}.100`}
                        color={`${action.colorScheme}.600`}
                      >
                        <Icon size={24} />
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold">
                          {action.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {action.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>

          {/* Main Content Tabs */}
          <Box>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" wrap="wrap" spacing={4}>
                <TabsRoot defaultValue="expenses">
                  <TabsList>
                    <TabsTrigger value="expenses">
                      <HStack spacing={2}>
                        <CreditCard size={16} />
                        <Text display={{ base: "none", sm: "inline" }}>Expenses</Text>
                      </HStack>
                    </TabsTrigger>
                    <TabsTrigger value="invoices">
                      <HStack spacing={2}>
                        <FileText size={16} />
                        <Text display={{ base: "none", sm: "inline" }}>Invoices</Text>
                      </HStack>
                    </TabsTrigger>
                    <TabsTrigger value="receipts">
                      <HStack spacing={2}>
                        <ReceiptIcon size={16} />
                        <Text display={{ base: "none", sm: "inline" }}>Receipts</Text>
                      </HStack>
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Expenses Tab */}
                  <TabsContent value="expenses" px={0}>
                    <Card>
                      <CardHeader>
                        <HStack spacing={2}>
                          <CreditCard size={20} />
                          <VStack align="start" spacing={0}>
                            <Heading size="md">Expense Management</Heading>
                            <Text fontSize="sm" color="gray.600">
                              Track and categorize your business expenses with AI-powered insights
                            </Text>
                          </VStack>
                        </HStack>
                      </CardHeader>
                      <CardBody p={0}>
                        <SimpleExpenseManagement />
                      </CardBody>
                    </Card>
                  </TabsContent>

                  {/* Invoices Tab */}
                  <TabsContent value="invoices" px={0}>
                    <Card>
                      <CardHeader>
                        <HStack justify="space-between" align="start">
                          <HStack spacing={2}>
                            <FileText size={20} />
                            <VStack align="start" spacing={0}>
                              <Heading size="md">Invoice Management</Heading>
                              <Text fontSize="sm" color="gray.600">
                                Create, send, and track client invoices with automated reminders
                              </Text>
                            </VStack>
                          </HStack>
                          <Button 
                            colorScheme="blue" 
                            size="sm"
                            leftIcon={<Plus size={16} />}
                          >
                            New Invoice
                          </Button>
                        </HStack>
                      </CardHeader>
                      <CardBody p={0}>
                        <InvoiceList />
                      </CardBody>
                    </Card>
                  </TabsContent>

                  {/* Receipts Tab */}
                  <TabsContent value="receipts" px={0}>
                    <Card>
                      <CardHeader>
                        <HStack justify="space-between" align="start">
                          <HStack spacing={2}>
                            <ReceiptIcon size={20} />
                            <VStack align="start" spacing={0}>
                              <Heading size="md">Receipt Processing</Heading>
                              <Text fontSize="sm" color="gray.600">
                                AI-powered receipt scanning and automatic expense categorization
                              </Text>
                            </VStack>
                          </HStack>
                          <Button 
                            colorScheme="green" 
                            size="sm" 
                            onClick={openReceiptUpload}
                            leftIcon={<Plus size={16} />}
                          >
                            Upload Receipt
                          </Button>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} py={8}>
                          <ReceiptIcon size={48} opacity={0.5} />
                          <VStack spacing={2}>
                            <Heading size="md">Receipt Processing Hub</Heading>
                            <Text color="gray.600" textAlign="center">
                              Upload receipts to automatically extract data and create expense entries
                            </Text>
                          </VStack>
                          <Button 
                            colorScheme="green" 
                            onClick={openReceiptUpload}
                            leftIcon={<Plus size={16} />}
                          >
                            Upload First Receipt
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabsContent>
                </TabsRoot>

                {/* Status Overview */}
                <HStack spacing={2}>
                  <Badge colorScheme="yellow" variant="outline">
                    <Clock size={12} />
                    <Text ml={1} fontSize="xs">{transactionStats.pendingInvoices} Pending</Text>
                  </Badge>
                  <Badge colorScheme="green">
                    <Text fontSize="xs">{transactionStats.processedReceipts} Processed</Text>
                  </Badge>
                </HStack>
              </HStack>
            </VStack>
          </Box>

        </VStack>
      </Container>

      {/* Receipt Upload Modal */}
      <Modal isOpen={showReceiptUpload} onClose={closeReceiptUpload} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={1}>
              <Text>Upload Receipt</Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.600">
                Upload a receipt image for automatic processing and categorization.
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ReceiptUploadEnhanced 
              onReceiptProcessed={closeReceiptUpload}
              onExpenseCreated={closeReceiptUpload}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Transactions