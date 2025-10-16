/*
  # Add Missing Goal Fields

  1. Changes to goals table
    - Add `category` (text) - category name as text instead of foreign key
    - Add `description` (text) - user description of the goal
    - Add `priority` (text) - high, medium, or low priority
    - Add `current_amount` (numeric) - current progress toward goal
    - Add `dividend_rate` (numeric) - for investment calculations

  2. Security
    - Maintains existing RLS policies
*/

-- Add missing columns to goals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'category'
  ) THEN
    ALTER TABLE goals ADD COLUMN category text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'description'
  ) THEN
    ALTER TABLE goals ADD COLUMN description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'priority'
  ) THEN
    ALTER TABLE goals ADD COLUMN priority text DEFAULT 'medium';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'current_amount'
  ) THEN
    ALTER TABLE goals ADD COLUMN current_amount numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'dividend_rate'
  ) THEN
    ALTER TABLE accounts ADD COLUMN dividend_rate numeric DEFAULT 0;
  END IF;
END $$;
