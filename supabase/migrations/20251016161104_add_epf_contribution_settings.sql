/*
  # Add EPF Contribution Settings

  1. Updates to profiles table
    - `epf_employee_contribution_percentage` (numeric) - Employee contribution rate (default: 11%)
    - `epf_employer_contribution_percentage` (numeric) - Employer contribution rate (default: 12%)
    - `use_custom_epf_contribution` (boolean) - Whether user has customized EPF settings (default: false)
    - `include_employer_contribution` (boolean) - Include employer portion in projections (default: true)

  2. Updates to accounts table
    - `employee_contribution_percentage` (numeric, nullable) - Override for specific EPF account
    - `employer_contribution_percentage` (numeric, nullable) - Override for specific EPF account
    - `use_total_contribution` (boolean) - Include both employee and employer in projections (default: true)
    - `is_manual_contribution` (boolean) - Whether using manual amount vs calculated (default: false)

  3. Notes
    - Profile-level settings provide defaults for all EPF accounts
    - Account-level settings override profile defaults when set
    - Maintains backward compatibility with existing monthly_contribution field
    - Standard Malaysian EPF rates: Employee 11%, Employer 12-13%

  4. Security
    - Maintains existing RLS policies
    - All fields are user-specific and protected by existing policies
*/

-- Add EPF contribution settings to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'epf_employee_contribution_percentage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN epf_employee_contribution_percentage numeric DEFAULT 11;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'epf_employer_contribution_percentage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN epf_employer_contribution_percentage numeric DEFAULT 12;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'use_custom_epf_contribution'
  ) THEN
    ALTER TABLE profiles ADD COLUMN use_custom_epf_contribution boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'include_employer_contribution'
  ) THEN
    ALTER TABLE profiles ADD COLUMN include_employer_contribution boolean DEFAULT true;
  END IF;
END $$;

-- Add contribution percentage fields to accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'employee_contribution_percentage'
  ) THEN
    ALTER TABLE accounts ADD COLUMN employee_contribution_percentage numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'employer_contribution_percentage'
  ) THEN
    ALTER TABLE accounts ADD COLUMN employer_contribution_percentage numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'use_total_contribution'
  ) THEN
    ALTER TABLE accounts ADD COLUMN use_total_contribution boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'is_manual_contribution'
  ) THEN
    ALTER TABLE accounts ADD COLUMN is_manual_contribution boolean DEFAULT false;
  END IF;
END $$;

-- Add check constraints to ensure reasonable percentage values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_employee_contribution_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_employee_contribution_check 
    CHECK (epf_employee_contribution_percentage >= 0 AND epf_employee_contribution_percentage <= 20);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_employer_contribution_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_employer_contribution_check 
    CHECK (epf_employer_contribution_percentage >= 0 AND epf_employer_contribution_percentage <= 20);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'accounts_employee_contribution_check'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_employee_contribution_check 
    CHECK (employee_contribution_percentage IS NULL OR (employee_contribution_percentage >= 0 AND employee_contribution_percentage <= 20));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'accounts_employer_contribution_check'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_employer_contribution_check 
    CHECK (employer_contribution_percentage IS NULL OR (employer_contribution_percentage >= 0 AND employer_contribution_percentage <= 20));
  END IF;
END $$;