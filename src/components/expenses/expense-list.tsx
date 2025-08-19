import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Badge,
  Input,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Flex,
  IconButton,
  Skeleton,
  useDisclosure
} from "@chakra-ui/react"
import { Search, Plus, Edit, Trash2, Receipt, Calendar, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog"
import { usePrivacy } from "@/hooks/use-privacy"
import { ExpenseForm } from "./expense-form"
import { showToast } from "@/lib/toast"

interface Expense {
  id: string
  description: string
  amount: number
  tax_amount: number
  expense_date: string
  vendor: string
  currency: string
  is_billable: boolean
  is_personal: boolean
  category: { name: string; code: string } | null
  receipt: { file_name: string; status: string } | null
}

export function ExpenseList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()
  
  const createDisclosure = useDisclosure()
  const editDisclosure = useDisclosure()

  // Fetch expenses
  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['expenses', searchQuery, categoryFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(name, code),
          receipt:receipts(file_name, status)
        `)
        .order('expense_date', { ascending: false })

      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,vendor.ilike.%${searchQuery}%`)
      }

      if (categoryFilter !== "all") {
        query = query.eq('category_id', categoryFilter)
      }

      if (dateFilter !== "all") {
        const now = new Date()
        let dateFrom = new Date()
        
        switch (dateFilter) {
          case "today":
            dateFrom.setHours(0, 0, 0, 0)
            break
          case "week":
            dateFrom.setDate(now.getDate() - 7)
            break
          case "month":
            dateFrom.setMonth(now.getMonth() - 1)
            break
          case "quarter":
            dateFrom.setMonth(now.getMonth() - 3)
            break
          case "year":
            dateFrom.setFullYear(now.getFullYear() - 1)
            break
        }
        
        if (dateFilter !== "all") {
          query = query.gte('expense_date', dateFrom.toISOString().split('T')[0])
        }
      }

      const { data, error } = await query

      if (error) {
        showToast({
          title: "Failed to fetch expenses",
          status: "error"
        })
        throw error
      }

      return data as Expense[]
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
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      showToast({
        title: "Expense deleted successfully",
        status: "success"
      })
    },
    onError: () => {
      showToast({
        title: "Failed to delete expense",
        status: "error"
      })
    }
  })

  const handleDelete = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId)
    }
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    editDisclosure.onOpen()
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalTax = expenses.reduce((sum, expense) => sum + (expense.tax_amount || 0), 0)

  return (
    <VStack gap={6} align="stretch">
      {/* Summary Cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem>
          <Card.Root>
            <Card.Header>
              <Flex justify="space-between" align="center">
                <Heading size="sm">Total Expenses</Heading>
                <DollarSign size={16} />
              </Flex>
            </Card.Header>
            <Card.Body>
              <Heading size="lg">
                ${isPrivacyMode ? maskValue(totalAmount) : totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </Heading>
              <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                {expenses.length} expenses
              </Text>
            </Card.Body>
          </Card.Root>
        </GridItem>

        <GridItem>
          <Card.Root>
            <Card.Header>
              <Flex justify="space-between" align="center">
                <Heading size="sm">Total Tax</Heading>
                <Receipt size={16} />
              </Flex>
            </Card.Header>
            <Card.Body>
              <Heading size="lg">
                ${isPrivacyMode ? maskValue(totalTax) : totalTax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </Heading>
              <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                GST/HST recoverable
              </Text>
            </Card.Body>
          </Card.Root>
        </GridItem>

        <GridItem>
          <Card.Root>
            <Card.Header>
              <Flex justify="space-between" align="center">
                <Heading size="sm">This Month</Heading>
                <Calendar size={16} />
              </Flex>
            </Card.Header>
            <Card.Body>
              <Heading size="lg">
                {expenses.filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth()).length}
              </Heading>
              <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                New expenses
              </Text>
            </Card.Body>
          </Card.Root>
        </GridItem>
      </Grid>

      {/* Main Content Card */}
      <Card.Root>
        <Card.Header>
          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={4}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
          >
            <Box>
              <Heading size="md">Expense Records</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                Manage and track your business expenses
              </Text>
            </Box>
            <Button onClick={createDisclosure.onOpen}>
              <Plus size={16} className="mr-2" />
              Add Expense
            </Button>
          </Flex>

          {/* Search and Filters */}
          <Flex direction={{ base: "column", sm: "row" }} gap={4} mt={4}>
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              flex={1}
            />
            <select
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-md w-full sm:w-auto"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </Flex>
        </Card.Header>

        <Card.Body>
          {isLoading ? (
            <VStack gap={3}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="64px" borderRadius="md" />
              ))}
            </VStack>
          ) : expenses.length === 0 ? (
            <VStack py={12} gap={4}>
              <Receipt size={48} color="gray" />
              <Heading size="md">No expenses found</Heading>
              <Text color="gray.600" _dark={{ color: "gray.400" }} textAlign="center">
                {searchQuery || categoryFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding your first expense."}
              </Text>
              <Button onClick={createDisclosure.onOpen}>
                <Plus size={16} className="mr-2" />
                Add Expense
              </Button>
            </VStack>
          ) : (
            <VStack gap={3} align="stretch">
              {expenses.map((expense) => (
                <Box
                  key={expense.id}
                  p={4}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  _hover={{ bg: "gray.50" }}
                  _dark={{
                    borderColor: "gray.600",
                    _hover: { bg: "gray.700" }
                  }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <HStack gap={3} mb={1}>
                        <Text fontWeight="semibold">{expense.description}</Text>
                        {expense.category && (
                          <Badge variant="outline">{expense.category.name}</Badge>
                        )}
                        {expense.is_billable && (
                          <Badge variant="outline">Billable</Badge>
                        )}
                        {expense.receipt && (
                          <Badge colorScheme={expense.receipt.status === 'processed' ? 'green' : 'gray'}>
                            <HStack gap={1}>
                              <Receipt size={12} />
                              <Text>Receipt</Text>
                            </HStack>
                          </Badge>
                        )}
                      </HStack>
                      <HStack gap={4} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                        <Text>{isPrivacyMode ? maskValue(expense.vendor) : expense.vendor || 'No vendor'}</Text>
                        <Text>{new Date(expense.expense_date).toLocaleDateString('en-CA')}</Text>
                        {expense.tax_amount > 0 && (
                          <Text>Tax: ${isPrivacyMode ? maskValue(expense.tax_amount) : expense.tax_amount.toFixed(2)}</Text>
                        )}
                      </HStack>
                    </Box>
                    <HStack gap={3}>
                      <Box textAlign="right">
                        <Text fontWeight="semibold" fontSize="lg">
                          ${isPrivacyMode ? maskValue(expense.amount) : expense.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </Text>
                        <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                          {expense.currency}
                        </Text>
                      </Box>
                      <HStack gap={1}>
                        <IconButton
                          aria-label="Edit expense"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          aria-label="Delete expense"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(expense.id)}
                          loading={deleteExpenseMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </HStack>
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Card.Body>
      </Card.Root>

      {/* Create Expense Dialog */}
      <Dialog open={createDisclosure.open} onOpenChange={createDisclosure.onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Expense</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <ExpenseForm
              onSuccess={() => {
                createDisclosure.onClose()
                refetch()
              }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={editDisclosure.open} onOpenChange={editDisclosure.onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {selectedExpense && (
              <ExpenseForm
                expense={selectedExpense}
                onSuccess={() => {
                  editDisclosure.onClose()
                  setSelectedExpense(null)
                  refetch()
                }}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </VStack>
  )
}