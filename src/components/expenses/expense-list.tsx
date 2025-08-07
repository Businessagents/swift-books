import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/sonner"
import { Search, Plus, Edit, Trash2, Receipt, Calendar, DollarSign } from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"
import { ExpenseForm } from "./expense-form"

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
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
        toast.error("Failed to fetch expenses")
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
      toast.success("Expense deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete expense")
    }
  })

  const handleDelete = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expenseId)
    }
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalTax = expenses.reduce((sum, expense) => sum + (expense.tax_amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(totalAmount) : totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} expenses
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(totalTax) : totalTax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              GST/HST recoverable
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">
              {expenses.filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New expenses
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Expense Records</CardTitle>
              <p className="text-sm text-muted-foreground">Manage and track your business expenses</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false)
                    queryClient.invalidateQueries({ queryKey: ['expenses'] })
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding your first expense."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">{expense.description}</p>
                      {expense.category && (
                        <Badge variant="outline">{expense.category.name}</Badge>
                      )}
                      {expense.is_billable && (
                        <Badge variant="secondary">Billable</Badge>
                      )}
                      {expense.receipt && (
                        <Badge variant={expense.receipt.status === 'processed' ? 'default' : 'secondary'}>
                          <Receipt className="h-3 w-3 mr-1" />
                          Receipt
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{isPrivacyMode ? maskValue(expense.vendor) : expense.vendor || 'No vendor'}</span>
                      <span>{new Date(expense.expense_date).toLocaleDateString('en-CA')}</span>
                      {expense.tax_amount > 0 && (
                        <span>Tax: ${isPrivacyMode ? maskValue(expense.tax_amount) : expense.tax_amount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${isPrivacyMode ? maskValue(expense.amount) : expense.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{expense.currency}</p>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={isEditDialogOpen && selectedExpense?.id === expense.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Expense</DialogTitle>
                          </DialogHeader>
                          {selectedExpense && (
                            <ExpenseForm
                              expense={selectedExpense}
                              onSuccess={() => {
                                setIsEditDialogOpen(false)
                                setSelectedExpense(null)
                                queryClient.invalidateQueries({ queryKey: ['expenses'] })
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleteExpenseMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}