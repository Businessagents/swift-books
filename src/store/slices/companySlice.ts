import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

interface Company {
  id: string
  business_number?: string
  legal_name: string
  operating_name?: string
  company_type: 'corporation' | 'partnership' | 'sole_proprietorship' | 'non_profit'
  incorporation_date?: string
  fiscal_year_end: string
  address_line1: string
  address_line2?: string
  city: string
  province: string
  postal_code: string
  country: string
  phone?: string
  email?: string
  website?: string
  gst_hst_number?: string
  qst_number?: string
  payroll_account_number?: string
  is_active: boolean
  compliance_status: 'active' | 'suspended' | 'inactive'
  last_cra_filing?: string
  name: string // Add alias for compatibility
}

interface CompanyState {
  currentCompany: Company | null
  companies: Company[]
  loading: boolean
  error: string | null
}

const initialState: CompanyState = {
  currentCompany: null,
  companies: [],
  loading: false,
  error: null,
}

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
      state.currentCompany = action.payload
    },
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload
    },
    addCompany: (state, action: PayloadAction<Company>) => {
      state.companies.push(action.payload)
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.companies[index] = action.payload
      }
      if (state.currentCompany?.id === action.payload.id) {
        state.currentCompany = action.payload
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { 
  setCurrentCompany, 
  setCompanies, 
  addCompany, 
  updateCompany, 
  setLoading, 
  setError 
} = companySlice.actions

// Selectors
export const selectCurrentCompany = (state: RootState) => state.company.currentCompany
export const selectCompanies = (state: RootState) => state.company.companies
export const selectCompanyLoading = (state: RootState) => state.company.loading
export const selectCompanyError = (state: RootState) => state.company.error

export default companySlice.reducer
export type { Company }
