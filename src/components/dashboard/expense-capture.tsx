import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Check, Clock, X } from "lucide-react"
import { ReceiptUpload } from "@/components/receipt-upload"
import { ExpenseCategorizer } from "@/components/ai/expense-categorizer"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { usePrivacy } from "@/hooks/use-privacy"
import { Box, VStack, HStack, Text, Icon, Flex, Skeleton, Center } from "@chakra-ui/react"

const recentExpenses = [
  {
    id: 1,
    description: "Client lunch - The Keg Restaurant",
    amount: "$156.42",
    category: "Business Entertainment",
    date: "Jan 26, 2025",
    status: "processed",
    confidence: 0.97
  },
  {
    id: 2,
    description: "GO Transit - Union to Mississauga",
    amount: "$14.20",
    category: "Business Travel",
    date: "Jan 26, 2025",
    status: "processing",
    confidence: 0.94
  },
  {
    id: 3,
    description: "Microsoft Office 365 Business",
    amount: "$289.99",
    category: "Software & Subscriptions",
    date: "Jan 25, 2025", 
    status: "processed",
    confidence: 0.99
  },
  {
    id: 4,
    description: "Fuel - Petro-Canada Station",
    amount: "$87.35",
    category: "Vehicle & Fuel",
    date: "Jan 24, 2025", 
    status: "processed",
    confidence: 0.92
  }
]

export function ExpenseCapture() {
  const [recentReceipts, setRecentReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { maskValue } = usePrivacy()

  useEffect(() => {
    fetchRecentReceipts()
  }, [])

  const fetchRecentReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentReceipts(data || [])
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReceiptProcessed = (receipt: any) => {
    // Refresh the recent receipts list
    fetchRecentReceipts()
  }

  const formatAmount = (amount: number | null) => {
    if (!amount) return '$0.00'
    return `$${amount.toFixed(2)}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <Icon as={Check} boxSize={4} color="green.500" />
      case 'processing':
        return <Icon as={Clock} boxSize={4} color="orange.500" />
      case 'failed':
        return <Icon as={X} boxSize={4} color="red.500" />
      default:
        return <Icon as={Clock} boxSize={4} color="gray.400" />
    }
  }

  return (
    <VStack spacing={6}>
      {/* Receipt Upload Component */}
      <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
      
      {/* AI Expense Categorizer */}
      <ExpenseCategorizer onExpenseCreated={handleReceiptProcessed} />
      
      {/* Recent Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
          <CardDescription>
            Your latest uploaded and processed receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <VStack spacing={3}>
              {[...Array(3)].map((_, i) => (
                <HStack key={i} spacing={3} p={3} borderRadius="lg" border="1px" borderColor="gray.200" w="full">
                  <Skeleton h={10} w={10} borderRadius="lg" />
                  <VStack flex={1} spacing={2} align="start">
                    <Skeleton h={4} w="75%" borderRadius="md" />
                    <Skeleton h={3} w="50%" borderRadius="md" />
                  </VStack>
                  <VStack spacing={2} align="end">
                    <Skeleton h={4} w={16} borderRadius="md" />
                    <Skeleton h={3} w={12} borderRadius="md" />
                  </VStack>
                </HStack>
              ))}
            </VStack>
          ) : recentReceipts.length === 0 ? (
            <Center py={8} color="gray.500">
              <VStack spacing={4}>
                <Icon as={Upload} boxSize={12} opacity={0.5} />
                <Text>No receipts uploaded yet</Text>
                <Text fontSize="sm">Upload your first receipt to get started</Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={3}>
              {recentReceipts.map((receipt) => (
                <Flex
                  key={receipt.id}
                  align={{ base: "start", sm: "center" }}
                  justify="space-between"
                  p={3}
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                  bg="gray.50"
                  w="full"
                >
                  <HStack spacing={3} flex={1} minW={0}>
                    <Center
                      h={10}
                      w={10}
                      borderRadius="lg"
                      bg="gray.200"
                      flexShrink={0}
                    >
                      {getStatusIcon(receipt.status)}
                    </Center>
                    
                    <VStack spacing={1} minW={0} flex={1} align="start">
                      <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                        {maskValue(receipt.vendor_name || receipt.file_name || 'Unknown receipt')}
                      </Text>
                      <VStack
                        spacing={{ base: 1, sm: 0 }}
                        direction={{ base: "column", sm: "row" }}
                        align={{ base: "start", sm: "center" }}
                      >
                        {receipt.ai_suggested_category && (
                          <Badge variant="outline" fontSize="xs" w="fit-content">
                            {receipt.ai_suggested_category}
                          </Badge>
                        )}
                        {receipt.ai_confidence && (
                          <Text fontSize="xs" color="gray.500">
                            {Math.round(receipt.ai_confidence * 100)}% confidence
                          </Text>
                        )}
                        <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                          {receipt.status}
                        </Text>
                      </VStack>
                    </VStack>
                  </HStack>
                  
                  <VStack spacing={0} align="end" flexShrink={0} ml={2}>
                    <Text fontWeight="semibold">
                      {maskValue(formatAmount(receipt.total_amount))}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : 
                       new Date(receipt.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Flex>
              ))}
            </VStack>
          )}
          
          {recentReceipts.length > 0 && (
            <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
              <Flex justify="space-between" fontSize="sm">
                <Text color="gray.500">
                  {new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })} Summary
                </Text>
                <Text fontWeight="medium">
                  {maskValue(`${recentReceipts.length} receipts • ${formatAmount(
                    recentReceipts.reduce((sum, r) => sum + (r.total_amount || 0), 0)
                  )} CAD`)}
                </Text>
              </Flex>
            </Box>
          )}
        </CardContent>
      </Card>
    </VStack>
  )
}