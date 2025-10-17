/*
  # Update ASB Dividend Rates with Accurate 2024 Data

  1. Changes
    - Add separate columns for dividend and bonus components in dividend_history table
    - Update ASB historical rates with accurate data from ASB website:
      * 2024: 5.50 sen dividend + 0.25 sen bonus = 5.75 sen total
      * 2023: 4.25 sen dividend + 1.00 sen bonus = 5.25 sen total
      * 2022: 3.35 sen dividend + 1.25 sen bonus = 4.60 sen total
      * 2021: 4.25 sen dividend + 0.75 sen bonus = 5.00 sen total
    - Add notes field for additional context
    - Maintain existing EPF and Tabung Haji rates

  2. Notes
    - Rates are stored as percentages (sen converted to percentage)
    - For example: 5.75 sen = 5.75% return per unit
    - All future projections will use 2024 rate (5.75%) as baseline
    - Historical data is marked with is_historical flag for UI distinction
*/

-- Add new columns to dividend_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dividend_history' AND column_name = 'dividend_component'
  ) THEN
    ALTER TABLE dividend_history ADD COLUMN dividend_component numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dividend_history' AND column_name = 'bonus_component'
  ) THEN
    ALTER TABLE dividend_history ADD COLUMN bonus_component numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dividend_history' AND column_name = 'notes'
  ) THEN
    ALTER TABLE dividend_history ADD COLUMN notes text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dividend_history' AND column_name = 'is_historical'
  ) THEN
    ALTER TABLE dividend_history ADD COLUMN is_historical boolean DEFAULT true;
  END IF;
END $$;

-- Update ASB rates with accurate 2024 data (rates are in percentage equivalent to sen per unit)
UPDATE dividend_history 
SET 
  dividend_rate = 5.75,
  dividend_component = 5.50,
  bonus_component = 0.25,
  notes = 'Dividend: 5.50 sen + Bonus: 0.25 sen = 5.75 sen per unit',
  is_historical = true
WHERE account_type = 'ASB' AND year = 2024;

UPDATE dividend_history 
SET 
  dividend_rate = 5.25,
  dividend_component = 4.25,
  bonus_component = 1.00,
  notes = 'Dividend: 4.25 sen + Bonus: 1.00 sen = 5.25 sen per unit',
  is_historical = true
WHERE account_type = 'ASB' AND year = 2023;

UPDATE dividend_history 
SET 
  dividend_rate = 4.60,
  dividend_component = 3.35,
  bonus_component = 1.25,
  notes = 'Dividend: 3.35 sen + Bonus: 1.25 sen = 4.60 sen per unit',
  is_historical = true
WHERE account_type = 'ASB' AND year = 2022;

UPDATE dividend_history 
SET 
  dividend_rate = 5.00,
  dividend_component = 4.25,
  bonus_component = 0.75,
  notes = 'Dividend: 4.25 sen + Bonus: 0.75 sen = 5.00 sen per unit',
  is_historical = true
WHERE account_type = 'ASB' AND year = 2021;

-- Keep 2020 rate as is but add historical flag
UPDATE dividend_history 
SET is_historical = true
WHERE account_type = 'ASB' AND year = 2020;

-- Mark all existing records as historical
UPDATE dividend_history 
SET is_historical = true
WHERE is_historical IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dividend_history_account_year 
ON dividend_history(account_type, year DESC);