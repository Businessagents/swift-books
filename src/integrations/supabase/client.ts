// SwiftBooks Enhanced Supabase Client with Security Features
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Use environment variables for production security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://culzdzwipqgeppdhuzij.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bHpkendpcHFnZXBwZGh1emlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDQ5ODEsImV4cCI6MjA2OTIyMDk4MX0.3CM9T_8it12efBqQvT3SOEtQ6qxbTF8RFB95LsgXHxc"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'swiftbooks@1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Security-enhanced client for administrative operations
export const createSecureSupabaseClient = (accessToken?: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'swiftbooks-admin@1.0.0',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    },
  })
}