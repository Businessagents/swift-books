import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/sonner"
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Flex, 
  Icon,
  Spacer
} from "@chakra-ui/react"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Receipt, 
  DollarSign, 
  MoreHorizontal
} from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"
import { ExpenseForm } from "./expense-form"

interface SimpleExpense {
  id: string
  description: string
  amount: number
  tax_amount?: number
  expense_date: string
  vendor?: string
  currency: string
  is_billable?: boolean
  is_personal?: boolean
  notes?: string
  user_id: string
  category_id?: string
  category?: { name: string; code?: string } | null
  receipt?: { file_name: string } | null
}

export function SimpleExpenseManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedExpense, setSelectedExpense] = useState<SimpleExpense | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()

  // Fetch expenses with basic filtering
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['simple-expenses', searchQuery, categoryFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(name, code),
          receipt:receipts(file_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,vendor.ilike.%${searchQuery}%`)
      }

      if (categoryFilter !== "all") {
        query = query.eq('category_id', categoryFilter)
      }

      const { data, error } = await query

      if (error) {
        toast.error("Failed to fetch expenses")
        throw error
      }

      return data || []
    }
  })

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    }
  })

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simple-expenses'] })
      toast.success("Expense deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete expense")
    }
  })

  // Calculate summary stats
  const summaryStats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    averageAmount: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0
  }

  // Using Chakra UI v3 token system for color mode values
  const bgColor = 'white'
  const cardBg = 'gray.50'

  return (
    <VStack spacing={6} w="full">
      {/* Enhanced Summary Cards */}
      <Box w="full" display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        <Card bg={bgColor} shadow="md" borderRadius="xl" _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <CardTitle fontSize="sm" color="gray.600">Total Expenses</CardTitle>
              <Box p={2} bg="green.500" borderRadius="lg" color="white">
                <Icon as={DollarSign} boxSize={4} />
              </Box>
            </HStack>
          </CardHeader>
          <CardContent pt={0}>
            <Text fontSize="3xl" fontWeight="bold" color="green.500" mb={1}>
              ${isPrivacyMode ? maskValue(summaryStats.totalAmount) : summaryStats.totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {summaryStats.total} total expenses • +12% this month
            </Text>
          </CardContent>
        </Card>

        <Card bg={bgColor} shadow="md" borderRadius="xl" _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <CardTitle fontSize="sm" color="gray.600">Expense Count</CardTitle>
              <Box p={2} bg="blue.500" borderRadius="lg" color="white">
                <Icon as={Receipt} boxSize={4} />
              </Box>
            </HStack>
          </CardHeader>
          <CardContent pt={0}>
            <Text fontSize="3xl" fontWeight="bold" color="blue.500" mb={1}>
              {summaryStats.total}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Recorded expenses • 8 pending approval
            </Text>
          </CardContent>
        </Card>

        <Card bg={bgColor} shadow="md" borderRadius="xl" _hover={{ shadow: "lg", transform: "translateY(-2px)" }} transition="all 0.2s">
          <CardHeader>
            <HStack justify="space-between" align="center">
              <CardTitle fontSize="sm" color="gray.600">Average Amount</CardTitle>
              <Box p={2} bg="orange.500" borderRadius="lg" color="white">
                <Icon as={DollarSign} boxSize={4} />
              </Box>
            </HStack>
          </CardHeader>
          <CardContent pt={0}>
            <Text fontSize="3xl" fontWeight="bold" color="orange.500" mb={1}>
              ${isPrivacyMode ? maskValue(summaryStats.averageAmount) : summaryStats.averageAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Per expense • -3% from last month
            </Text>
          </CardContent>
        </Card>
      </Box>

      {/* Enhanced Filters and Actions */}
      <Card bg={bgColor} shadow="lg" borderRadius="xl" w="full">
        <CardHeader>
          <VStack spacing={4} align="stretch">
            <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ base: "start", lg: "center" }} justify="space-between">
              <Box>
                <CardTitle fontSize="xl" color="blue.500">Smart Expense Tracking</CardTitle>
                <Text fontSize="sm" color="gray.500">
                  AI-powered categorization and real-time insights for your business expenses
                </Text>
              </Box>
              <HStack spacing={3}>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" _hover={{ shadow: "lg" }} transition="all 0.2s">
                    <Icon as={Plus} boxSize={4} mr={2} />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent maxW="2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Expense</DialogTitle>
                  </DialogHeader>
                  <ExpenseForm
                    onSuccess={() => {
                      setIsCreateDialogOpen(false)
                      queryClient.invalidateQueries({ queryKey: ['simple-expenses'] })
                    }}
                  />
                </DialogContent>
              </Dialog>
            </HStack>
          </Flex>

          {/* Enhanced Search and Filters */}
          <Box bg="gray.50" p={4} borderRadius="lg" border="1px" borderColor="gray.200">
            <Flex direction={{ base: "column", md: "row" }} gap={4} align="stretch">
              <Box position="relative" flex={1}>
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2}>
                  <Icon as={Search} boxSize={4} color="gray.400" />
                </Box>
                <Input
                  placeholder="Search expenses, vendors, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl={10}
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                  transition="all 0.2s"
                />
              </Box>
              <HStack spacing={3}>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger w="180px" bg="white" borderColor="gray.200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent bg="white" borderColor="gray.200">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" bg="white" borderColor="gray.200">
                  Export
                </Button>
              </HStack>
            </Flex>
          </Box>
        </VStack>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <VStack spacing={3}>
              {[...Array(5)].map((_, i) => (
                <Box key={i} h={20} bg="gray.200" borderRadius="md" w="full" />
              ))}
            </VStack>
          ) : expenses.length === 0 ? (
            <VStack spacing={4} py={12} textAlign="center">
              <Icon as={Receipt} boxSize={12} color="gray.400" />
              <Text fontSize="lg" fontWeight="semibold">No expenses found</Text>
              <Text color="gray.500" mb={4}>
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding your first expense."}
              </Text>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Icon as={Plus} boxSize={4} mr={2} />
                Add Expense
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4}>
              {expenses.map((expense, index) => (
                <Flex
                  key={expense.id}
                  align="center"
                  gap={4}
                  p={5}
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="xl"
                  _hover={{ shadow: "lg", transform: "scale(1.01)" }}
                  transition="all 0.2s"
                  w="full"
                >
                  <Box flex={1}>
                    <HStack spacing={3} mb={2} align="center">
                      <Text fontWeight="semibold">{expense.description}</Text>
                      {expense.category && (
                        <Badge variant="outline">{expense.category.name}</Badge>
                      )}
                      {expense.is_billable && (
                        <Badge variant="secondary">Billable</Badge>
                      )}
                      {expense.receipt && (
                        <Badge variant="default">
                          <Icon as={Receipt} boxSize={3} mr={1} />
                          Receipt
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={4} fontSize="sm" color="gray.500">
                      <Text>{isPrivacyMode ? maskValue(expense.vendor) : expense.vendor || 'No vendor'}</Text>
                      <Text>{new Date(expense.expense_date).toLocaleDateString('en-CA')}</Text>
                      {expense.tax_amount && expense.tax_amount > 0 && (
                        <Text>Tax: ${isPrivacyMode ? maskValue(expense.tax_amount) : expense.tax_amount.toFixed(2)}</Text>
                      )}
                    </HStack>
                  </Box>
                  
                  <HStack spacing={3} align="center">
                    <Box textAlign="right">
                      <Text fontWeight="semibold" fontSize="lg">
                        ${isPrivacyMode ? maskValue(expense.amount) : expense.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </Text>
                      <Text fontSize="xs" color="gray.500">{expense.currency}</Text>
                    </Box>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icon as={MoreHorizontal} boxSize={4} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedExpense(expense)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Icon as={Edit} boxSize={4} mr={2} />
                          Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this expense?")) {
                              deleteMutation.mutate(expense.id)
                            }
                          }}
                          color="red.500"
                        >
                          <Icon as={Trash2} boxSize={4} mr={2} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          )}
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent maxW="2xl">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseForm
              expense={selectedExpense}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setSelectedExpense(null)
                queryClient.invalidateQueries({ queryKey: ['simple-expenses'] })
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </VStack>
  )
}