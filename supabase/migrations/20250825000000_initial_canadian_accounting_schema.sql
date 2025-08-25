-- SwiftBooks Canadian SMB Accounting Schema
-- Initial migration for comprehensive accounting system with Canadian compliance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom domains for Canadian business requirements
CREATE DOMAIN canadian_currency AS NUMERIC(15,2) CHECK (VALUE >= 0);
CREATE DOMAIN canadian_postal_code AS VARCHAR(7) CHECK (VALUE ~ '^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$');
CREATE DOMAIN canadian_province AS VARCHAR(2) CHECK (VALUE IN ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'));
CREATE DOMAIN gst_rate AS NUMERIC(5,4) CHECK (VALUE >= 0 AND VALUE <= 1);
CREATE DOMAIN business_number AS VARCHAR(15) CHECK (VALUE ~ '^\d{9}[A-Z]{2}\d{4}$');

-- Core business entities schema
CREATE SCHEMA IF NOT EXISTS accounting;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS reporting;

-- Company/Organization table with Canadian compliance
CREATE TABLE accounting.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_number business_number UNIQUE,
  legal_name VARCHAR(255) NOT NULL,
  operating_name VARCHAR(255),
  company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('corporation', 'partnership', 'sole_proprietorship', 'non_profit')),
  incorporation_date DATE,
  fiscal_year_end DATE NOT NULL,
  
  -- Address information
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province canadian_province NOT NULL,
  postal_code canadian_postal_code NOT NULL,
  country VARCHAR(2) DEFAULT 'CA',
  
  -- Contact information
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Tax information
  gst_hst_number VARCHAR(15),
  qst_number VARCHAR(16),
  payroll_account_number VARCHAR(15),
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Compliance tracking
  last_cra_filing DATE,
  compliance_status VARCHAR(20) DEFAULT 'active' CHECK (compliance_status IN ('active', 'suspended', 'inactive')),
  
  CONSTRAINT valid_business_info CHECK (
    (company_type = 'corporation' AND business_number IS NOT NULL) OR
    (company_type IN ('partnership', 'sole_proprietorship', 'non_profit'))
  )
);

-- User profiles with company association and roles
CREATE TABLE accounting.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  company_id UUID REFERENCES accounting.companies(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'accountant', 'bookkeeper', 'readonly')),
  
  -- Personal information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  job_title VARCHAR(100),
  
  -- Contact information
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Permissions
  can_approve_transactions BOOLEAN DEFAULT FALSE,
  can_generate_reports BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_export_data BOOLEAN DEFAULT FALSE,
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Canadian compliance
  cra_authorized BOOLEAN DEFAULT FALSE,
  authorization_level VARCHAR(20) DEFAULT 'basic' CHECK (authorization_level IN ('basic', 'intermediate', 'full'))
);

-- Chart of accounts with Canadian accounting standards
CREATE TABLE accounting.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES accounting.companies(id),
  account_code VARCHAR(20) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  account_subtype VARCHAR(50),
  
  -- Account hierarchy
  parent_account_id UUID REFERENCES accounting.accounts(id),
  account_level INTEGER DEFAULT 1,
  is_header BOOLEAN DEFAULT FALSE,
  
  -- Canadian specific fields
  cra_account_code VARCHAR(10),
  gifi_code VARCHAR(10), -- General Index of Financial Information codes
  
  -- Account properties
  normal_balance VARCHAR(6) CHECK (normal_balance IN ('debit', 'credit')),
  is_bank_account BOOLEAN DEFAULT FALSE,
  is_tax_account BOOLEAN DEFAULT FALSE,
  current_balance canadian_currency DEFAULT 0,
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(company_id, account_code),
  
  -- Ensure account hierarchy consistency
  CONSTRAINT prevent_self_reference CHECK (id != parent_account_id),
  CONSTRAINT balance_consistency CHECK (
    (account_type IN ('asset', 'expense') AND normal_balance = 'debit') OR
    (account_type IN ('liability', 'equity', 'revenue') AND normal_balance = 'credit')
  )
);

-- Financial transactions with comprehensive audit trail
CREATE TABLE accounting.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES accounting.companies(id),
  transaction_number VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('journal_entry', 'invoice', 'payment', 'expense', 'transfer', 'adjustment')),
  
  -- Transaction details
  transaction_date DATE NOT NULL,
  posting_date DATE DEFAULT CURRENT_DATE,
  reference_number VARCHAR(100),
  description TEXT NOT NULL,
  memo TEXT,
  
  -- Amounts
  total_amount canadian_currency NOT NULL,
  
  -- Status and approval
  status VARCHAR(15) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'posted', 'voided')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Attachments and documents
  attachment_count INTEGER DEFAULT 0,
  document_references JSONB,
  
  -- Canadian tax implications
  affects_gst BOOLEAN DEFAULT FALSE,
  gst_amount canadian_currency DEFAULT 0,
  affects_qst BOOLEAN DEFAULT FALSE,
  qst_amount canadian_currency DEFAULT 0,
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT FALSE,
  reconciled_date DATE,
  reconciled_by UUID REFERENCES auth.users(id),
  
  UNIQUE(company_id, transaction_number),
  
  -- Business rules
  CONSTRAINT valid_approval CHECK (
    (status IN ('draft', 'pending') AND approved_by IS NULL) OR
    (status IN ('approved', 'posted') AND approved_by IS NOT NULL)
  ),
  CONSTRAINT valid_tax_amounts CHECK (
    gst_amount >= 0 AND qst_amount >= 0
  )
);

-- Transaction line items (double-entry bookkeeping)
CREATE TABLE accounting.transaction_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES accounting.transactions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES accounting.companies(id),
  account_id UUID REFERENCES accounting.accounts(id),
  
  -- Line details
  line_number INTEGER NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  
  -- Amounts (double-entry)
  debit_amount canadian_currency DEFAULT 0,
  credit_amount canadian_currency DEFAULT 0,
  
  -- Tax information
  tax_code VARCHAR(10),
  tax_rate gst_rate DEFAULT 0,
  tax_amount canadian_currency DEFAULT 0,
  
  -- Tracking and analysis
  department VARCHAR(100),
  project_code VARCHAR(50),
  customer_id UUID,
  vendor_id UUID,
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(transaction_id, line_number),
  
  -- Double-entry validation
  CONSTRAINT exclusive_debit_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR
    (debit_amount = 0 AND credit_amount > 0)
  ),
  CONSTRAINT valid_amounts CHECK (
    debit_amount >= 0 AND credit_amount >= 0 AND tax_amount >= 0
  )
);

-- Canadian tax codes and rates
CREATE TABLE compliance.canadian_tax_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL,
  tax_type VARCHAR(10) NOT NULL CHECK (tax_type IN ('GST', 'HST', 'QST', 'PST')),
  province canadian_province,
  
  -- Tax rates
  rate gst_rate NOT NULL,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Business rules
  CONSTRAINT provincial_tax_province CHECK (
    (tax_type IN ('GST') AND province IS NULL) OR
    (tax_type IN ('HST', 'QST', 'PST') AND province IS NOT NULL)
  )
);

-- Comprehensive audit trail for all financial operations
CREATE TABLE audit.financial_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES accounting.companies(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Operation details
  table_name VARCHAR(50) NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID NOT NULL,
  
  -- Change tracking
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Context information
  transaction_id UUID,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  
  -- Compliance tracking
  compliance_reason TEXT,
  canadian_compliance_flags JSONB,
  retention_period INTERVAL DEFAULT INTERVAL '7 years',
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexing for performance
  CONSTRAINT audit_immutable CHECK (created_at IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX idx_companies_business_number ON accounting.companies(business_number);
CREATE INDEX idx_companies_active ON accounting.companies(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_user_profiles_company ON accounting.user_profiles(company_id);
CREATE INDEX idx_user_profiles_user ON accounting.user_profiles(user_id);
CREATE INDEX idx_user_profiles_active ON accounting.user_profiles(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_accounts_company ON accounting.accounts(company_id);
CREATE INDEX idx_accounts_code ON accounting.accounts(company_id, account_code);
CREATE INDEX idx_accounts_type ON accounting.accounts(account_type);
CREATE INDEX idx_accounts_parent ON accounting.accounts(parent_account_id);

CREATE INDEX idx_transactions_company ON accounting.transactions(company_id);
CREATE INDEX idx_transactions_date ON accounting.transactions(transaction_date);
CREATE INDEX idx_transactions_status ON accounting.transactions(status);
CREATE INDEX idx_transactions_type ON accounting.transactions(transaction_type);
CREATE INDEX idx_transactions_number ON accounting.transactions(company_id, transaction_number);

CREATE INDEX idx_transaction_lines_transaction ON accounting.transaction_lines(transaction_id);
CREATE INDEX idx_transaction_lines_account ON accounting.transaction_lines(account_id);
CREATE INDEX idx_transaction_lines_company ON accounting.transaction_lines(company_id);

CREATE INDEX idx_tax_codes_active ON compliance.canadian_tax_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tax_codes_province ON compliance.canadian_tax_codes(province);
CREATE INDEX idx_tax_codes_type ON compliance.canadian_tax_codes(tax_type);

CREATE INDEX idx_audit_trail_company ON audit.financial_audit_trail(company_id);
CREATE INDEX idx_audit_trail_table ON audit.financial_audit_trail(table_name);
CREATE INDEX idx_audit_trail_record ON audit.financial_audit_trail(record_id);
CREATE INDEX idx_audit_trail_timestamp ON audit.financial_audit_trail(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE accounting.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance.canadian_tax_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.financial_audit_trail ENABLE ROW LEVEL SECURITY;
