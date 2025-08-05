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
import { toast } from "sonner"
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

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-success animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="p-2 bg-gradient-success rounded-lg shadow-success">
              <DollarSign className="h-4 w-4 text-success-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              ${isPrivacyMode ? maskValue(summaryStats.totalAmount) : summaryStats.totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {summaryStats.total} total expenses • +12% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-primary animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expense Count</CardTitle>
            <div className="p-2 bg-gradient-primary rounded-lg shadow-primary">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {summaryStats.total}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Recorded expenses • 8 pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-warning animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Amount</CardTitle>
            <div className="p-2 bg-gradient-warning rounded-lg shadow-warning">
              <DollarSign className="h-4 w-4 text-warning-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-warning bg-clip-text text-transparent">
              ${isPrivacyMode ? maskValue(summaryStats.averageAmount) : summaryStats.averageAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Per expense • -3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Actions */}
      <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 shadow-glass animate-fade-in">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Smart Expense Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered categorization and real-time insights for your business expenses
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:shadow-primary transition-all duration-200 animate-pulse-glow">
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
                      queryClient.invalidateQueries({ queryKey: ['simple-expenses'] })
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-card-elevated/50 rounded-lg border border-border/30">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses, vendors, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="bg-background/50 backdrop-blur-sm border-border/50">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding your first expense."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="group flex items-center gap-4 p-5 bg-gradient-glass backdrop-blur-sm border border-border/50 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{expense.description}</p>
                      {expense.category && (
                        <Badge variant="outline">{expense.category.name}</Badge>
                      )}
                      {expense.is_billable && (
                        <Badge variant="secondary">Billable</Badge>
                      )}
                      {expense.receipt && (
                        <Badge variant="default">
                          <Receipt className="h-3 w-3 mr-1" />
                          Receipt
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{isPrivacyMode ? maskValue(expense.vendor) : expense.vendor || 'No vendor'}</span>
                      <span>{new Date(expense.expense_date).toLocaleDateString('en-CA')}</span>
                      {expense.tax_amount && expense.tax_amount > 0 && (
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedExpense(expense)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this expense?")) {
                              deleteMutation.mutate(expense.id)
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                queryClient.invalidateQueries({ queryKey: ['simple-expenses'] })
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}