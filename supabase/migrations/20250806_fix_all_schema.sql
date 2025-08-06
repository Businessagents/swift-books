-- ============================================================================
-- COMPREHENSIVE SCHEMA FIXES FOR SWIFT-BOOKS
-- Date: 2025-08-06
-- Purpose: Fix all database schema mismatches identified in codebase audit
-- ============================================================================

-- ============================================================================
-- PHASE 1: CRITICAL SCHEMA FIXES
-- ============================================================================

-- Fix 1: Add missing bank_transaction_id column to expenses table
-- This column is referenced in reconciliation and transaction merger components
-- Files: ledger/reconciliation-dialog.tsx, ledger/transaction-merger.tsx, ledger/ledger-table.tsx
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES public.bank_transactions(id) ON DELETE SET NULL;

-- Fix 2: Add status column to expenses table for approval workflow
-- Code references status values: 'pending', 'approved', 'rejected'
DO $$ 
BEGIN
    -- Create expense status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_status') THEN
        CREATE TYPE public.expense_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS status public.expense_status DEFAULT 'pending';

-- Fix 3: Add approval workflow columns to expenses table
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Fix 4: Update receipt_status enum to include missing values
-- Code uses: 'processing', 'failed' but they're missing from enum
-- Files: pages/Receipts.tsx, receipt-upload-enhanced.tsx, process-receipt-ocr/index.ts
ALTER TYPE public.receipt_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE public.receipt_status ADD VALUE IF NOT EXISTS 'failed';

-- Fix 5: Add missing invoice tracking columns that are referenced in code
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Fix 6: Ensure all foreign key constraints are properly set
-- Update expenses table to link to bank transactions
CREATE INDEX IF NOT EXISTS idx_expenses_bank_transaction_id ON public.expenses(bank_transaction_id);

-- ============================================================================
-- PHASE 2: PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================================

-- Add performance indexes for new columns
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_status ON public.expenses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by ON public.expenses(approved_by);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date_status ON public.expenses(expense_date, status);

-- Add composite indexes for common query patterns found in codebase
CREATE INDEX IF NOT EXISTS idx_invoices_user_status_due ON public.invoices(user_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_receipts_user_status_date ON public.receipts(user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_status ON public.bank_transactions(bank_account_id, status);

-- Add indexes for reconciliation queries (heavily used in ledger components)
CREATE INDEX IF NOT EXISTS idx_expenses_reconciliation ON public.expenses(user_id, bank_transaction_id) WHERE bank_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_unreconciled ON public.bank_transactions(user_id, is_reconciled, transaction_date) WHERE is_reconciled = false;

-- Add indexes for receipt processing queries
CREATE INDEX IF NOT EXISTS idx_receipts_processing_status ON public.receipts(status, created_at) WHERE status IN ('processing', 'failed');
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_lookup ON public.receipts(vendor_name, user_id) WHERE vendor_name IS NOT NULL;

-- ============================================================================
-- PHASE 3: UPDATED RLS POLICIES
-- ============================================================================

-- Update expenses policies to handle new status and approval workflow
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = approved_by
    );

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (
        (auth.uid() = user_id AND status = 'pending') OR
        (public.has_role(auth.uid(), 'admin'))
    );

DROP POLICY IF EXISTS "Users can manage their own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add policy for expense approval workflow
CREATE POLICY "Admins can approve expenses" ON public.expenses
    FOR UPDATE USING (
        public.has_role(auth.uid(), 'admin') AND 
        status IN ('pending', 'approved', 'rejected')
    );

-- Update invoice policies for reminder tracking
DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- ============================================================================
-- PHASE 4: HELPER VIEWS FOR REPORTING
-- ============================================================================

-- Enhanced expense reporting view with approval status
CREATE OR REPLACE VIEW public.expense_summary_with_approval AS
SELECT 
    e.user_id,
    e.status,
    DATE_TRUNC('month', e.expense_date) as expense_month,
    DATE_TRUNC('quarter', e.expense_date) as expense_quarter,
    DATE_TRUNC('year', e.expense_date) as expense_year,
    COUNT(*) as expense_count,
    SUM(e.amount) as total_amount,
    SUM(e.tax_amount) as total_tax,
    SUM(CASE WHEN e.is_billable THEN e.amount ELSE 0 END) as billable_amount,
    COUNT(CASE WHEN e.bank_transaction_id IS NOT NULL THEN 1 END) as reconciled_count,
    ec.name as category_name,
    ec.cra_category
FROM public.expenses e
LEFT JOIN public.expense_categories ec ON e.category_id = ec.id
GROUP BY e.user_id, e.status, DATE_TRUNC('month', e.expense_date), 
         DATE_TRUNC('quarter', e.expense_date), DATE_TRUNC('year', e.expense_date),
         ec.name, ec.cra_category;

-- Reconciliation status view
CREATE OR REPLACE VIEW public.reconciliation_status AS
SELECT 
    e.user_id,
    COUNT(*) as total_expenses,
    COUNT(e.bank_transaction_id) as reconciled_expenses,
    COUNT(*) - COUNT(e.bank_transaction_id) as unreconciled_expenses,
    ROUND((COUNT(e.bank_transaction_id)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2) as reconciliation_percentage,
    SUM(e.amount) as total_amount,
    SUM(CASE WHEN e.bank_transaction_id IS NOT NULL THEN e.amount ELSE 0 END) as reconciled_amount
FROM public.expenses e
WHERE e.expense_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY e.user_id;

-- Receipt processing status view
CREATE OR REPLACE VIEW public.receipt_processing_summary AS
SELECT 
    r.user_id,
    COUNT(*) as total_receipts,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_receipts,
    COUNT(CASE WHEN r.status = 'processing' THEN 1 END) as processing_receipts,
    COUNT(CASE WHEN r.status = 'processed' THEN 1 END) as processed_receipts,
    COUNT(CASE WHEN r.status = 'failed' THEN 1 END) as failed_receipts,
    COUNT(CASE WHEN r.status = 'categorized' THEN 1 END) as categorized_receipts,
    AVG(CASE WHEN r.ai_confidence IS NOT NULL THEN r.ai_confidence END) as avg_ai_confidence,
    AVG(CASE WHEN r.ocr_confidence IS NOT NULL THEN r.ocr_confidence END) as avg_ocr_confidence
FROM public.receipts r
GROUP BY r.user_id;

-- Grant permissions on views
GRANT SELECT ON public.expense_summary_with_approval TO authenticated;
GRANT SELECT ON public.reconciliation_status TO authenticated;
GRANT SELECT ON public.receipt_processing_summary TO authenticated;

-- Enable RLS on views
ALTER VIEW public.expense_summary_with_approval ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.reconciliation_status ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.receipt_processing_summary ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for views
CREATE POLICY "Users can view own expense summary" ON public.expense_summary_with_approval
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reconciliation status" ON public.reconciliation_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own receipt processing summary" ON public.receipt_processing_summary
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 5: TRIGGERS AND AUDIT UPDATES
-- ============================================================================

-- Add audit trigger for expenses status changes
DROP TRIGGER IF EXISTS audit_expenses_status_changes ON public.expenses;
CREATE TRIGGER audit_expenses_status_changes
    AFTER UPDATE OF status, approved_by, approved_at ON public.expenses
    FOR EACH ROW 
    WHEN (OLD.status IS DISTINCT FROM NEW.status OR 
          OLD.approved_by IS DISTINCT FROM NEW.approved_by)
    EXECUTE FUNCTION public.log_audit_event();

-- Add trigger to automatically set approval timestamp
CREATE OR REPLACE FUNCTION public.update_expense_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Set approved_at when status changes to approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.approved_at = NOW();
        NEW.approved_by = COALESCE(NEW.approved_by, auth.uid());
    END IF;
    
    -- Clear approval fields when status changes to pending
    IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
        NEW.approved_at = NULL;
        NEW.approved_by = NULL;
        NEW.rejection_reason = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER expense_approval_timestamp
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_expense_approval_timestamp();

-- ============================================================================
-- PHASE 6: DATA MIGRATION FOR EXISTING RECORDS
-- ============================================================================

-- Set default status for existing expenses (safe default)
UPDATE public.expenses 
SET status = 'pending'
WHERE status IS NULL;

-- Update existing receipts that might have invalid status
UPDATE public.receipts 
SET status = 'pending'
WHERE status NOT IN ('pending', 'processing', 'processed', 'categorized', 'failed', 'archived');

-- ============================================================================
-- PHASE 7: CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Add constraints to ensure data integrity
ALTER TABLE public.expenses 
ADD CONSTRAINT chk_expense_approval_logic 
CHECK (
    (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
    (status = 'rejected' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
    (status = 'pending')
);

-- Add constraint to ensure bank transaction reconciliation is one-to-one
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_unique_bank_transaction 
ON public.expenses(bank_transaction_id) 
WHERE bank_transaction_id IS NOT NULL;

-- ============================================================================
-- PHASE 8: PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to check reconciliation health
CREATE OR REPLACE FUNCTION public.get_reconciliation_health(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    total_expenses INTEGER,
    reconciled_expenses INTEGER,
    unreconciled_expenses INTEGER,
    reconciliation_percentage DECIMAL,
    oldest_unreconciled_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_expenses,
        COUNT(e.bank_transaction_id)::INTEGER as reconciled_expenses,
        (COUNT(*) - COUNT(e.bank_transaction_id))::INTEGER as unreconciled_expenses,
        ROUND((COUNT(e.bank_transaction_id)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2) as reconciliation_percentage,
        MIN(CASE WHEN e.bank_transaction_id IS NULL THEN e.expense_date END) as oldest_unreconciled_date
    FROM public.expenses e
    WHERE e.user_id = user_uuid
    AND e.expense_date >= CURRENT_DATE - INTERVAL '12 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get receipt processing health
CREATE OR REPLACE FUNCTION public.get_receipt_processing_health(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    total_receipts INTEGER,
    failed_receipts INTEGER,
    processing_receipts INTEGER,
    success_rate DECIMAL,
    avg_confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_receipts,
        COUNT(CASE WHEN r.status = 'failed' THEN 1 END)::INTEGER as failed_receipts,
        COUNT(CASE WHEN r.status = 'processing' THEN 1 END)::INTEGER as processing_receipts,
        ROUND(((COUNT(*) - COUNT(CASE WHEN r.status = 'failed' THEN 1 END))::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2) as success_rate,
        ROUND(AVG(CASE WHEN r.ai_confidence IS NOT NULL THEN r.ai_confidence END), 2) as avg_confidence
    FROM public.receipts r
    WHERE r.user_id = user_uuid
    AND r.created_at >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_reconciliation_health TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_receipt_processing_health TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (FOR TESTING)
-- ============================================================================

-- These queries can be used to verify the migration was successful
/*
-- Verify new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'expenses' 
AND table_schema = 'public'
AND column_name IN ('bank_transaction_id', 'status', 'approved_by', 'approved_at', 'rejection_reason');

-- Verify enum values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'expense_status')
ORDER BY enumsortorder;

SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'receipt_status')
ORDER BY enumsortorder;

-- Verify indexes exist
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'expenses' 
AND indexname LIKE 'idx_expenses_%'
ORDER BY indexname;

-- Test reconciliation function
SELECT * FROM public.get_reconciliation_health();

-- Test receipt processing function  
SELECT * FROM public.get_receipt_processing_health();

-- Verify foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'expenses';
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
INSERT INTO public.audit_logs (table_name, action, new_values, user_id) 
VALUES ('migration', 'SCHEMA_FIX_COMPLETE', jsonb_build_object(
    'migration_name', '20250806_fix_all_schema',
    'completed_at', NOW(),
    'description', 'Comprehensive schema fixes for Swift-Books database',
    'fixes_applied', jsonb_build_array(
        'Added expenses.bank_transaction_id column with foreign key',
        'Added expenses.status column with expense_status enum',
        'Added approval workflow columns to expenses',
        'Added processing and failed values to receipt_status enum',
        'Added invoice reminder tracking columns',
        'Created comprehensive performance indexes',
        'Updated RLS policies for new columns',
        'Added helper views for reporting',
        'Added audit triggers and data validation',
        'Added monitoring functions for health checks'
    )
), auth.uid());

-- Update schema version (if you have a version tracking table)
-- INSERT INTO public.schema_versions (version, applied_at) VALUES ('20250806_fix_all_schema', NOW());

COMMENT ON MIGRATION IS 'Fixed all database schema mismatches found in Swift-Books codebase audit. Added missing columns, enum values, foreign keys, indexes, and RLS policies to ensure database schema matches application code requirements.';