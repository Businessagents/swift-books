import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LedgerFilters } from "@/pages/Ledger"
import { usePrivacy } from "@/hooks/use-privacy"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  Clock, 
  Building2,
  Receipt,
  Link,
  MoreHorizontal
} from "lucide-react"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LedgerTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'bank' | 'expense' | 'income' | 'transfer'
  account_name: string
  account_id: string
  is_reconciled: boolean
  category?: string
  reference?: string
  running_balance?: number
  // Bank transaction fields
  bank_transaction_id?: string
  transaction_id?: string
  // Expense fields
  expense_id?: string
  vendor?: string
  // Additional fields for reconciliation
  matched_transaction_id?: string
  confidence_score?: number
}

interface LedgerTableProps {
  filters: LedgerFilters
  onReconcileTransaction: (accountId: string) => void
}

export function LedgerTable({ filters, onReconcileTransaction }: LedgerTableProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const { maskValue, isPrivacyMode } = usePrivacy()

  // Fetch merged transactions (bank + expenses + income)
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['ledger-transactions', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch bank transactions
      let bankQuery = supabase
        .from('bank_transactions')
        .select(`
          id,
          transaction_id,
          description,
          amount,
          transaction_date,
          is_reconciled,
          category_suggested,
          bank_account_id,
          bank_account:bank_accounts(account_name)
        `)
        .eq('user_id', user.id)

      // Apply filters
      if (filters.accountId !== "all") {
        bankQuery = bankQuery.eq('bank_account_id', filters.accountId)
      }

      if (filters.reconciliationStatus !== "all") {
        bankQuery = bankQuery.eq('is_reconciled', filters.reconciliationStatus === "reconciled")
      }

      if (filters.dateRange.from) {
        bankQuery = bankQuery.gte('transaction_date', filters.dateRange.from.toISOString())
      }

      if (filters.dateRange.to) {
        bankQuery = bankQuery.lte('transaction_date', filters.dateRange.to.toISOString())
      }

      if (filters.searchQuery) {
        bankQuery = bankQuery.ilike('description', `%${filters.searchQuery}%`)
      }

      // Fetch expenses that might be linked to bank transactions
      let expenseQuery = supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          expense_date,
          vendor,
          category:expense_categories(name),
          receipt:receipts(file_name)
        `)
        .eq('user_id', user.id)

      if (filters.dateRange.from) {
        expenseQuery = expenseQuery.gte('expense_date', filters.dateRange.from.toISOString())
      }

      if (filters.dateRange.to) {
        expenseQuery = expenseQuery.lte('expense_date', filters.dateRange.to.toISOString())
      }

      if (filters.searchQuery) {
        expenseQuery = expenseQuery.or(`description.ilike.%${filters.searchQuery}%,vendor.ilike.%${filters.searchQuery}%`)
      }

      const [bankResult, expenseResult] = await Promise.all([
        bankQuery.order('transaction_date', { ascending: false }).limit(100),
        expenseQuery.order('expense_date', { ascending: false }).limit(100)
      ])

      if (bankResult.error) throw bankResult.error
      if (expenseResult.error) throw expenseResult.error

      const bankTransactions = (bankResult.data || []).map(t => ({
        id: `bank-${t.id}`,
        date: t.transaction_date,
        description: t.description,
        amount: t.amount,
        type: 'bank' as const,
        account_name: t.bank_account?.account_name || 'Unknown',
        account_id: t.bank_account_id,
        is_reconciled: t.is_reconciled,
        category: t.category_suggested,
        reference: t.transaction_id,
        bank_transaction_id: t.id
      }))

      const expenseTransactions = (expenseResult.data || []).map(e => ({
        id: `expense-${e.id}`,
        date: e.expense_date,
        description: e.description,
        amount: -Math.abs(e.amount), // Expenses are negative in ledger view
        type: 'expense' as const,
        account_name: 'Manual Entry',
        account_id: 'manual',
        is_reconciled: false, // Manual expenses need to be matched to bank transactions
        category: e.category?.name,
        vendor: e.vendor,
        expense_id: e.id
      }))

      // Combine and sort all transactions by date
      const allTransactions = [...bankTransactions, ...expenseTransactions]
        .filter(t => {
          if (filters.transactionType !== "all") {
            if (filters.transactionType === "income" && t.amount <= 0) return false
            if (filters.transactionType === "expense" && t.amount >= 0) return false
          }
          return true
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return allTransactions
    }
  })

  // Calculate running balances by account
  const transactionsWithBalance = useMemo(() => {
    if (!transactions.length) return []

    // Group transactions by account
    const accountTransactions = transactions.reduce((acc, transaction) => {
      const accountId = transaction.account_id
      if (!acc[accountId]) acc[accountId] = []
      acc[accountId].push(transaction)
      return acc
    }, {} as Record<string, LedgerTransaction[]>)

    // Calculate running balances for each account
    const result: LedgerTransaction[] = []
    
    Object.entries(accountTransactions).forEach(([accountId, accountTxns]) => {
      // Sort by date ascending for balance calculation
      const sortedTxns = [...accountTxns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      let runningBalance = 0
      sortedTxns.forEach(txn => {
        runningBalance += txn.amount
        result.push({
          ...txn,
          running_balance: runningBalance
        })
      })
    })

    // Sort back by date descending for display
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions])

  const handleSelectTransaction = (transactionId: string, selected: boolean) => {
    const newSelected = new Set(selectedTransactions)
    if (selected) {
      newSelected.add(transactionId)
    } else {
      newSelected.delete(transactionId)
    }
    setSelectedTransactions(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTransactions(new Set(transactionsWithBalance.map(t => t.id)))
    } else {
      setSelectedTransactions(new Set())
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-4 bg-muted rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedTransactions.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedTransactions.size} transaction(s) selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Link className="h-4 w-4 mr-2" />
              Link Transactions
            </Button>
            <Button size="sm" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Reconciled
            </Button>
            <Button size="sm" variant="outline">
              Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="border border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTransactions.size === transactionsWithBalance.length && transactionsWithBalance.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsWithBalance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="space-y-2">
                    <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or date range
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactionsWithBalance.map((transaction, index) => (
                <TableRow 
                  key={transaction.id}
                  className={`
                    hover:bg-muted/50 transition-colors animate-scale-in
                    ${selectedTransactions.has(transaction.id) ? 'bg-primary/5' : ''}
                  `}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.has(transaction.id)}
                      onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                    />
                  </TableCell>
                  
                  <TableCell className="font-mono text-sm">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded ${
                        transaction.amount > 0 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownLeft className="h-3 w-3" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {transaction.type === 'expense' && transaction.vendor && (
                            <span className="text-xs text-muted-foreground">
                              {isPrivacyMode ? maskValue(transaction.vendor) : transaction.vendor}
                            </span>
                          )}
                          {transaction.reference && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Ref: {transaction.reference}
                            </span>
                          )}
                          {transaction.expense_id && (
                            <Badge variant="outline" className="text-xs">
                              <Receipt className="h-2 w-2 mr-1" />
                              Manual
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{transaction.account_name}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {transaction.category && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <span className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}
                      ${isPrivacyMode ? maskValue(Math.abs(transaction.amount)) : Math.abs(transaction.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <span className="font-mono text-sm">
                      ${isPrivacyMode ? maskValue(transaction.running_balance || 0) : (transaction.running_balance || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {transaction.is_reconciled ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reconciled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link className="h-4 w-4 mr-2" />
                          Link Transaction
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onReconcileTransaction(transaction.account_id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reconcile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {transactionsWithBalance.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg text-sm">
          <div className="flex gap-6">
            <span>
              Total transactions: <strong>{transactionsWithBalance.length}</strong>
            </span>
            <span>
              Reconciled: <strong>{transactionsWithBalance.filter(t => t.is_reconciled).length}</strong>
            </span>
            <span>
              Pending: <strong>{transactionsWithBalance.filter(t => !t.is_reconciled).length}</strong>
            </span>
          </div>
          
          <div className="flex gap-4">
            <span>
              Total In: <strong className="text-green-600">
                ${transactionsWithBalance
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </strong>
            </span>
            <span>
              Total Out: <strong className="text-red-600">
                ${Math.abs(transactionsWithBalance
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + t.amount, 0))
                  .toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}