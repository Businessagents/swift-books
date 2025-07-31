export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number_masked: string | null
          account_type: Database["public"]["Enums"]["bank_account_type"]
          company_id: string | null
          created_at: string
          currency: string | null
          current_balance: number | null
          id: string
          institution_name: string | null
          is_active: boolean
          last_sync_at: string | null
          plaid_access_token_encrypted: string | null
          plaid_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number_masked?: string | null
          account_type: Database["public"]["Enums"]["bank_account_type"]
          company_id?: string | null
          created_at?: string
          currency?: string | null
          current_balance?: number | null
          id?: string
          institution_name?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          plaid_access_token_encrypted?: string | null
          plaid_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number_masked?: string | null
          account_type?: Database["public"]["Enums"]["bank_account_type"]
          company_id?: string | null
          created_at?: string
          currency?: string | null
          current_balance?: number | null
          id?: string
          institution_name?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          plaid_access_token_encrypted?: string | null
          plaid_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_account_id: string
          category_suggested: string | null
          created_at: string
          description: string
          expense_id: string | null
          id: string
          is_reconciled: boolean | null
          reconciled_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_date: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id: string
          category_suggested?: string | null
          created_at?: string
          description: string
          expense_id?: string | null
          id?: string
          is_reconciled?: boolean | null
          reconciled_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_date: string
          transaction_id: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string
          category_suggested?: string | null
          created_at?: string
          description?: string
          expense_id?: string | null
          id?: string
          is_reconciled?: boolean | null
          reconciled_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_date?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          business_number: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          fiscal_year_end: string | null
          gst_hst_number: string | null
          id: string
          industry: string | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          fiscal_year_end?: string | null
          gst_hst_number?: string | null
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_number?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          fiscal_year_end?: string | null
          gst_hst_number?: string | null
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          code: string
          cra_category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          cra_category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          cra_category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          company_id: string | null
          created_at: string
          currency: string | null
          description: string
          expense_date: string
          id: string
          is_billable: boolean | null
          is_personal: boolean | null
          notes: string | null
          payment_method: string | null
          receipt_id: string | null
          reference_number: string | null
          tax_amount: number | null
          tax_code_id: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description: string
          expense_date: string
          id?: string
          is_billable?: boolean | null
          is_personal?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_id?: string | null
          reference_number?: string | null
          tax_amount?: number | null
          tax_code_id?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          expense_date?: string
          id?: string
          is_billable?: boolean | null
          is_personal?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_id?: string | null
          reference_number?: string | null
          tax_amount?: number | null
          tax_code_id?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tax_code_id_fkey"
            columns: ["tax_code_id"]
            isOneToOne: false
            referencedRelation: "tax_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          company_id: string | null
          created_at: string
          currency: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_at: string | null
          payment_instructions: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          terms: string | null
          total_amount: number
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          company_id?: string | null
          created_at?: string
          currency?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          paid_at?: string | null
          payment_instructions?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          company_id?: string | null
          created_at?: string
          currency?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          payment_instructions?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          ai_confidence: number | null
          ai_suggested_category: string | null
          company_id: string | null
          created_at: string
          currency: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          ocr_confidence: number | null
          ocr_text: string | null
          processed_at: string | null
          receipt_date: string | null
          status: Database["public"]["Enums"]["receipt_status"]
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_suggested_category?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          processed_at?: string | null
          receipt_date?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_suggested_category?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          processed_at?: string | null
          receipt_date?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          invoice_id: string
          message: string
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          subject: string
          tone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          invoice_id: string
          message: string
          scheduled_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          subject: string
          tone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string
          message?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          subject?: string
          tone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_codes: {
        Row: {
          code: string
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          name: string
          province: string | null
          rate: number
        }
        Insert: {
          code: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name: string
          province?: string | null
          rate: number
        }
        Update: {
          code?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          name?: string
          province?: string | null
          rate?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bank_account_type: "checking" | "savings" | "credit_card" | "business"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "paid"
        | "overdue"
        | "cancelled"
      receipt_status: "pending" | "processed" | "categorized" | "archived"
      reminder_status: "pending" | "sent" | "delivered" | "failed"
      transaction_status: "pending" | "cleared" | "reconciled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      bank_account_type: ["checking", "savings", "credit_card", "business"],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "overdue",
        "cancelled",
      ],
      receipt_status: ["pending", "processed", "categorized", "archived"],
      reminder_status: ["pending", "sent", "delivered", "failed"],
      transaction_status: ["pending", "cleared", "reconciled"],
    },
  },
} as const
