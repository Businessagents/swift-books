import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { usePrivacy } from "@/hooks/use-privacy"
import { 
  Banknote, 
  Building2, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react"

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

interface AccountBalance {
  account_id: string
  account_name: string
  book_balance: number
  bank_balance: number
  unreconciled_count: number
  last_reconciled_at: string | null
}

export function AccountSummary() {
  const { maskValue, isPrivacyMode } = usePrivacy()

  // Fetch bank accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts-summary'],
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

  // Calculate account balances with reconciliation status
  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ['account-balances'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get all accounts
      const accountsPromise = supabase
        .from('bank_accounts')
        .select('id, account_name, current_balance')
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Get unreconciled transactions per account
      const transactionsPromise = supabase
        .from('bank_transactions')
        .select('bank_account_id, amount, is_reconciled')
        .eq('user_id', user.id)

      const [accountsResult, transactionsResult] = await Promise.all([accountsPromise, transactionsPromise])

      if (accountsResult.error) throw accountsResult.error
      if (transactionsResult.error) throw transactionsResult.error

      const accountsData = accountsResult.data || []
      const transactionsData = transactionsResult.data || []

      // Calculate balances for each account
      return accountsData.map(account => {
        const accountTransactions = transactionsData.filter(t => t.bank_account_id === account.id)
        const unreconciledTransactions = accountTransactions.filter(t => !t.is_reconciled)
        
        // Calculate book balance (bank balance + unreconciled transactions)
        const unreconciledAmount = unreconciledTransactions.reduce((sum, t) => sum + t.amount, 0)
        const bookBalance = account.current_balance + unreconciledAmount

        return {
          account_id: account.id,
          account_name: account.account_name,
          book_balance: bookBalance,
          bank_balance: account.current_balance,
          unreconciled_count: unreconciledTransactions.length,
          last_reconciled_at: null // TODO: Add last reconciliation timestamp
        }
      })
    },
    enabled: accounts.length > 0
  })

  // Calculate totals
  const totalBankBalance = balances.reduce((sum, balance) => sum + balance.bank_balance, 0)
  const totalBookBalance = balances.reduce((sum, balance) => sum + balance.book_balance, 0)
  const totalUnreconciled = balances.reduce((sum, balance) => sum + balance.unreconciled_count, 0)
  const balanceDifference = totalBookBalance - totalBankBalance

  if (accountsLoading || balancesLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card.Root key={i} className="animate-pulse">
            <Card.Header className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </Card.Header>
            <Card.Body>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </Card.Body>
          </Card.Root>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card.Root className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-success animate-scale-in">
          <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Card.Title className="text-sm font-medium text-muted-foreground">Total Bank Balance</Card.Title>
            <Banknote className="h-4 w-4 text-success" />
          </Card.Header>
          <Card.Body>
            <div className="text-2xl font-bold text-success">
              ${isPrivacyMode ? maskValue(totalBankBalance) : totalBankBalance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {accounts.length} accounts
            </p>
          </Card.Body>
        </Card.Root>

        <Card.Root className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-primary animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Card.Title className="text-sm font-medium text-muted-foreground">Book Balance</Card.Title>
            <Building2 className="h-4 w-4 text-primary" />
          </Card.Header>
          <Card.Body>
            <div className="text-2xl font-bold">
              ${isPrivacyMode ? maskValue(totalBookBalance) : totalBookBalance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Including pending transactions
            </p>
          </Card.Body>
        </Card.Root>

        <Card.Root className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-warning animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Card.Title className="text-sm font-medium text-muted-foreground">Balance Difference</Card.Title>
            {balanceDifference >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </Card.Header>
          <Card.Body>
            <div className={`text-2xl font-bold ${balanceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceDifference >= 0 ? '+' : ''}${isPrivacyMode ? maskValue(Math.abs(balanceDifference)) : Math.abs(balanceDifference).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Book vs Bank difference
            </p>
          </Card.Body>
        </Card.Root>

        <Card.Root className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:shadow-destructive animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Card.Title className="text-sm font-medium text-muted-foreground">Unreconciled</Card.Title>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </Card.Header>
          <Card.Body>
            <div className="text-2xl font-bold text-orange-600">
              {totalUnreconciled}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions need review
            </p>
          </Card.Body>
        </Card.Root>
      </div>

      {/* Account Details */}
      {balances.length > 0 && (
        <Card.Root className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
          <Card.Header>
            <Card.Title className="flex items-center justify-between">
              Account Details
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All
              </Button>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {balances.map((balance, index) => (
                <div
                  key={balance.account_id}
                  className="flex items-center justify-between p-4 bg-gradient-glass backdrop-blur-sm border border-border/50 rounded-lg hover:shadow-md transition-all duration-200 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{balance.account_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {balance.unreconciled_count > 0 ? (
                          <Badge colorScheme="red" variant="solid" className="text-xs">
                            {balance.unreconciled_count} unreconciled
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-xs">
                            Reconciled
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Bank</p>
                        <p className="font-semibold">
                          ${isPrivacyMode ? maskValue(balance.bank_balance) : balance.bank_balance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Book</p>
                        <p className="font-semibold">
                          ${isPrivacyMode ? maskValue(balance.book_balance) : balance.book_balance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diff</p>
                        <p className={`font-semibold ${
                          balance.book_balance - balance.bank_balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {balance.book_balance - balance.bank_balance >= 0 ? '+' : ''}
                          ${isPrivacyMode ? maskValue(Math.abs(balance.book_balance - balance.bank_balance)) : Math.abs(balance.book_balance - balance.bank_balance).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>
      )}
    </div>
  )
}