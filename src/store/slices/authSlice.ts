import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  userProfile: UserProfile | null
}

interface UserProfile {
  id: string
  user_id: string
  company_id: string
  role: 'owner' | 'admin' | 'accountant' | 'bookkeeper' | 'readonly'
  first_name: string
  last_name: string
  display_name?: string
  job_title?: string
  phone?: string
  email: string
  can_approve_transactions: boolean
  can_generate_reports: boolean
  can_manage_users: boolean
  can_export_data: boolean
  is_active: boolean
  cra_authorized: boolean
  authorization_level: 'basic' | 'intermediate' | 'full'
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  userProfile: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.loading = false
      state.error = null
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.session = null
      state.userProfile = null
      state.error = null
    },
  },
})

export const { setUser, setSession, setUserProfile, setLoading, setError, logout } = authSlice.actions
export default authSlice.reducer
export type { UserProfile }
