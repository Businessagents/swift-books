-- Swift-Books MVP Phase 1: Foundation & Database Implementation
-- Core business tables, financial transactions, banking, compliance, and security

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.receipt_status AS ENUM ('pending', 'processed', 'categorized', 'archived');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'delivered', 'failed');
CREATE TYPE public.bank_account_type AS ENUM ('checking', 'savings', 'credit_card', 'business');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'cleared', 'reconciled');

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- User profiles table for extended user information
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'America/Toronto',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Companies table for business profiles
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_number TEXT, -- Canadian Business Number (BN)
    gst_hst_number TEXT, -- GST/HST registration number
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Canada',
    phone TEXT,
    email TEXT,
    website TEXT,
    industry TEXT,
    fiscal_year_end DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- FINANCIAL TRANSACTION TABLES
-- ============================================================================

-- Receipts table for image storage and OCR processing
CREATE TABLE public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    status receipt_status NOT NULL DEFAULT 'pending',
    ocr_text TEXT,
    ocr_confidence DECIMAL(5,2),
    vendor_name TEXT,
    receipt_date DATE,
    total_amount DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    currency TEXT DEFAULT 'CAD',
    ai_suggested_category TEXT,
    ai_confidence DECIMAL(5,2),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expense categories for CRA compliance
CREATE TABLE public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    cra_category TEXT, -- Maps to CRA T2125 categories
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tax codes for GST/HST calculations
CREATE TABLE public.tax_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    rate DECIMAL(5,4) NOT NULL,
    province TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(code, province)
);

-- Expenses table for processed business expenses
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.expense_categories(id),
    tax_code_id UUID REFERENCES public.tax_codes(id),
    description TEXT NOT NULL,
    vendor TEXT,
    expense_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'CAD',
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    is_billable BOOLEAN DEFAULT false,
    is_personal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices table for client billing
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_address TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'CAD',
    status invoice_status NOT NULL DEFAULT 'draft',
    notes TEXT,
    terms TEXT,
    payment_instructions TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, invoice_number)
);

-- Invoice items for detailed line items
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reminders table for payment follow-ups
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    tone TEXT, -- 'polite', 'firm', 'urgent'
    status reminder_status NOT NULL DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- BANKING INTEGRATION TABLES
-- ============================================================================

-- Bank accounts for transaction import
CREATE TABLE public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,
    account_type bank_account_type NOT NULL,
    account_number_masked TEXT,
    institution_name TEXT,
    currency TEXT DEFAULT 'CAD',
    current_balance DECIMAL(12,2),
    plaid_account_id TEXT,
    plaid_access_token_encrypted TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bank transactions for reconciliation
CREATE TABLE public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
    transaction_id TEXT NOT NULL, -- External bank transaction ID
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    category_suggested TEXT,
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(bank_account_id, transaction_id)
);

-- ============================================================================
-- COMPLIANCE & AUDIT
-- ============================================================================

-- Audit logs for compliance tracking
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Function to get current user role (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, table_name, record_id, action, old_values, new_values
    ) VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Companies policies
CREATE POLICY "Users can manage their own companies" ON public.companies
    FOR ALL USING (auth.uid() = user_id);

-- Receipts policies
CREATE POLICY "Users can manage their own receipts" ON public.receipts
    FOR ALL USING (auth.uid() = user_id);

-- Expense categories policies (read-only for users)
CREATE POLICY "Everyone can view expense categories" ON public.expense_categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage expense categories" ON public.expense_categories
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tax codes policies (read-only for users)
CREATE POLICY "Everyone can view tax codes" ON public.tax_codes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage tax codes" ON public.tax_codes
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Expenses policies
CREATE POLICY "Users can manage their own expenses" ON public.expenses
    FOR ALL USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can manage their own invoices" ON public.invoices
    FOR ALL USING (auth.uid() = user_id);

-- Invoice items policies (inherit from invoice)
CREATE POLICY "Users can manage invoice items for their invoices" ON public.invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE id = invoice_id AND user_id = auth.uid()
        )
    );

-- Reminders policies
CREATE POLICY "Users can manage their own reminders" ON public.reminders
    FOR ALL USING (auth.uid() = user_id);

-- Bank accounts policies
CREATE POLICY "Users can manage their own bank accounts" ON public.bank_accounts
    FOR ALL USING (auth.uid() = user_id);

-- Bank transactions policies
CREATE POLICY "Users can manage their own bank transactions" ON public.bank_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON public.receipts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit logging triggers for key tables
CREATE TRIGGER audit_companies_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_expenses_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_invoices_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User-based indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_bank_transactions_user_id ON public.bank_transactions(user_id);

-- Date-based indexes for reporting
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_bank_transactions_transaction_date ON public.bank_transactions(transaction_date);

-- Status indexes for filtering
CREATE INDEX idx_receipts_status ON public.receipts(status);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_reminders_status ON public.reminders(status);
CREATE INDEX idx_bank_transactions_status ON public.bank_transactions(status);

-- Foreign key indexes
CREATE INDEX idx_receipts_company_id ON public.receipts(company_id);
CREATE INDEX idx_expenses_receipt_id ON public.expenses(receipt_id);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_reminders_invoice_id ON public.reminders(invoice_id);
CREATE INDEX idx_bank_transactions_bank_account_id ON public.bank_transactions(bank_account_id);

-- Unique business constraint indexes
CREATE INDEX idx_invoices_invoice_number ON public.invoices(user_id, invoice_number);
CREATE INDEX idx_bank_transactions_external_id ON public.bank_transactions(bank_account_id, transaction_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default expense categories (CRA T2125 categories)
INSERT INTO public.expense_categories (code, name, description, cra_category) VALUES
('ADVERTISING', 'Advertising', 'Advertising and promotion expenses', 'Line 8500'),
('MEALS', 'Meals and Entertainment', 'Business meals and entertainment (50% deductible)', 'Line 8523'),
('INSURANCE', 'Insurance', 'Business insurance premiums', 'Line 8690'),
('INTEREST', 'Interest and Bank Charges', 'Business loan interest and bank fees', 'Line 8710'),
('PROFESSIONAL', 'Professional Fees', 'Legal, accounting, and consulting fees', 'Line 8740'),
('MANAGEMENT', 'Management and Administration', 'Management and administrative fees', 'Line 8741'),
('OFFICE', 'Office Expenses', 'Office supplies and expenses', 'Line 8760'),
('SUPPLIES', 'Supplies', 'Business supplies', 'Line 8761'),
('TELEPHONE', 'Telephone and Utilities', 'Phone, internet, and utilities', 'Line 8790'),
('TRAVEL', 'Travel', 'Business travel expenses', 'Line 8810'),
('MOTOR_VEHICLE', 'Motor Vehicle', 'Vehicle expenses for business use', 'Line 8811'),
('RENT', 'Rent', 'Rent for business premises', 'Line 8910'),
('REPAIRS', 'Repairs and Maintenance', 'Repairs and maintenance expenses', 'Line 8960'),
('OTHER', 'Other Expenses', 'Other allowable business expenses', 'Line 8980');

-- Insert Canadian tax codes (GST/HST rates by province) - fixed duplicates
INSERT INTO public.tax_codes (code, name, rate, province, effective_from) VALUES
('GST_5_AB', 'GST 5%', 0.05, 'AB', '2008-01-01'),
('GST_5_BC', 'GST 5%', 0.05, 'BC', '2008-01-01'),
('GST_5_MB', 'GST 5%', 0.05, 'MB', '2008-01-01'),
('GST_5_SK', 'GST 5%', 0.05, 'SK', '2008-01-01'),
('GST_5_YT', 'GST 5%', 0.05, 'YT', '2008-01-01'),
('GST_5_NT', 'GST 5%', 0.05, 'NT', '2008-01-01'),
('GST_5_NU', 'GST 5%', 0.05, 'NU', '2008-01-01'),
('HST_13_ON', 'HST 13%', 0.13, 'ON', '2010-07-01'),
('HST_15_NS', 'HST 15%', 0.15, 'NS', '2008-01-01'),
('HST_15_NB', 'HST 15%', 0.15, 'NB', '2008-01-01'),
('HST_15_NL', 'HST 15%', 0.15, 'NL', '2008-01-01'),
('HST_14_975_PE', 'HST 14.975%', 0.14975, 'PE', '2008-01-01'),
('GST_QST_QC', 'GST 5% + QST 9.975%', 0.14975, 'QC', '2008-01-01'),
('NO_TAX', 'No Tax', 0.00, NULL, '2008-01-01');