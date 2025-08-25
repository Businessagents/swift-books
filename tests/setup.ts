import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}))

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

// Security testing utilities
export const mockSecurityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export const mockCanadianTaxRates = {
  gst: 0.05,
  hst_ontario: 0.13,
  hst_atlantic: 0.15,
  qst: 0.09975,
  pst_bc: 0.07,
  pst_saskatchewan: 0.06,
  pst_manitoba: 0.07,
}

// Mock user profiles for testing
export const mockUserProfiles = {
  owner: {
    id: 'test-owner-id',
    role: 'owner',
    can_approve_transactions: true,
    can_generate_reports: true,
    can_manage_users: true,
    can_export_data: true,
    cra_authorized: true,
    authorization_level: 'full',
  },
  accountant: {
    id: 'test-accountant-id',
    role: 'accountant',
    can_approve_transactions: true,
    can_generate_reports: true,
    can_manage_users: false,
    can_export_data: true,
    cra_authorized: true,
    authorization_level: 'intermediate',
  },
  readonly: {
    id: 'test-readonly-id',
    role: 'readonly',
    can_approve_transactions: false,
    can_generate_reports: false,
    can_manage_users: false,
    can_export_data: false,
    cra_authorized: false,
    authorization_level: 'basic',
  },
}
