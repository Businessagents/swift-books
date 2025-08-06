-- ============================================================================
-- EDGE FUNCTIONS SCHEMA FIXES FOR SWIFT-BOOKS
-- Date: 2025-08-06 15:00:00
-- Purpose: Fix all schema issues discovered during Edge Functions audit
-- ============================================================================

-- ============================================================================
-- PHASE 1: ADD MISSING COLUMNS FOR EDGE FUNCTIONS
-- ============================================================================

-- Add processed_at column to receipts table for OCR tracking
-- This is used by process-receipt-ocr function but was missing from schema
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add AI tracking columns to receipts table
-- These are used by process-receipt-ocr function for AI categorization
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS ai_suggested_category TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(5,2);

-- Add reminder tracking columns to invoices (some may already exist from other migrations)
-- These are used by send-invoice and payment reminder functions
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- ============================================================================
-- PHASE 2: UPDATE RECEIPT STATUS ENUM
-- ============================================================================

-- Add missing status values that are used by Edge Functions
-- process-receipt-ocr function uses 'processing' and 'failed' statuses
DO $$ 
BEGIN
    -- Add 'processing' status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'processing' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'receipt_status')
    ) THEN
        ALTER TYPE public.receipt_status ADD VALUE 'processing';
    END IF;
    
    -- Add 'failed' status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'failed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'receipt_status')
    ) THEN
        ALTER TYPE public.receipt_status ADD VALUE 'failed';
    END IF;
END $$;

-- ============================================================================
-- PHASE 3: CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Add indexes for common queries used by Edge Functions
CREATE INDEX IF NOT EXISTS idx_receipts_status_processed ON public.receipts(status, processed_at) 
WHERE status IN ('processing', 'processed', 'failed');

CREATE INDEX IF NOT EXISTS idx_receipts_ai_category ON public.receipts(ai_suggested_category) 
WHERE ai_suggested_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_reminder_tracking ON public.invoices(reminder_count, reminder_sent_at);

-- Add index for expense categories join used by ai-business-insights function
CREATE INDEX IF NOT EXISTS idx_expenses_category_lookup ON public.expenses(category_id, user_id);

-- ============================================================================
-- PHASE 4: UPDATE RLS POLICIES FOR EDGE FUNCTIONS
-- ============================================================================

-- Update receipts policies to handle new columns
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
CREATE POLICY "Users can update their own receipts" ON public.receipts
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Ensure reminders table has proper RLS policies
DROP POLICY IF EXISTS "Users can view own reminders" ON public.reminders;
CREATE POLICY "Users can view own reminders" ON public.reminders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reminders" ON public.reminders;
CREATE POLICY "Users can insert own reminders" ON public.reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PHASE 5: STORAGE BUCKET POLICIES
-- ============================================================================

-- Ensure receipts storage bucket has proper policies for thumbnail generation
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload receipts
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for authenticated users to view their own receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for service role to create thumbnails
DROP POLICY IF EXISTS "Service can create thumbnails" ON storage.objects;
CREATE POLICY "Service can create thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND 
    (storage.foldername(name))[1] = 'thumbnails'
);

-- ============================================================================
-- PHASE 6: HELPER FUNCTIONS FOR EDGE FUNCTIONS
-- ============================================================================

-- Function to safely update receipt OCR data (used by process-receipt-ocr)
CREATE OR REPLACE FUNCTION public.update_receipt_ocr_data(
    _receipt_id UUID,
    _ocr_text TEXT,
    _ocr_confidence DECIMAL(5,2),
    _vendor_name TEXT,
    _total_amount DECIMAL(12,2),
    _tax_amount DECIMAL(12,2),
    _receipt_date DATE,
    _ai_category TEXT,
    _ai_confidence DECIMAL(5,2)
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.receipts SET
        status = 'processed',
        ocr_text = _ocr_text,
        ocr_confidence = _ocr_confidence,
        vendor_name = _vendor_name,
        total_amount = _total_amount,
        tax_amount = _tax_amount,
        receipt_date = _receipt_date,
        ai_suggested_category = _ai_category,
        ai_confidence = _ai_confidence,
        processed_at = NOW()
    WHERE id = _receipt_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_receipt_ocr_data TO authenticated;

-- Function to get expense data with categories (used by ai-business-insights)
CREATE OR REPLACE FUNCTION public.get_expense_summary_with_categories(
    _user_id UUID DEFAULT auth.uid(),
    _limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    amount DECIMAL(12,2),
    description TEXT,
    expense_date DATE,
    tax_amount DECIMAL(12,2),
    category_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.amount,
        e.description,
        e.expense_date,
        e.tax_amount,
        COALESCE(ec.name, 'Uncategorized') as category_name
    FROM public.expenses e
    LEFT JOIN public.expense_categories ec ON e.category_id = ec.id
    WHERE e.user_id = _user_id
    ORDER BY e.expense_date DESC
    LIMIT _limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_expense_summary_with_categories TO authenticated;

-- ============================================================================
-- PHASE 7: AUDIT LOG IMPROVEMENTS
-- ============================================================================

-- Add trigger to log receipt OCR processing
DROP TRIGGER IF EXISTS audit_receipt_ocr_processing ON public.receipts;
CREATE TRIGGER audit_receipt_ocr_processing
    AFTER UPDATE OF status, ocr_text, ai_suggested_category ON public.receipts
    FOR EACH ROW 
    WHEN (NEW.status = 'processed' OR NEW.status = 'failed')
    EXECUTE FUNCTION public.log_audit_event();

-- Add trigger to log invoice reminder sending
DROP TRIGGER IF EXISTS audit_invoice_reminders ON public.invoices;
CREATE TRIGGER audit_invoice_reminders
    AFTER UPDATE OF reminder_count, reminder_sent_at ON public.invoices
    FOR EACH ROW 
    WHEN (NEW.reminder_count > OLD.reminder_count)
    EXECUTE FUNCTION public.log_audit_event();

-- ============================================================================
-- PHASE 8: DATA VALIDATION AND CLEANUP
-- ============================================================================

-- Set default values for existing records
UPDATE public.receipts 
SET processed_at = updated_at 
WHERE status = 'processed' AND processed_at IS NULL;

-- Set reminder count to 0 for existing invoices if NULL
UPDATE public.invoices 
SET reminder_count = 0 
WHERE reminder_count IS NULL;

-- ============================================================================
-- PHASE 9: CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Add constraints to ensure data integrity
ALTER TABLE public.receipts 
ADD CONSTRAINT chk_ocr_confidence_range 
CHECK (ocr_confidence IS NULL OR (ocr_confidence >= 0 AND ocr_confidence <= 1));

ALTER TABLE public.receipts 
ADD CONSTRAINT chk_ai_confidence_range 
CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1));

ALTER TABLE public.invoices 
ADD CONSTRAINT chk_reminder_count_positive 
CHECK (reminder_count >= 0);

-- ============================================================================
-- PHASE 10: PERFORMANCE MONITORING
-- ============================================================================

-- View for monitoring OCR processing performance
CREATE OR REPLACE VIEW public.ocr_processing_stats AS
SELECT 
    status,
    COUNT(*) as receipt_count,
    AVG(ocr_confidence) as avg_confidence,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/60) as avg_processing_minutes,
    COUNT(CASE WHEN ai_suggested_category IS NOT NULL THEN 1 END) as ai_categorized_count
FROM public.receipts 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status;

-- Grant access to the view
GRANT SELECT ON public.ocr_processing_stats TO authenticated;

-- ============================================================================
-- VERIFICATION AND TESTING QUERIES
-- ============================================================================

-- These queries can be used to verify the migration was successful
/*
-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'receipts' 
AND table_schema = 'public'
AND column_name IN ('processed_at', 'ai_suggested_category', 'ai_confidence');

-- Check receipt status enum values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'receipt_status')
ORDER BY enumlabel;

-- Test new helper functions
SELECT * FROM public.get_expense_summary_with_categories() LIMIT 5;

-- Check OCR stats view
SELECT * FROM public.ocr_processing_stats;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
INSERT INTO public.audit_logs (table_name, action, new_values) 
VALUES ('migration', 'EDGE_FUNCTIONS_FIX', jsonb_build_object(
    'migration_name', '20250806150000_fix_edge_functions_schema',
    'completed_at', NOW(),
    'description', 'Fixed all schema issues for Edge Functions compatibility'
));