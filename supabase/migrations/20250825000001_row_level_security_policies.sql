-- SwiftBooks Row Level Security Policies
-- Comprehensive security policies for multi-tenant Canadian accounting data

-- Helper function to get user's company ID
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM accounting.user_profiles 
    WHERE user_id = auth.uid() 
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM accounting.user_profiles 
    WHERE user_id = auth.uid() 
    AND is_active = TRUE
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check user permissions
CREATE OR REPLACE FUNCTION user_can_approve_transactions()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM accounting.user_profiles 
    WHERE user_id = auth.uid() 
    AND is_active = TRUE
    AND can_approve_transactions = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies table policies
CREATE POLICY "company_owners_full_access" ON accounting.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM accounting.user_profiles 
      WHERE user_id = auth.uid() 
      AND company_id = companies.id 
      AND role IN ('owner', 'admin')
      AND is_active = TRUE
    )
  );

CREATE POLICY "company_users_read_access" ON accounting.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM accounting.user_profiles 
      WHERE user_id = auth.uid() 
      AND company_id = companies.id 
      AND is_active = TRUE
    )
  );

-- User profiles policies
CREATE POLICY "user_profiles_company_isolation" ON accounting.user_profiles
  FOR ALL USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "users_can_update_own_profile" ON accounting.user_profiles
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Accounts table policies
CREATE POLICY "accounts_company_isolation" ON accounting.accounts
  FOR ALL USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "readonly_users_accounts_restriction" ON accounting.accounts
  FOR INSERT, UPDATE, DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM accounting.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'readonly'
    )
  );

-- Transactions table policies
CREATE POLICY "transactions_company_isolation" ON accounting.transactions
  FOR ALL USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "readonly_users_transactions_restriction" ON accounting.transactions
  FOR INSERT, UPDATE, DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM accounting.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'readonly'
    )
  );

CREATE POLICY "transaction_approval_restriction" ON accounting.transactions
  FOR UPDATE USING (
    CASE 
      WHEN status = 'pending' AND OLD.status = 'draft' THEN TRUE
      WHEN status = 'approved' AND OLD.status = 'pending' THEN user_can_approve_transactions()
      WHEN status = 'posted' AND OLD.status = 'approved' THEN user_can_approve_transactions()
      ELSE FALSE
    END
  );

-- Transaction lines policies
CREATE POLICY "transaction_lines_company_isolation" ON accounting.transaction_lines
  FOR ALL USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "readonly_users_transaction_lines_restriction" ON accounting.transaction_lines
  FOR INSERT, UPDATE, DELETE USING (
    NOT EXISTS (
      SELECT 1 FROM accounting.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'readonly'
    )
  );

-- Canadian tax codes policies (read-only for most users)
CREATE POLICY "tax_codes_read_access" ON compliance.canadian_tax_codes
  FOR SELECT USING (TRUE);

CREATE POLICY "tax_codes_admin_only" ON compliance.canadian_tax_codes
  FOR INSERT, UPDATE, DELETE USING (
    user_has_role('owner') OR user_has_role('admin')
  );

-- Audit trail policies
CREATE POLICY "audit_trail_company_isolation" ON audit.financial_audit_trail
  FOR SELECT USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "audit_trail_insert_only" ON audit.financial_audit_trail
  FOR INSERT WITH CHECK (
    company_id = get_user_company_id()
    AND user_id = auth.uid()
  );

-- Prevent audit trail modifications (insert-only)
CREATE POLICY "audit_trail_no_modifications" ON audit.financial_audit_trail
  FOR UPDATE, DELETE USING (FALSE);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA accounting TO authenticated;
GRANT USAGE ON SCHEMA audit TO authenticated;
GRANT USAGE ON SCHEMA compliance TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA accounting TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA compliance TO authenticated;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA accounting TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA compliance TO authenticated;
