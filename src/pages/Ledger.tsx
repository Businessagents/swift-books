import { Header } from "@/components/ui/header"
import { LedgerTable } from "@/components/ledger/ledger-table"
import { AccountSummary } from "@/components/ledger/account-summary"
import { LedgerFilters } from "@/components/ledger/ledger-filters"
import { ReconciliationDialog } from "@/components/ledger/reconciliation-dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, VStack, HStack, Text, Heading, Container, Flex, Icon } from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/color-mode"

export interface LedgerFilters {
  accountId: string
  dateRange: { from: Date | undefined; to: Date | undefined }
  transactionType: 'all' | 'income' | 'expense' | 'transfer'
  reconciliationStatus: 'all' | 'reconciled' | 'unreconciled'
  searchQuery: string
}

const Ledger = () => {
  const { colorMode } = useColorMode()
  const bg = colorMode === 'light' ? 'gray.50' : 'gray.800'
  
  const [filters, setFilters] = useState<LedgerFilters>({
    accountId: "all",
    dateRange: { from: undefined, to: undefined },
    transactionType: "all",
    reconciliationStatus: "all",
    searchQuery: ""
  })

  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const handleOpenReconciliation = (accountId?: string) => {
    setSelectedAccountId(accountId || null)
    setIsReconciliationOpen(true)
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Header />
      
      <Container as="main" maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Enhanced Header */}
          <Box
            position="relative"
            overflow="hidden"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            shadow="lg"
          >
            <Box position="absolute" inset={0} bg="white" opacity={0.1} />
            <Box position="relative">
              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ md: "center" }}
                justify={{ md: "space-between" }}
                gap={4}
              >
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Box p={2} bg="whiteAlpha.200" borderRadius="xl">
                      <Icon as={RotateCcw} boxSize={6} color="white" />
                    </Box>
                    <Heading
                      size={{ base: "2xl", md: "3xl" }}
                      fontWeight="bold"
                      color="white"
                    >
                      Bank Ledger
                    </Heading>
                  </HStack>
                  <Text color="whiteAlpha.900" maxW="2xl">
                    Complete transaction ledger with running balances, real-time reconciliation, and double-entry bookkeeping
                  </Text>
                </VStack>
                
                <HStack spacing={2}>
                  <Button
                    variant="solid"
                    bg="whiteAlpha.200"
                    color="white"
                    borderColor="whiteAlpha.200"
                    _hover={{ bg: "whiteAlpha.300" }}
                    onClick={() => handleOpenReconciliation()}
                  >
                    <Icon as={RefreshCw} boxSize={4} mr={2} />
                    Reconcile All
                  </Button>
                  <Button
                    variant="solid"
                    bg="whiteAlpha.200"
                    color="white"
                    borderColor="whiteAlpha.200"
                    _hover={{ bg: "whiteAlpha.300" }}
                  >
                    <Icon as={Plus} boxSize={4} mr={2} />
                    Add Transaction
                  </Button>
                </HStack>
              </Flex>
            </Box>
          </Box>

          {/* Account Summary Cards */}
          <Box>
            <AccountSummary />
          </Box>

          {/* Filters */}
          <Box>
            <LedgerFilters 
              filters={filters} 
              onFiltersChange={setFilters}
            />
          </Box>

          {/* Main Ledger Table */}
          <Box>
            <Card bg="white" shadow="lg" borderRadius="xl">
              <CardHeader>
                <Flex align="center" justify="space-between">
                  <CardTitle fontSize="xl">Transaction Ledger</CardTitle>
                  <HStack spacing={2} fontSize="sm" color="gray.500">
                    <Box h={2} w={2} bg="green.500" borderRadius="full" />
                    <Text>Real-time updates enabled</Text>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody p={0}>
                <LedgerTable 
                  filters={filters}
                  onReconcileTransaction={handleOpenReconciliation}
                />
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </Container>

      {/* Reconciliation Dialog */}
      <ReconciliationDialog
        isOpen={isReconciliationOpen}
        onClose={() => setIsReconciliationOpen(false)}
        accountId={selectedAccountId}
      />
    </Box>
  )
}

export default Ledger