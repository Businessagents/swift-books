-- Add status field to expenses table for approval workflow
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add enhanced tracking fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_status ON expenses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

-- Add GST/HST reporting helper views
CREATE OR REPLACE VIEW user_tax_summary AS
SELECT 
    user_id,
    DATE_TRUNC('quarter', expense_date) as quarter,
    DATE_TRUNC('month', expense_date) as month,
    DATE_TRUNC('year', expense_date) as year,
    SUM(amount - tax_amount) as subtotal_expenses,
    SUM(tax_amount) as tax_paid,
    SUM(amount) as total_expenses,
    COUNT(*) as expense_count
FROM expenses
WHERE status = 'approved'
GROUP BY user_id, DATE_TRUNC('quarter', expense_date), DATE_TRUNC('month', expense_date), DATE_TRUNC('year', expense_date);

CREATE OR REPLACE VIEW user_sales_summary AS
SELECT 
    user_id,
    DATE_TRUNC('quarter', issue_date) as quarter,
    DATE_TRUNC('month', issue_date) as month,
    DATE_TRUNC('year', issue_date) as year,
    SUM(subtotal) as subtotal_sales,
    SUM(tax_amount) as tax_collected,
    SUM(total_amount) as total_sales,
    COUNT(*) as invoice_count
FROM invoices
WHERE status IN ('sent', 'viewed', 'paid')
GROUP BY user_id, DATE_TRUNC('quarter', issue_date), DATE_TRUNC('month', issue_date), DATE_TRUNC('year', issue_date);

-- Grant access to views
GRANT SELECT ON user_tax_summary TO authenticated;
GRANT SELECT ON user_sales_summary TO authenticated;

-- Add RLS to views
ALTER VIEW user_tax_summary ENABLE ROW LEVEL SECURITY;
ALTER VIEW user_sales_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax summary" ON user_tax_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sales summary" ON user_sales_summary
    FOR SELECT USING (auth.uid() = user_id);
