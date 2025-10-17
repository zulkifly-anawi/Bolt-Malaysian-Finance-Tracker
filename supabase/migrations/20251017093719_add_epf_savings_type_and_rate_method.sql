/*
  # Add EPF Savings Type and Dividend Rate Method

  1. Changes to accounts table
    - Add `epf_savings_type` (text) - stores "Conventional" or "Syariah"
    - Add `epf_dividend_rate_method` (text) - stores dividend rate calculation method
    
  2. Details
    - Default savings type: "Conventional" for backward compatibility
    - Default rate method: "latest" for using current year's rate
    - Both fields are nullable to support non-EPF accounts
    - Add constraints to ensure only valid values
    
  3. Purpose
    - Enable users to select between Conventional and Syariah EPF accounts
    - Allow users to choose their preferred dividend rate calculation method
    - Persist user preferences for consistent projections
*/

-- Add EPF savings type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'epf_savings_type'
  ) THEN
    ALTER TABLE accounts ADD COLUMN epf_savings_type text;
  END IF;
END $$;

-- Add EPF dividend rate method column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'epf_dividend_rate_method'
  ) THEN
    ALTER TABLE accounts ADD COLUMN epf_dividend_rate_method text DEFAULT 'latest';
  END IF;
END $$;

-- Add constraint for valid savings type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'accounts_epf_savings_type_check'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_epf_savings_type_check 
      CHECK (epf_savings_type IS NULL OR epf_savings_type IN ('Conventional', 'Syariah'));
  END IF;
END $$;

-- Add constraint for valid rate method values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'accounts_epf_rate_method_check'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_epf_rate_method_check 
      CHECK (epf_dividend_rate_method IS NULL OR epf_dividend_rate_method IN ('latest', '3-year-average', '5-year-average', 'historical-average'));
  END IF;
END $$;

-- Set default values for existing EPF accounts
UPDATE accounts 
SET 
  epf_savings_type = 'Conventional',
  epf_dividend_rate_method = 'latest'
WHERE 
  account_type = 'EPF' 
  AND epf_savings_type IS NULL;

-- Create index for EPF accounts lookup
CREATE INDEX IF NOT EXISTS idx_accounts_epf_savings_type 
  ON accounts(epf_savings_type) 
  WHERE account_type = 'EPF';
