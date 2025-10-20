/*
  # Create Admin Infrastructure

  ## 1. Admin Authentication
    - Add `is_admin` column to profiles table
    - Create helper function to check admin status
    - Set initial admin user (zulkifly.anawi@gmail.com)

  ## 2. Admin Configuration Tables
    ### admin_config_account_types
    - Stores configurable account types (ASB, EPF, Tabung Haji, etc.)
    - Fields: id, name, display_name, description, is_active, sort_order
    
    ### admin_config_institutions
    - Stores financial institution names
    - Fields: id, name, display_name, institution_type, is_active, sort_order
    
    ### admin_config_goal_categories
    - Stores goal categories
    - Fields: id, name, display_name, description, icon, is_active, sort_order
    
    ### admin_config_validation_rules
    - Stores system validation rules
    - Fields: id, rule_name, field_name, rule_type, rule_value, error_message
    
    ### admin_config_system_settings
    - Stores key-value system settings
    - Fields: id, setting_key, setting_value, value_type, category, description

  ## 3. Audit Logging
    ### admin_audit_log
    - Tracks all admin configuration changes
    - 7-year retention period (calculated via view)
    - Fields: id, admin_user_id, action_type, table_name, record_id, old_value, new_value, ip_address, timestamp

  ## 4. Security
    - RLS policies: All authenticated users can SELECT configuration
    - Only admin users can INSERT, UPDATE, DELETE configuration
    - Only admin users can access audit log
*/

-- Add is_admin column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set initial admin user
UPDATE profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'zulkifly.anawi@gmail.com'
);

-- Create admin_config_account_types table
CREATE TABLE IF NOT EXISTS admin_config_account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config_account_types ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_account_types' AND policyname = 'Anyone can read account types'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read account types" ON admin_config_account_types FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_account_types' AND policyname = 'Only admins can insert account types'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can insert account types" ON admin_config_account_types FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_account_types' AND policyname = 'Only admins can update account types'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can update account types" ON admin_config_account_types FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_account_types' AND policyname = 'Only admins can delete account types'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can delete account types" ON admin_config_account_types FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END $$;

-- Create admin_config_institutions table
CREATE TABLE IF NOT EXISTS admin_config_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  institution_type text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config_institutions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_institutions' AND policyname = 'Anyone can read institutions'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read institutions" ON admin_config_institutions FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_institutions' AND policyname = 'Only admins can insert institutions'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can insert institutions" ON admin_config_institutions FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_institutions' AND policyname = 'Only admins can update institutions'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can update institutions" ON admin_config_institutions FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_institutions' AND policyname = 'Only admins can delete institutions'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can delete institutions" ON admin_config_institutions FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END $$;

-- Create admin_config_goal_categories table
CREATE TABLE IF NOT EXISTS admin_config_goal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config_goal_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_goal_categories' AND policyname = 'Anyone can read goal categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read goal categories" ON admin_config_goal_categories FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_goal_categories' AND policyname = 'Only admins can insert goal categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can insert goal categories" ON admin_config_goal_categories FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_goal_categories' AND policyname = 'Only admins can update goal categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can update goal categories" ON admin_config_goal_categories FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_goal_categories' AND policyname = 'Only admins can delete goal categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can delete goal categories" ON admin_config_goal_categories FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END $$;

-- Create admin_config_validation_rules table
CREATE TABLE IF NOT EXISTS admin_config_validation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text UNIQUE NOT NULL,
  field_name text NOT NULL,
  rule_type text NOT NULL,
  rule_value jsonb NOT NULL,
  error_message text NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config_validation_rules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_validation_rules' AND policyname = 'Anyone can read validation rules'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read validation rules" ON admin_config_validation_rules FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_validation_rules' AND policyname = 'Only admins can insert validation rules'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can insert validation rules" ON admin_config_validation_rules FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_validation_rules' AND policyname = 'Only admins can update validation rules'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can update validation rules" ON admin_config_validation_rules FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_validation_rules' AND policyname = 'Only admins can delete validation rules'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can delete validation rules" ON admin_config_validation_rules FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END $$;

-- Create admin_config_system_settings table
CREATE TABLE IF NOT EXISTS admin_config_system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  value_type text NOT NULL,
  category text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config_system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_system_settings' AND policyname = 'Anyone can read system settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read system settings" ON admin_config_system_settings FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_system_settings' AND policyname = 'Only admins can insert system settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can insert system settings" ON admin_config_system_settings FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_system_settings' AND policyname = 'Only admins can update system settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can update system settings" ON admin_config_system_settings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_config_system_settings' AND policyname = 'Only admins can delete system settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can delete system settings" ON admin_config_system_settings FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END $$;

-- Create admin_audit_log table with 7-year retention tracking
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) NOT NULL,
  admin_email text NOT NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_audit_log' AND policyname = 'Only admins can read audit log'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can read audit log" ON admin_audit_log FOR SELECT TO authenticated USING (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_audit_log' AND policyname = 'Only admins can insert audit log'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can insert audit log" ON admin_audit_log FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

-- Create view for audit log with retention date calculation
CREATE OR REPLACE VIEW admin_audit_log_with_retention AS
SELECT 
  *,
  timestamp + INTERVAL '7 years' AS retention_date,
  CASE 
    WHEN timestamp + INTERVAL '7 years' - INTERVAL '30 days' < now() 
    THEN true 
    ELSE false 
  END AS approaching_retention
FROM admin_audit_log;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_config_account_types_active ON admin_config_account_types(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_admin_config_institutions_active ON admin_config_institutions(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_admin_config_goal_categories_active ON admin_config_goal_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_admin_config_validation_rules_active ON admin_config_validation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_config_system_settings_key ON admin_config_system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user ON admin_audit_log(admin_user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_table ON admin_audit_log(table_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON admin_audit_log(timestamp);

-- Update existing tables to support admin features
-- Add is_active and sort_order to goal_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goal_templates' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE goal_templates ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goal_templates' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE goal_templates ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goal_templates' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE goal_templates ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add is_active to achievement_definitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'achievement_definitions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE achievement_definitions ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Add updated_by to dividend_history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dividend_history' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE dividend_history ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dividend_history' AND column_name = 'is_projection'
  ) THEN
    ALTER TABLE dividend_history ADD COLUMN is_projection boolean DEFAULT false;
  END IF;
END $$;

-- Insert initial account types from hardcoded data
INSERT INTO admin_config_account_types (name, display_name, description, sort_order) VALUES
  ('ASB', 'ASB (Amanah Saham Bumiputera)', 'Malaysian unit trust fund managed by PNB', 1),
  ('EPF', 'EPF (Employees Provident Fund)', 'Malaysian retirement savings scheme', 2),
  ('Tabung Haji', 'Tabung Haji', 'Islamic pilgrimage savings fund', 3),
  ('Savings', 'Savings Account', 'Regular savings account', 4),
  ('Fixed Deposit', 'Fixed Deposit', 'Fixed deposit account with guaranteed returns', 5),
  ('Investment', 'Investment Account', 'General investment account', 6),
  ('Other', 'Other', 'Other account types', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert initial institutions from hardcoded data
INSERT INTO admin_config_institutions (name, display_name, institution_type, sort_order) VALUES
  ('KWSP (EPF)', 'KWSP (EPF)', 'Government', 1),
  ('PNB (Permodalan Nasional Berhad)', 'PNB (Permodalan Nasional Berhad)', 'Government', 2),
  ('Tabung Haji', 'Tabung Haji', 'Government', 3),
  ('Maybank', 'Maybank', 'Bank', 4),
  ('CIMB Bank', 'CIMB Bank', 'Bank', 5),
  ('Public Bank', 'Public Bank', 'Bank', 6),
  ('RHB Bank', 'RHB Bank', 'Bank', 7),
  ('Hong Leong Bank', 'Hong Leong Bank', 'Bank', 8),
  ('AmBank', 'AmBank', 'Bank', 9),
  ('Bank Rakyat', 'Bank Rakyat', 'Bank', 10),
  ('Bank Islam', 'Bank Islam', 'Islamic Bank', 11),
  ('HSBC', 'HSBC', 'International Bank', 12),
  ('Other', 'Other', 'Other', 13)
ON CONFLICT (name) DO NOTHING;

-- Insert initial goal categories from hardcoded data
INSERT INTO admin_config_goal_categories (name, display_name, description, icon, sort_order) VALUES
  ('Emergency Fund', 'Emergency Fund', '6 months of living expenses for unexpected situations', 'shield', 1),
  ('House Downpayment', 'House Downpayment', 'Down payment for property purchase', 'home', 2),
  ('Car Purchase', 'Car Purchase', 'Down payment or full payment for vehicle', 'car', 3),
  ('Hajj', 'Hajj', 'Pilgrimage savings (Hajj or Umrah)', 'compass', 4),
  ('Children Education', 'Children Education', 'Education fund for children', 'graduation-cap', 5),
  ('Retirement', 'Retirement', 'Long-term retirement savings', 'piggy-bank', 6),
  ('Wedding', 'Wedding', 'Wedding ceremony expenses', 'heart', 7),
  ('Business Capital', 'Business Capital', 'Starting or expanding business', 'briefcase', 8),
  ('Vacation', 'Vacation', 'Travel and vacation fund', 'plane', 9),
  ('Other', 'Other', 'Other financial goals', 'target', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert initial system settings
INSERT INTO admin_config_system_settings (setting_key, setting_value, value_type, category, description) VALUES
  ('epf_employee_contribution_default', '11', 'number', 'EPF', 'Default EPF employee contribution percentage'),
  ('epf_employer_contribution_default', '12', 'number', 'EPF', 'Default EPF employer contribution percentage'),
  ('age_min', '18', 'number', 'Validation', 'Minimum age for EPF calculations'),
  ('age_max', '65', 'number', 'Validation', 'Maximum age for EPF calculations'),
  ('contribution_percentage_min', '0', 'number', 'Validation', 'Minimum contribution percentage'),
  ('contribution_percentage_max', '20', 'number', 'Validation', 'Maximum contribution percentage'),
  ('currency', 'RM', 'string', 'Display', 'Default currency symbol'),
  ('date_format', 'DD/MM/YYYY', 'string', 'Display', 'Default date format')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert initial validation rules
INSERT INTO admin_config_validation_rules (rule_name, field_name, rule_type, rule_value, error_message) VALUES
  ('age_range', 'age', 'range', '{"min": 18, "max": 65}', 'Age must be between 18 and 65'),
  ('contribution_percentage_range', 'contribution_percentage', 'range', '{"min": 0, "max": 20}', 'Contribution percentage must be between 0% and 20%'),
  ('salary_min', 'monthly_salary', 'min', '{"value": 0}', 'Monthly salary must be greater than 0'),
  ('target_amount_min', 'target_amount', 'min', '{"value": 1}', 'Target amount must be at least RM 1'),
  ('balance_min', 'current_balance', 'min', '{"value": 0}', 'Balance cannot be negative')
ON CONFLICT (rule_name) DO NOTHING;