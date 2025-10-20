/*
  # Add Investment-Specific Fields

  1. Updates to accounts table
    - Add `units_held` (numeric) - for ASB/mutual fund units
    - Add `user_age` (integer) - for EPF retirement calculations
    - Add `monthly_contribution` (numeric) - for EPF projections
    - Add `salary` (numeric) - to calculate EPF contributions

  2. New table: dividend_history
    - Track historical dividend rates for Malaysian investments
    - Includes rates for ASB, Tabung Haji, EPF

  3. New table: goal_templates
    - Pre-defined Malaysian financial goal templates
    - Includes common goals like house downpayment, Umrah, Hajj, etc.
*/

-- Add investment fields to accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'units_held'
  ) THEN
    ALTER TABLE accounts ADD COLUMN units_held numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'monthly_contribution'
  ) THEN
    ALTER TABLE accounts ADD COLUMN monthly_contribution numeric DEFAULT 0;
  END IF;
END $$;

-- Add user age to profiles table for EPF calculations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE profiles ADD COLUMN age integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'monthly_salary'
  ) THEN
    ALTER TABLE profiles ADD COLUMN monthly_salary numeric DEFAULT 0;
  END IF;
END $$;

-- Create dividend history table
CREATE TABLE IF NOT EXISTS dividend_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type text NOT NULL,
  year integer NOT NULL,
  dividend_rate numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_type, year)
);

ALTER TABLE dividend_history ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'dividend_history'
      AND policyname = 'Anyone can read dividend history'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read dividend history"\n'
         || '  ON dividend_history FOR SELECT\n'
         || '  TO authenticated\n'
         || '  USING (true)';
  END IF;
END $$;

-- Insert historical dividend data
INSERT INTO dividend_history (account_type, year, dividend_rate) VALUES
  ('ASB', 2024, 4.75),
  ('ASB', 2023, 4.50),
  ('ASB', 2022, 4.25),
  ('ASB', 2021, 4.00),
  ('ASB', 2020, 5.50),
  ('Tabung Haji', 2024, 5.50),
  ('Tabung Haji', 2023, 4.75),
  ('Tabung Haji', 2022, 4.50),
  ('Tabung Haji', 2021, 3.75),
  ('Tabung Haji', 2020, 4.00),
  ('EPF', 2024, 5.50),
  ('EPF', 2023, 5.35),
  ('EPF', 2022, 6.10),
  ('EPF', 2021, 6.10),
  ('EPF', 2020, 5.20)
ON CONFLICT (account_type, year) DO NOTHING;

-- Create goal templates table
CREATE TABLE IF NOT EXISTS goal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  default_amount numeric NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'goal_templates'
      AND policyname = 'Anyone can read goal templates'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can read goal templates"\n'
         || '  ON goal_templates FOR SELECT\n'
         || '  TO authenticated\n'
         || '  USING (true)';
  END IF;
END $$;

-- Insert Malaysian goal templates
INSERT INTO goal_templates (name, description, category, default_amount, icon) VALUES
  ('House Downpayment', '10% downpayment for RM500k property plus stamp duty', 'Property', 55000, 'home'),
  ('Emergency Fund', '6 months of living expenses', 'Emergency', 18000, 'shield'),
  ('Umrah Fund', 'Umrah pilgrimage cost per person', 'Hajj', 15000, 'plane'),
  ('Hajj Fund', 'Hajj pilgrimage cost per person (2025 estimate)', 'Hajj', 45000, 'compass'),
  ('Children Education Fund', 'University education fund per child', 'Education', 100000, 'graduation-cap'),
  ('Retirement Fund', 'Minimum retirement savings', 'Retirement', 500000, 'piggy-bank'),
  ('Wedding Fund', 'Traditional Malaysian wedding', 'Life Event', 50000, 'heart'),
  ('Car Downpayment', '10% downpayment for RM80k car', 'Vehicle', 8000, 'car')
ON CONFLICT DO NOTHING;
