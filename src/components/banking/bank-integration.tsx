import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { showToast } from "@/lib/toast"
import { 
  Banknote, 
  Plus, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { usePrivacy } from "@/hooks/use-privacy"

interface BankAccount {
  id: string
  account_name: string
  account_type: string
  institution_name: string
  account_number_masked: string
  current_balance: number
  currency: string
  last_sync_at: string | null
  is_active: boolean
}

interface BankTransaction {
  id: string
  transaction_id: string
  description: string
  amount: number
  transaction_date: string
  status: string
  category_suggested: string | null
  is_reconciled: boolean
  bank_account: {
    account_name: string
    institution_name: string
  }
}

export function BankIntegration() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isConnecting, setIsConnecting] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ show: false, progress: 0 })
  
  const { maskValue, isPrivacyMode } = usePrivacy()
  const queryClient = useQueryClient()

  // Fetch bank accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as BankAccount[]
    }
  })

  // Fetch bank transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['bank-transactions', selectedAccount, statusFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('bank_transactions')
        .select(`
          *,
          bank_account:bank_accounts(account_name, institution_name)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(50)

      if (selectedAccount !== "all") {
        query = query.eq('bank_account_id', selectedAccount)
      }

      if (statusFilter !== "all") {
        if (statusFilter === "reconciled") {
          query = query.eq('is_reconciled', true)
        } else if (statusFilter === "unreconciled") {
          query = query.eq('is_reconciled', false)
        } else {
          query = query.eq('status', statusFilter as 'pending' | 'cleared' | 'reconciled')
        }
      }

      const { data, error } = await query

      if (error) throw error
      return data as BankTransaction[]
    }
  })

  // Sync bank transactions
  const syncTransactionsMutation = useMutation({
    mutationFn: async (accountId?: string) => {
      setSyncProgress({ show: true, progress: 0 })
      
      const accountsToSync = accountId ? [accountId] : accounts.map(acc => acc.id)
      
      for (let i = 0; i < accountsToSync.length; i++) {
        setSyncProgress(prev => ({ ...prev, progress: (i / accountsToSync.length) * 100 }))
        
        // Simulate API call to bank for demo
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update last sync time
        await supabase
          .from('bank_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', accountsToSync[i])
      }
      
      setSyncProgress({ show: false, progress: 0 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      showToast({ title: 'Success', description: 'Bank transactions synced successfully', status: 'success' })
    },
    onError: () => {
      setSyncProgress({ show: false, progress: 0 })
      showToast({ title: 'Error', description: 'Failed to sync bank transactions', status: 'error' })
    }
  })

  // Add new bank account
  const addAccountMutation = useMutation({
    mutationFn: async (accountData: Partial<BankAccount>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('bank_accounts')
        .insert({
          account_name: accountData.account_name!,
          account_type: accountData.account_type as 'checking' | 'savings' | 'credit_card' | 'business',
          institution_name: accountData.institution_name,
          account_number_masked: accountData.account_number_masked,
          current_balance: accountData.current_balance,
          currency: accountData.currency || 'CAD',
          user_id: user.id
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] })
      showToast({ title: 'Success', description: 'Bank account connected successfully', status: 'success' })
    },
    onError: () => {
      showToast({ title: 'Error', description: 'Failed to connect bank account', status: 'error' })
    }
  })

  const connectBankAccount = async () => {
    setIsConnecting(true)
    try {
      // Simulate bank connection flow
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Add demo account
      const accountData = {
        account_name: "Business Checking",
        account_type: "checking" as const,
        institution_name: "TD Canada Trust",
        account_number_masked: "****1234",
        current_balance: 15750.50,
        currency: "CAD"
      }
      await addAccountMutation.mutateAsync(accountData)
    } catch (error) {
      showToast({ title: 'Error', description: 'Failed to connect bank account', status: 'error' })
    } finally {
      setIsConnecting(false)
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0)
  const unreconciled = transactions.filter(t => !t.is_reconciled).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Bank Integration</h2>
          <p className="text-muted-foreground">
            Connect your bank accounts for automatic transaction import and reconciliation
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => syncTransactionsMutation.mutate(undefined)}
            disabled={syncTransactionsMutation.isPending || accounts.length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
          <Button onClick={connectBankAccount} disabled={isConnecting}>
            <Plus className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect Bank'}
          </Button>
        </div>
      </div>

      {/* Sync Progress */}
      {syncProgress.show && (
        <Alert>
          <RotateCcw className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Syncing bank transactions...</span>
                <span className="text-sm">{Math.round(syncProgress.progress)}%</span>
              </div>
              <Progress value={syncProgress.progress} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Account Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(totalBalance) : totalBalance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active bank connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreconciled</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreconciled}</div>
            <p className="text-xs text-muted-foreground">
              Transactions need review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{account.account_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {account.account_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {account.institution_name} • {account.account_number_masked}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {account.last_sync_at 
                          ? new Date(account.last_sync_at).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        ${isPrivacyMode ? maskValue(account.current_balance) : account.current_balance?.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{account.currency}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => syncTransactionsMutation.mutate(account.id)}
                      disabled={syncTransactionsMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.account_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
            <SelectItem value="unreconciled">Unreconciled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest bank transactions from connected accounts
          </p>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {accounts.length === 0 
                  ? "Connect a bank account to see your transactions here"
                  : "Sync your accounts to import transactions"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.amount > 0 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.bank_account?.account_name}</span>
                        <span>•</span>
                        <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                        {transaction.category_suggested && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category_suggested}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        ${isPrivacyMode ? maskValue(Math.abs(transaction.amount)) : Math.abs(transaction.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}