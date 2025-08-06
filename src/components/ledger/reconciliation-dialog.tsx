import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CheckCircle, 
  AlertTriangle, 
  Link, 
  Zap, 
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface ReconciliationDialogProps {
  isOpen: boolean
  onClose: () => void
  accountId: string | null
}

interface UnreconciledTransaction {
  id: string
  description: string
  amount: number
  transaction_date: string
  type: 'bank' | 'expense'
  bank_account_id?: string
  expense_id?: string
  vendor?: string
  category?: string
  confidence_matches?: Array<{
    id: string
    description: string
    amount: number
    date: string
    confidence: number
  }>
}

interface ReconciliationMatch {
  bank_transaction_id: string
  expense_id?: string
  confidence: number
  amount_difference: number
  date_difference: number
}

export function ReconciliationDialog({ isOpen, onClose, accountId }: ReconciliationDialogProps) {
  const [reconciliationStep, setReconciliationStep] = useState<'setup' | 'matching' | 'review' | 'complete'>('setup')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [statementEndingBalance, setStatementEndingBalance] = useState('')
  const [reconciliationDate, setReconciliationDate] = useState(new Date().toISOString().split('T')[0])
  const [autoMatchProgress, setAutoMatchProgress] = useState(0)
  const [isAutoMatching, setIsAutoMatching] = useState(false)
  
  const queryClient = useQueryClient()

  // Fetch unreconciled transactions
  const { data: unreconciledTransactions = [], isLoading } = useQuery({
    queryKey: ['unreconciled-transactions', accountId],
    queryFn: async () => {
      if (!accountId || accountId === 'all') {
        // Fetch from all accounts
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Get bank transactions
        const bankQuery = supabase
          .from('bank_transactions')
          .select(`
            id,
            description,
            amount,
            transaction_date,
            bank_account_id,
            bank_account:bank_accounts(account_name)
          `)
          .eq('user_id', user.id)
          .eq('is_reconciled', false)
          .order('transaction_date', { ascending: false })

        // Get unlinked expenses
        const expenseQuery = supabase
          .from('expenses')
          .select(`
            id,
            description,
            amount,
            expense_date,
            vendor,
            category:expense_categories(name)
          `)
          .eq('user_id', user.id)
          .is('bank_transaction_id', null) // Only expenses not linked to bank transactions

        const [bankResult, expenseResult] = await Promise.all([bankQuery, expenseQuery])

        if (bankResult.error) throw bankResult.error
        if (expenseResult.error) throw expenseResult.error

        const bankTransactions = (bankResult.data || []).map(t => ({
          id: `bank-${t.id}`,
          description: t.description,
          amount: t.amount,
          transaction_date: t.transaction_date,
          type: 'bank' as const,
          bank_account_id: t.bank_account_id,
          bank_transaction_id: t.id
        }))

        const expenses = (expenseResult.data || []).map(e => ({
          id: `expense-${e.id}`,
          description: e.description,
          amount: -Math.abs(e.amount),
          transaction_date: e.expense_date,
          type: 'expense' as const,
          expense_id: e.id,
          vendor: e.vendor,
          category: e.category?.name
        }))

        return [...bankTransactions, ...expenses]
      } else {
        // Fetch for specific account
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('bank_transactions')
          .select(`
            id,
            description,
            amount,
            transaction_date,
            bank_account_id
          `)
          .eq('user_id', user.id)
          .eq('bank_account_id', accountId)
          .eq('is_reconciled', false)
          .order('transaction_date', { ascending: false })

        if (error) throw error

        return (data || []).map(t => ({
          id: `bank-${t.id}`,
          description: t.description,
          amount: t.amount,
          transaction_date: t.transaction_date,
          type: 'bank' as const,
          bank_account_id: t.bank_account_id,
          bank_transaction_id: t.id
        }))
      }
    },
    enabled: isOpen
  })

  // Auto-match transactions mutation
  const autoMatchMutation = useMutation({
    mutationFn: async () => {
      setIsAutoMatching(true)
      setAutoMatchProgress(0)

      // Simulate auto-matching process
      const bankTransactions = unreconciledTransactions.filter(t => t.type === 'bank')
      const expenses = unreconciledTransactions.filter(t => t.type === 'expense')
      
      const matches: ReconciliationMatch[] = []
      
      for (let i = 0; i < bankTransactions.length; i++) {
        const bankTxn = bankTransactions[i]
        setAutoMatchProgress((i / bankTransactions.length) * 100)
        
        // Simple matching algorithm
        for (const expense of expenses) {
          const amountDiff = Math.abs(Math.abs(bankTxn.amount) - Math.abs(expense.amount))
          const dateDiff = Math.abs(new Date(bankTxn.transaction_date).getTime() - new Date(expense.transaction_date).getTime()) / (1000 * 60 * 60 * 24)
          
          let confidence = 0
          
          // Amount match (0-40 points)
          if (amountDiff === 0) confidence += 40
          else if (amountDiff < 1) confidence += 35
          else if (amountDiff < 5) confidence += 25
          else if (amountDiff < 10) confidence += 15
          
          // Date match (0-30 points)
          if (dateDiff === 0) confidence += 30
          else if (dateDiff <= 1) confidence += 25
          else if (dateDiff <= 3) confidence += 20
          else if (dateDiff <= 7) confidence += 10
          
          // Description similarity (0-30 points)
          const descSimilarity = calculateStringSimilarity(
            bankTxn.description.toLowerCase(),
            (expense.vendor || expense.description).toLowerCase()
          )
          confidence += descSimilarity * 30
          
          // Only consider matches with confidence > 60%
          if (confidence > 60) {
            matches.push({
              bank_transaction_id: bankTxn.bank_transaction_id!,
              expense_id: expense.expense_id!,
              confidence,
              amount_difference: amountDiff,
              date_difference: dateDiff
            })
          }
        }
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setAutoMatchProgress(100)
      return matches
    },
    onSuccess: (matches) => {
      // Auto-select high-confidence matches
      const highConfidenceMatches = matches.filter(m => m.confidence > 80).map(m => m.bank_transaction_id)
      setSelectedMatches(new Set(highConfidenceMatches))
      setReconciliationStep('review')
      toast.success(`Found ${matches.length} potential matches, ${highConfidenceMatches.length} auto-selected`)
    },
    onError: () => {
      toast.error('Failed to auto-match transactions')
    },
    onSettled: () => {
      setIsAutoMatching(false)
    }
  })

  // Reconcile selected transactions mutation
  const reconcileMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Mark selected transactions as reconciled
      const selectedTransactionIds = Array.from(selectedMatches)
        .map(id => id.replace('bank-', ''))
        .filter(id => !isNaN(Number(id)))

      if (selectedTransactionIds.length > 0) {
        const { error } = await supabase
          .from('bank_transactions')
          .update({ is_reconciled: true, reconciled_at: new Date().toISOString() })
          .in('id', selectedTransactionIds)

        if (error) throw error
      }

      return selectedTransactionIds.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['unreconciled-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bank-accounts-summary'] })
      queryClient.invalidateQueries({ queryKey: ['account-balances'] })
      queryClient.invalidateQueries({ queryKey: ['ledger-transactions'] })
      
      setReconciliationStep('complete')
      toast.success(`Successfully reconciled ${count} transactions`)
    },
    onError: () => {
      toast.error('Failed to reconcile transactions')
    }
  })

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    const editDistance = calculateEditDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  const calculateEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  const handleStartReconciliation = () => {
    setReconciliationStep('matching')
    autoMatchMutation.mutate()
  }

  const handleCompleteReconciliation = () => {
    reconcileMutation.mutate()
  }

  const handleClose = () => {
    setReconciliationStep('setup')
    setSelectedMatches(new Set())
    setAutoMatchProgress(0)
    setIsAutoMatching(false)
    onClose()
  }

  const totalUnreconciled = unreconciledTransactions.length
  const selectedCount = selectedMatches.size

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Bank Reconciliation
          </DialogTitle>
          <DialogDescription>
            {accountId === 'all' ? 'Reconcile all accounts' : 'Reconcile account transactions'} with your bank statements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {['Setup', 'Matching', 'Review', 'Complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= ['setup', 'matching', 'review', 'complete'].indexOf(reconciliationStep) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'}
                `}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{step}</span>
                {index < 3 && <div className="w-8 h-px bg-border ml-2" />}
              </div>
            ))}
          </div>

          {/* Setup Step */}
          {reconciliationStep === 'setup' && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {totalUnreconciled} unreconciled transactions. This reconciliation will help match your bank statements with recorded transactions.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="reconciliation-date">Reconciliation Date</Label>
                  <Input
                    id="reconciliation-date"
                    type="date"
                    value={reconciliationDate}
                    onChange={(e) => setReconciliationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ending-balance">Statement Ending Balance (Optional)</Label>
                  <Input
                    id="ending-balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={statementEndingBalance}
                    onChange={(e) => setStatementEndingBalance(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2">What happens during reconciliation:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Auto-match bank transactions with expenses based on amount, date, and description</li>
                  <li>• Review suggested matches and manually adjust if needed</li>
                  <li>• Mark confirmed transactions as reconciled</li>
                  <li>• Generate reconciliation report</li>
                </ul>
              </div>

              <Button 
                onClick={handleStartReconciliation} 
                className="w-full"
                disabled={totalUnreconciled === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Auto-Matching ({totalUnreconciled} transactions)
              </Button>
            </div>
          )}

          {/* Matching Step */}
          {reconciliationStep === 'matching' && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <h4 className="font-semibold">Auto-matching transactions...</h4>
                <p className="text-sm text-muted-foreground">
                  Analyzing {totalUnreconciled} transactions for potential matches
                </p>
              </div>

              <Progress value={autoMatchProgress} className="w-full" />
              
              <div className="text-center text-sm text-muted-foreground">
                {Math.round(autoMatchProgress)}% complete
              </div>
            </div>
          )}

          {/* Review Step */}
          {reconciliationStep === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Review Matches ({selectedCount} selected)</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMatches(new Set())}>
                    Clear All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => 
                    setSelectedMatches(new Set(unreconciledTransactions.map(t => t.id)))
                  }>
                    Select All
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-3">
                  {unreconciledTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`
                        p-4 border rounded-lg transition-all duration-200
                        ${selectedMatches.has(transaction.id) ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedMatches.has(transaction.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedMatches)
                            if (checked) {
                              newSelected.add(transaction.id)
                            } else {
                              newSelected.delete(transaction.id)
                            }
                            setSelectedMatches(newSelected)
                          }}
                        />
                        
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
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                                </span>
                                <Badge variant={transaction.type === 'bank' ? 'default' : 'secondary'} className="text-xs">
                                  {transaction.type === 'bank' ? 'Bank' : 'Manual'}
                                </Badge>
                                {transaction.vendor && (
                                  <span className="text-xs text-muted-foreground">
                                    {transaction.vendor}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}
                                ${Math.abs(transaction.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedCount} of {totalUnreconciled} transactions selected for reconciliation
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setReconciliationStep('setup')}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCompleteReconciliation}
                    disabled={selectedCount === 0 || reconcileMutation.isPending}
                  >
                    {reconcileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reconciling...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reconcile {selectedCount} Transactions
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {reconciliationStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Reconciliation Complete!</h4>
                <p className="text-muted-foreground">
                  Successfully reconciled {selectedCount} transactions
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reconciled transactions:</span>
                    <span className="font-semibold">{selectedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining unreconciled:</span>
                    <span className="font-semibold">{totalUnreconciled - selectedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reconciliation date:</span>
                    <span className="font-semibold">{format(new Date(reconciliationDate), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}