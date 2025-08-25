export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounting: {
        companies: {
          Row: {
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
            created_at: string
            updated_at: string
            created_by?: string
            updated_by?: string
            is_active: boolean
            last_cra_filing?: string
            compliance_status: 'active' | 'suspended' | 'inactive'
          }
          Insert: {
            id?: string
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
            country?: string
            phone?: string
            email?: string
            website?: string
            gst_hst_number?: string
            qst_number?: string
            payroll_account_number?: string
            created_at?: string
            updated_at?: string
            created_by?: string
            updated_by?: string
            is_active?: boolean
            last_cra_filing?: string
            compliance_status?: 'active' | 'suspended' | 'inactive'
          }
          Update: {
            id?: string
            business_number?: string
            legal_name?: string
            operating_name?: string
            company_type?: 'corporation' | 'partnership' | 'sole_proprietorship' | 'non_profit'
            incorporation_date?: string
            fiscal_year_end?: string
            address_line1?: string
            address_line2?: string
            city?: string
            province?: string
            postal_code?: string
            country?: string
            phone?: string
            email?: string
            website?: string
            gst_hst_number?: string
            qst_number?: string
            payroll_account_number?: string
            created_at?: string
            updated_at?: string
            created_by?: string
            updated_by?: string
            is_active?: boolean
            last_cra_filing?: string
            compliance_status?: 'active' | 'suspended' | 'inactive'
          }
        }
        user_profiles: {
          Row: {
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
            created_at: string
            updated_at: string
            last_login?: string
            is_active: boolean
            cra_authorized: boolean
            authorization_level: 'basic' | 'intermediate' | 'full'
          }
          Insert: {
            id?: string
            user_id: string
            company_id: string
            role: 'owner' | 'admin' | 'accountant' | 'bookkeeper' | 'readonly'
            first_name: string
            last_name: string
            display_name?: string
            job_title?: string
            phone?: string
            email: string
            can_approve_transactions?: boolean
            can_generate_reports?: boolean
            can_manage_users?: boolean
            can_export_data?: boolean
            created_at?: string
            updated_at?: string
            last_login?: string
            is_active?: boolean
            cra_authorized?: boolean
            authorization_level?: 'basic' | 'intermediate' | 'full'
          }
          Update: {
            id?: string
            user_id?: string
            company_id?: string
            role?: 'owner' | 'admin' | 'accountant' | 'bookkeeper' | 'readonly'
            first_name?: string
            last_name?: string
            display_name?: string
            job_title?: string
            phone?: string
            email?: string
            can_approve_transactions?: boolean
            can_generate_reports?: boolean
            can_manage_users?: boolean
            can_export_data?: boolean
            created_at?: string
            updated_at?: string
            last_login?: string
            is_active?: boolean
            cra_authorized?: boolean
            authorization_level?: 'basic' | 'intermediate' | 'full'
          }
        }
        accounts: {
          Row: {
            id: string
            company_id: string
            account_code: string
            account_name: string
            account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
            account_subtype?: string
            parent_account_id?: string
            account_level: number
            is_header: boolean
            cra_account_code?: string
            gifi_code?: string
            normal_balance: 'debit' | 'credit'
            is_bank_account: boolean
            is_tax_account: boolean
            current_balance: number
            created_at: string
            updated_at: string
            created_by?: string
            updated_by?: string
            is_active: boolean
          }
          Insert: {
            id?: string
            company_id: string
            account_code: string
            account_name: string
            account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
            account_subtype?: string
            parent_account_id?: string
            account_level?: number
            is_header?: boolean
            cra_account_code?: string
            gifi_code?: string
            normal_balance: 'debit' | 'credit'
            is_bank_account?: boolean
            is_tax_account?: boolean
            current_balance?: number
            created_at?: string
            updated_at?: string
            created_by?: string
            updated_by?: string
            is_active?: boolean
          }
          Update: {
            id?: string
            company_id?: string
            account_code?: string
            account_name?: string
            account_type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
            account_subtype?: string
            parent_account_id?: string
            account_level?: number
            is_header?: boolean
            cra_account_code?: string
            gifi_code?: string
            normal_balance?: 'debit' | 'credit'
            is_bank_account?: boolean
            is_tax_account?: boolean
            current_balance?: number
            created_at?: string
            updated_at?: string
            created_by?: string
            updated_by?: string
            is_active?: boolean
          }
        }
        transactions: {
          Row: {
            id: string
            company_id: string
            transaction_number: string
            transaction_type: 'journal_entry' | 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment'
            transaction_date: string
            posting_date: string
            reference_number?: string
            description: string
            memo?: string
            total_amount: number
            status: 'draft' | 'pending' | 'approved' | 'posted' | 'voided'
            approved_by?: string
            approved_at?: string
            attachment_count: number
            document_references?: Json
            affects_gst: boolean
            gst_amount: number
            affects_qst: boolean
            qst_amount: number
            created_at: string
            updated_at: string
            created_by?: string
            updated_by?: string
            is_reconciled: boolean
            reconciled_date?: string
            reconciled_by?: string
          }
          Insert: {
            id?: string
            company_id: string
            transaction_number: string
            transaction_type: 'journal_entry' | 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment'
            transaction_date: string
            posting_date?: string
            reference_number?: string
            description: string
            memo?: string
            total_amount: number
            status?: 'draft' | 'pending' | 'approved' | 'posted' | 'voided'
            approved_by?: string
            approved_at?: string
            attachment_count?: number
            document_references?: Json
            affects_gst?: boolean
            gst_amount?: number
            affects_qst?: boolean
            qst_amount?: number
            created_at?: string
            updated_at?: string
            created_by?: string
            updated_by?: string
            is_reconciled?: boolean
            reconciled_date?: string
            reconciled_by?: string
          }
          Update: {
            id?: string
            company_id?: string
            transaction_number?: string
            transaction_type?: 'journal_entry' | 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment'
            transaction_date?: string
            posting_date?: string
            reference_number?: string
            description?: string
            memo?: string
            total_amount?: number
            status?: 'draft' | 'pending' | 'approved' | 'posted' | 'voided'
            approved_by?: string
            approved_at?: string
            attachment_count?: number
            document_references?: Json
            affects_gst?: boolean
            gst_amount?: number
            affects_qst?: boolean
            qst_amount?: number
            created_at?: string
            updated_at?: string
            created_by?: string
            updated_by?: string
            is_reconciled?: boolean
            reconciled_date?: string
            reconciled_by?: string
          }
        }
        transaction_lines: {
          Row: {
            id: string
            transaction_id: string
            company_id: string
            account_id: string
            line_number: number
            description?: string
            reference?: string
            debit_amount: number
            credit_amount: number
            tax_code?: string
            tax_rate: number
            tax_amount: number
            department?: string
            project_code?: string
            customer_id?: string
            vendor_id?: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            transaction_id: string
            company_id: string
            account_id: string
            line_number: number
            description?: string
            reference?: string
            debit_amount?: number
            credit_amount?: number
            tax_code?: string
            tax_rate?: number
            tax_amount?: number
            department?: string
            project_code?: string
            customer_id?: string
            vendor_id?: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            transaction_id?: string
            company_id?: string
            account_id?: string
            line_number?: number
            description?: string
            reference?: string
            debit_amount?: number
            credit_amount?: number
            tax_code?: string
            tax_rate?: number
            tax_amount?: number
            department?: string
            project_code?: string
            customer_id?: string
            vendor_id?: string
            created_at?: string
            updated_at?: string
          }
        }
      }
      compliance: {
        canadian_tax_codes: {
          Row: {
            id: string
            code: string
            description: string
            tax_type: 'GST' | 'HST' | 'QST' | 'PST'
            province?: string
            rate: number
            effective_date: string
            expiry_date?: string
            created_at: string
            updated_at: string
            is_active: boolean
          }
          Insert: {
            id?: string
            code: string
            description: string
            tax_type: 'GST' | 'HST' | 'QST' | 'PST'
            province?: string
            rate: number
            effective_date: string
            expiry_date?: string
            created_at?: string
            updated_at?: string
            is_active?: boolean
          }
          Update: {
            id?: string
            code?: string
            description?: string
            tax_type?: 'GST' | 'HST' | 'QST' | 'PST'
            province?: string
            rate?: number
            effective_date?: string
            expiry_date?: string
            created_at?: string
            updated_at?: string
            is_active?: boolean
          }
        }
      }
      audit: {
        financial_audit_trail: {
          Row: {
            id: string
            company_id: string
            user_id: string
            table_name: string
            operation: 'INSERT' | 'UPDATE' | 'DELETE'
            record_id: string
            old_values?: Json
            new_values?: Json
            changed_fields?: string[]
            transaction_id?: string
            session_id?: string
            ip_address?: string
            user_agent?: string
            compliance_reason?: string
            canadian_compliance_flags?: Json
            retention_period?: string
            created_at: string
          }
          Insert: {
            id?: string
            company_id: string
            user_id: string
            table_name: string
            operation: 'INSERT' | 'UPDATE' | 'DELETE'
            record_id: string
            old_values?: Json
            new_values?: Json
            changed_fields?: string[]
            transaction_id?: string
            session_id?: string
            ip_address?: string
            user_agent?: string
            compliance_reason?: string
            canadian_compliance_flags?: Json
            retention_period?: string
            created_at?: string
          }
          Update: {
            id?: string
            company_id?: string
            user_id?: string
            table_name?: string
            operation?: 'INSERT' | 'UPDATE' | 'DELETE'
            record_id?: string
            old_values?: Json
            new_values?: Json
            changed_fields?: string[]
            transaction_id?: string
            session_id?: string
            ip_address?: string
            user_agent?: string
            compliance_reason?: string
            canadian_compliance_flags?: Json
            retention_period?: string
            created_at?: string
          }
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_canadian_taxes: {
        Args: {
          base_amount: number
          province_code: string
        }
        Returns: {
          gst: number
          hst: number
          pst: number
          qst: number
          total: number
        }
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_role: {
        Args: {
          required_role: string
        }
        Returns: boolean
      }
      user_can_approve_transactions: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
