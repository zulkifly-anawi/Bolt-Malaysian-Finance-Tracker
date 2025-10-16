/*
  # Add Missing Account Fields

  1. Changes to accounts table
    - Add `account_type` (text) - account type as text (ASB, EPF, etc)
    - Add `institution` (text) - institution name as text
    
  2. Notes
    - These columns will coexist with account_type_id and institution_name
    - Allows for simpler text-based storage instead of foreign key lookups
    
  3. Security
    - Maintains existing RLS policies
*/

-- Add account_type as text column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE accounts ADD COLUMN account_type text;
  END IF;
END $$;

-- Add institution as text column (simpler than institution_name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'institution'
  ) THEN
    ALTER TABLE accounts ADD COLUMN institution text;
  END IF;
END $$;
