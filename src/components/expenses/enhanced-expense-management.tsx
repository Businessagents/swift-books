import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Receipt, 
  Calendar, 
  DollarSign, 
  Check, 
  X, 
  Clock,
  MoreHorizontal,
  CheckSquare,
  Square,
  Download,
  Filter,
  ChevronDown,
  AlertCircle,
  Users,
  TrendingUp
} from "lucide-react"
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
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  notes?: string
  category: { name: string; code: string } | null
  receipt: { file_name: string; status: string } | null
  user: { email: string; name?: string } | null
}

const EXPENSE_STATUSES = [
  { value: 'all', label: 'All Statuses', count: 0 },
  { value: 'pending', label: 'Pending Approval', count: 0 },
  { value: 'approved', label: 'Approved', count: 0 },
  { value: 'rejected', label: 'Rejected', count: 0 }
]

const BULK_ACTIONS = [
  { value: 'approve', label: 'Approve Selected', icon: Check },
  { value: 'reject', label: 'Reject Selected', icon: X },
  { value: 'delete', label: 'Delete Selected', icon: Trash2 },
  { value: 'export', label: 'Export Selected', icon: Download }
]

export function EnhancedExpenseManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set())
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()

  // Fetch expenses with enhanced filtering
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['enhanced-expenses', searchQuery, statusFilter, categoryFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(name, code),
          receipt:receipts(file_name, status),
          user:profiles(email, name)
        `)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,vendor.ilike.%${searchQuery}%`)
      }

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter)
      }

      if (categoryFilter !== "all") {
        query = query.eq('category.code', categoryFilter)
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

  const expenses = expensesData || []

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

  // Bulk approve expenses
  const bulkApproveMutation = useMutation({
    mutationFn: async (expenseIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .in('id', expenseIds)

      if (error) throw error
    },
    onSuccess: (_, expenseIds) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-expenses'] })
      setSelectedExpenses(new Set())
      toast.success(`${expenseIds.length} expenses approved successfully`)
    },
    onError: () => {
      toast.error("Failed to approve expenses")
    }
  })

  // Bulk reject expenses
  const bulkRejectMutation = useMutation({
    mutationFn: async ({ expenseIds, reason }: { expenseIds: string[], reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .in('id', expenseIds)

      if (error) throw error
    },
    onSuccess: (_, { expenseIds }) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-expenses'] })
      setSelectedExpenses(new Set())
      setShowRejectionDialog(false)
      setRejectionReason("")
      toast.success(`${expenseIds.length} expenses rejected`)
    },
    onError: () => {
      toast.error("Failed to reject expenses")
    }
  })

  // Bulk delete expenses
  const bulkDeleteMutation = useMutation({
    mutationFn: async (expenseIds: string[]) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .in('id', expenseIds)

      if (error) throw error
    },
    onSuccess: (_, expenseIds) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-expenses'] })
      setSelectedExpenses(new Set())
      toast.success(`${expenseIds.length} expenses deleted successfully`)
    },
    onError: () => {
      toast.error("Failed to delete expenses")
    }
  })

  // Single expense actions
  const singleActionMutation = useMutation({
    mutationFn: async ({ expenseId, action, reason }: { expenseId: string, action: 'approve' | 'reject', reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updates: any = { 
        status: action === 'approve' ? 'approved' : 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      }

      if (action === 'reject' && reason) {
        updates.rejection_reason = reason
      }

      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)

      if (error) throw error
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-expenses'] })
      toast.success(`Expense ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
    },
    onError: () => {
      toast.error("Failed to update expense status")
    }
  })

  // Calculate summary stats
  const summaryStats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    pendingAmount: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
  }

  const handleSelectAll = () => {
    if (selectedExpenses.size === expenses.length) {
      setSelectedExpenses(new Set())
    } else {
      setSelectedExpenses(new Set(expenses.map(e => e.id)))
    }
  }

  const handleSelectExpense = (expenseId: string) => {
    const newSelection = new Set(selectedExpenses)
    if (newSelection.has(expenseId)) {
      newSelection.delete(expenseId)
    } else {
      newSelection.add(expenseId)
    }
    setSelectedExpenses(newSelection)
  }

  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedExpenses)
    if (selectedIds.length === 0) {
      toast.error("Please select expenses first")
      return
    }

    switch (action) {
      case 'approve':
        bulkApproveMutation.mutate(selectedIds)
        break
      case 'reject':
        setShowRejectionDialog(true)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedIds.length} expenses?`)) {
          bulkDeleteMutation.mutate(selectedIds)
        }
        break
      case 'export':
        exportSelectedExpenses(selectedIds)
        break
    }
  }

  const exportSelectedExpenses = (expenseIds: string[]) => {
    const selectedExpensesData = expenses.filter(e => expenseIds.includes(e.id))
    const csvData = [
      ['Description', 'Vendor', 'Amount', 'Tax', 'Date', 'Status', 'Category'],
      ...selectedExpensesData.map(e => [
        e.description,
        e.vendor || '',
        e.amount.toFixed(2),
        e.tax_amount.toFixed(2),
        e.expense_date,
        e.status,
        e.category?.name || ''
      ])
    ]

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Expenses exported successfully')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isAllSelected = expenses.length > 0 && selectedExpenses.size === expenses.length
  const isSomeSelected = selectedExpenses.size > 0 && selectedExpenses.size < expenses.length

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(summaryStats.totalAmount) : summaryStats.totalAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.total} total expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${isPrivacyMode ? maskValue(summaryStats.pendingAmount) : summaryStats.pendingAmount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.pending} pending expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summaryStats.approved}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summaryStats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">
              Rejected expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enhanced Expense Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced expense workflow with bulk operations and approval system
              </p>
            </div>
            <div className="flex gap-2">
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
                      queryClient.invalidateQueries({ queryKey: ['enhanced-expenses'] })
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Advanced Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses, vendors, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.code}>
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
            </div>

            {/* Bulk Actions Bar */}
            {selectedExpenses.size > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>{selectedExpenses.size} expenses selected</span>
                    <div className="flex gap-2">
                      {BULK_ACTIONS.map(action => {
                        const Icon = action.icon
                        return (
                          <Button
                            key={action.value}
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction(action.value)}
                            disabled={bulkApproveMutation.isPending || bulkRejectMutation.isPending || bulkDeleteMutation.isPending}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {action.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all" || dateFilter !== "all"
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
              {/* Select All Header */}
              <div className="flex items-center gap-3 py-2 border-b">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <span className="text-sm text-muted-foreground">
                  {isAllSelected ? "Deselect all" : isSomeSelected ? `${selectedExpenses.size} selected` : "Select all"}
                </span>
              </div>

              {/* Expense List */}
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                    selectedExpenses.has(expense.id) ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/30'
                  }`}
                >
                  <Checkbox
                    checked={selectedExpenses.has(expense.id)}
                    onCheckedChange={() => handleSelectExpense(expense.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{expense.description}</p>
                      {getStatusBadge(expense.status)}
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
                      {expense.approved_by && expense.approved_at && (
                        <span className="text-xs">
                          {expense.status === 'approved' ? 'Approved' : 'Rejected'} {new Date(expense.approved_at).toLocaleDateString('en-CA')}
                        </span>
                      )}
                    </div>
                    {expense.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-800 dark:text-red-200">
                        <strong>Rejection reason:</strong> {expense.rejection_reason}
                      </div>
                    )}
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
                        
                        {expense.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => singleActionMutation.mutate({ expenseId: expense.id, action: 'approve' })}
                              disabled={singleActionMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                const reason = prompt("Rejection reason (optional):")
                                if (reason !== null) {
                                  singleActionMutation.mutate({ expenseId: expense.id, action: 'reject', reason })
                                }
                              }}
                              disabled={singleActionMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this expense?")) {
                              bulkDeleteMutation.mutate([expense.id])
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
                queryClient.invalidateQueries({ queryKey: ['enhanced-expenses'] })
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Selected Expenses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to reject {selectedExpenses.size} expenses. Please provide a reason:
            </p>
            <Input
              placeholder="Rejection reason (optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => bulkRejectMutation.mutate({ 
                  expenseIds: Array.from(selectedExpenses), 
                  reason: rejectionReason 
                })}
                disabled={bulkRejectMutation.isPending}
              >
                Reject Expenses
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}