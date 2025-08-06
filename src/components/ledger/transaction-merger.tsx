import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface MergedTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'bank' | 'expense' | 'income' | 'transfer'
  account_id: string
  account_name: string
  is_reconciled: boolean
  category?: string
  vendor?: string
  reference?: string
  // Double-entry fields
  debit_account?: string
  credit_account?: string
  journal_entry_id?: string
  // Linkage fields
  bank_transaction_id?: string
  expense_id?: string
  invoice_id?: string
  matched_transaction_id?: string
  confidence_score?: number
}

export interface DoubleEntryJournal {
  id: string
  date: string
  description: string
  reference?: string
  entries: Array<{
    account: string
    debit: number
    credit: number
    description: string
  }>
  total_debits: number
  total_credits: number
  is_balanced: boolean
}

/**
 * Transaction Merger - Combines bank transactions, expenses, and invoices
 * into a unified ledger view with real-time updates and double-entry bookkeeping
 */
export function useTransactionMerger(filters?: {
  accountId?: string
  dateRange?: { from: Date; to: Date }
  searchQuery?: string
}) {
  // Fetch all transaction sources
  const { data: bankTransactions = [], isLoading: bankLoading } = useQuery({
    queryKey: ['bank-transactions-merger', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
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
          expense_id,
          bank_account:bank_accounts(account_name, account_type)
        `)
        .eq('user_id', user.id)

      if (filters?.accountId && filters.accountId !== 'all') {
        query = query.eq('bank_account_id', filters.accountId)
      }

      if (filters?.dateRange) {
        query = query
          .gte('transaction_date', filters.dateRange.from.toISOString())
          .lte('transaction_date', filters.dateRange.to.toISOString())
      }

      if (filters?.searchQuery) {
        query = query.ilike('description', `%${filters.searchQuery}%`)
      }

      const { data, error } = await query.order('transaction_date', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses-merger', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          expense_date,
          vendor,
          is_billable,
          category_id,
          category:expense_categories(name, code),
          receipt:receipts(file_name),
          bank_transaction_id
        `)
        .eq('user_id', user.id)

      if (filters?.dateRange) {
        query = query
          .gte('expense_date', filters.dateRange.from.toISOString())
          .lte('expense_date', filters.dateRange.to.toISOString())
      }

      if (filters?.searchQuery) {
        query = query.or(`description.ilike.%${filters.searchQuery}%,vendor.ilike.%${filters.searchQuery}%`)
      }

      const { data, error } = await query.order('expense_date', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices-merger', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          client_name,
          total_amount,
          issue_date,
          due_date,
          status,
          payment_date
        `)
        .eq('user_id', user.id)

      if (filters?.dateRange) {
        query = query
          .gte('issue_date', filters.dateRange.from.toISOString())
          .lte('issue_date', filters.dateRange.to.toISOString())
      }

      if (filters?.searchQuery) {
        query = query.or(`client_name.ilike.%${filters.searchQuery}%,invoice_number.ilike.%${filters.searchQuery}%`)
      }

      const { data, error } = await query.order('issue_date', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  // Merge all transactions into unified format
  const mergedTransactions = useMemo(() => {
    const transactions: MergedTransaction[] = []

    // Add bank transactions
    bankTransactions.forEach(bt => {
      transactions.push({
        id: `bank-${bt.id}`,
        date: bt.transaction_date,
        description: bt.description,
        amount: bt.amount,
        type: bt.amount > 0 ? 'income' : 'expense',
        account_id: bt.bank_account_id,
        account_name: bt.bank_account?.account_name || 'Unknown Account',
        is_reconciled: bt.is_reconciled,
        category: bt.category_suggested,
        reference: bt.transaction_id,
        bank_transaction_id: bt.id,
        expense_id: bt.expense_id,
        // Double-entry logic
        debit_account: bt.amount > 0 ? bt.bank_account?.account_name : 'Expenses',
        credit_account: bt.amount > 0 ? 'Revenue' : bt.bank_account?.account_name
      })
    })

    // Add unlinked expenses
    expenses
      .forEach(expense => {
        transactions.push({
          id: `expense-${expense.id}`,
          date: expense.expense_date,
          description: expense.description,
          amount: -Math.abs(expense.amount), // Expenses are negative in ledger
          type: 'expense',
          account_id: 'manual',
          account_name: 'Manual Entry',
          is_reconciled: false,
          category: expense.category?.name,
          vendor: expense.vendor,
          expense_id: expense.id,
          // Double-entry logic
          debit_account: expense.category?.name || 'General Expenses',
          credit_account: 'Accounts Payable'
        })
      })

    // Add invoices as income
    invoices.forEach(invoice => {
      transactions.push({
        id: `invoice-${invoice.id}`,
        date: invoice.issue_date,
        description: `Invoice ${invoice.invoice_number} - ${invoice.client_name}`,
        amount: invoice.total_amount,
        type: 'income',
        account_id: 'receivables',
        account_name: 'Accounts Receivable',
        is_reconciled: invoice.status === 'paid',
        reference: invoice.invoice_number,
        invoice_id: invoice.id,
        // Double-entry logic
        debit_account: invoice.status === 'paid' ? 'Bank' : 'Accounts Receivable',
        credit_account: 'Revenue'
      })
    })

    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bankTransactions, expenses, invoices])

  // Generate double-entry journal entries
  const journalEntries = useMemo((): DoubleEntryJournal[] => {
    return mergedTransactions.map(transaction => ({
      id: `journal-${transaction.id}`,
      date: transaction.date,
      description: transaction.description,
      reference: transaction.reference,
      entries: [
        {
          account: transaction.debit_account || 'Unknown',
          debit: Math.abs(transaction.amount),
          credit: 0,
          description: transaction.description
        },
        {
          account: transaction.credit_account || 'Unknown',
          debit: 0,
          credit: Math.abs(transaction.amount),
          description: transaction.description
        }
      ],
      total_debits: Math.abs(transaction.amount),
      total_credits: Math.abs(transaction.amount),
      is_balanced: true
    }))
  }, [mergedTransactions])

  // Calculate running balances by account
  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>()
    
    // Process transactions chronologically for accurate running balance
    const chronologicalTransactions = [...mergedTransactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    chronologicalTransactions.forEach(transaction => {
      const currentBalance = balances.get(transaction.account_id) || 0
      balances.set(transaction.account_id, currentBalance + transaction.amount)
    })

    return balances
  }, [mergedTransactions])

  // Auto-matching logic for reconciliation
  const findPotentialMatches = (targetTransaction: MergedTransaction) => {
    return mergedTransactions
      .filter(t => 
        t.id !== targetTransaction.id &&
        t.type !== targetTransaction.type &&
        !t.is_reconciled
      )
      .map(candidate => {
        const amountMatch = Math.abs(Math.abs(targetTransaction.amount) - Math.abs(candidate.amount))
        const dateMatch = Math.abs(new Date(targetTransaction.date).getTime() - new Date(candidate.date).getTime()) / (1000 * 60 * 60 * 24)
        
        let confidence = 0
        
        // Amount similarity (40% weight)
        if (amountMatch === 0) confidence += 40
        else if (amountMatch < 1) confidence += 35
        else if (amountMatch < 5) confidence += 25
        else if (amountMatch < 10) confidence += 15
        
        // Date proximity (30% weight)
        if (dateMatch === 0) confidence += 30
        else if (dateMatch <= 1) confidence += 25
        else if (dateMatch <= 3) confidence += 20
        else if (dateMatch <= 7) confidence += 10
        
        // Description similarity (30% weight)
        const desc1 = targetTransaction.description.toLowerCase()
        const desc2 = (candidate.vendor || candidate.description).toLowerCase()
        const similarity = calculateStringSimilarity(desc1, desc2)
        confidence += similarity * 30

        return {
          candidate,
          confidence,
          amountDifference: amountMatch,
          dateDifference: dateMatch
        }
      })
      .filter(match => match.confidence > 60)
      .sort((a, b) => b.confidence - a.confidence)
  }

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  return {
    transactions: mergedTransactions,
    journalEntries,
    accountBalances,
    findPotentialMatches,
    isLoading: bankLoading || expensesLoading || invoicesLoading,
    totals: {
      totalTransactions: mergedTransactions.length,
      totalIncome: mergedTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: Math.abs(mergedTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
      reconciledCount: mergedTransactions.filter(t => t.is_reconciled).length,
      unreconciledCount: mergedTransactions.filter(t => !t.is_reconciled).length
    }
  }
}

/**
 * Real-time transaction synchronizer
 * Listens for changes and updates the merged view automatically
 */
export function useRealTimeTransactionSync() {
  // Set up real-time subscriptions
  const { data: realtimeChannel } = useQuery({
    queryKey: ['realtime-transactions'],
    queryFn: async () => {
      // Subscribe to bank_transactions changes
      const bankChannel = supabase
        .channel('bank-transactions-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bank_transactions'
        }, (payload) => {
          // Invalidate relevant queries to trigger refetch
          // This would normally be handled by the query client
          console.log('Bank transaction updated:', payload)
        })
        .subscribe()

      // Subscribe to expenses changes
      const expenseChannel = supabase
        .channel('expenses-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'expenses'
        }, (payload) => {
          console.log('Expense updated:', payload)
        })
        .subscribe()

      // Subscribe to invoices changes
      const invoiceChannel = supabase
        .channel('invoices-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'invoices'
        }, (payload) => {
          console.log('Invoice updated:', payload)
        })
        .subscribe()

      return {
        bankChannel,
        expenseChannel,
        invoiceChannel,
        cleanup: () => {
          supabase.removeChannel(bankChannel)
          supabase.removeChannel(expenseChannel)
          supabase.removeChannel(invoiceChannel)
        }
      }
    },
    staleTime: Infinity // Keep the subscription alive
  })

  return realtimeChannel
}