import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type Company = Tables['accounting']['Row']
type Transaction = Tables['transactions']['Row']
type Account = Tables['accounts']['Row']
type UserProfile = Tables['user_profiles']['Row']

// Canadian Tax Code type
interface CanadianTaxCode {
  id: string
  province_code: string
  tax_type: 'GST' | 'HST' | 'PST' | 'QST'
  rate: number
  is_active: boolean
  effective_date: string
  description?: string
}

// Audit Trail type
interface AuditTrailEntry {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
  user_id: string
  timestamp: string
  company_id: string
}

export const supabaseApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Company', 'Transaction', 'Account', 'UserProfile', 'TaxCode'],
  endpoints: (builder) => ({
    // Company endpoints
    getCompanies: builder.query<Company[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('is_active', true)
        
        if (error) {
          return { error: error.message }
        }
        
        return { data: data || [] }
      },
      providesTags: ['Company'],
    }),

    getCompanyById: builder.query<Company, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    createCompany: builder.mutation<Company, Partial<Company>>({
      queryFn: async (newCompany) => {
        const { data, error } = await supabase
          .from('companies')
          .insert(newCompany)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: ['Company'],
    }),

    updateCompany: builder.mutation<Company, { id: string; updates: Partial<Company> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),

    // User Profile endpoints
    getUserProfile: builder.query<UserProfile, string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      providesTags: (result, error, userId) => [{ type: 'UserProfile', id: userId }],
    }),

    updateUserProfile: builder.mutation<UserProfile, { id: string; updates: Partial<UserProfile> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'UserProfile', id }],
    }),

    // Account endpoints
    getAccounts: builder.query<Account[], string>({
      queryFn: async (companyId) => {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('account_code')
        
        if (error) {
          return { error: error.message }
        }
        
        return { data: data || [] }
      },
      providesTags: ['Account'],
    }),

    createAccount: builder.mutation<Account, Partial<Account>>({
      queryFn: async (newAccount) => {
        const { data, error } = await supabase
          .from('accounts')
          .insert(newAccount)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: ['Account'],
    }),

    updateAccount: builder.mutation<Account, { id: string; updates: Partial<Account> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('accounts')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: ['Account'],
    }),

    // Transaction endpoints
    getTransactions: builder.query<Transaction[], { companyId: string; limit?: number; offset?: number }>({
      queryFn: async ({ companyId, limit = 50, offset = 0 }) => {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_lines (
              *,
              account:accounts (
                account_name,
                account_code
              )
            )
          `)
          .eq('company_id', companyId)
          .order('transaction_date', { ascending: false })
          .range(offset, offset + limit - 1)
        
        if (error) {
          return { error: error.message }
        }
        
        return { data: data || [] }
      },
      providesTags: ['Transaction'],
    }),

    createTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      queryFn: async (newTransaction) => {
        const { data, error } = await supabase
          .from('transactions')
          .insert(newTransaction)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: ['Transaction'],
    }),

    updateTransaction: builder.mutation<Transaction, { id: string; updates: Partial<Transaction> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
      invalidatesTags: ['Transaction'],
    }),

    // Canadian Tax Codes
    getCanadianTaxCodes: builder.query<CanadianTaxCode[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('canadian_tax_codes')
          .select('*')
          .eq('is_active', true)
          .order('province', { ascending: true })
        
        if (error) {
          return { error: error.message }
        }
        
        return { data: data || [] }
      },
      providesTags: ['TaxCode'],
    }),

    // Financial calculations
    calculateGSTHST: builder.mutation<{ gst: number; hst: number; total: number }, { amount: number; province: string }>({
      queryFn: async ({ amount, province }) => {
        const { data, error } = await supabase.rpc('calculate_canadian_taxes', {
          base_amount: amount,
          province_code: province,
        })
        
        if (error) {
          return { error: error.message }
        }
        
        return { data }
      },
    }),

    // Audit trail
    getAuditTrail: builder.query<AuditTrailEntry[], { companyId: string; tableNames?: string[]; limit?: number }>({
      queryFn: async ({ companyId, tableNames, limit = 100 }) => {
        let query = supabase
          .from('financial_audit_trail')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (tableNames && tableNames.length > 0) {
          query = query.in('table_name', tableNames)
        }
        
        const { data, error } = await query
        
        if (error) {
          return { error: error.message }
        }
        
        return { data: data || [] }
      },
    }),
  }),
})

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useGetCanadianTaxCodesQuery,
  useCalculateGSTHSTMutation,
  useGetAuditTrailQuery,
} = supabaseApi
