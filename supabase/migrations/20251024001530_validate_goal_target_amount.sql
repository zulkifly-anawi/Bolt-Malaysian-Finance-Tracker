-- Migration: Add goal target amount validation
-- Purpose: Prevent division by zero in progress calculations
-- Related to: fix-critical-bugs-2025-01 (Critical Bug #5: Division by Zero Protection)

-- Step 1: Check for any existing goals with invalid target amounts
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM goals
  WHERE target_amount IS NULL OR target_amount <= 0;
  
  IF invalid_count > 0 THEN
    RAISE WARNING 'Found % goals with invalid target amounts (NULL or <= 0)', invalid_count;
    RAISE NOTICE 'These goals will need manual correction before constraint is added';
  ELSE
    RAISE NOTICE 'All goals have valid target amounts (> 0)';
  END IF;
END $$;

-- Step 2: Fix any goals with NULL or zero target amounts (set to minimal valid value)
-- This should not happen in production, but handle edge case
UPDATE goals
SET target_amount = 100.00
WHERE target_amount IS NULL OR target_amount <= 0;

-- Step 3: Add NOT NULL constraint if not already present
ALTER TABLE goals
  ALTER COLUMN target_amount SET NOT NULL;

-- Step 4: Add CHECK constraint to ensure target_amount > 0
-- Note: Use DO block to add constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'goals_target_amount_positive'
  ) THEN
    ALTER TABLE goals
      ADD CONSTRAINT goals_target_amount_positive
      CHECK (target_amount > 0);
  END IF;
END $$;

-- Step 5: Add comment for documentation
COMMENT ON CONSTRAINT goals_target_amount_positive ON goals IS
  'Ensures goal target amount is positive to prevent division by zero in progress calculations';

-- Step 6: Verify constraint is working
DO $$
DECLARE
  min_target NUMERIC;
  max_target NUMERIC;
  avg_target NUMERIC;
  zero_count INTEGER;
BEGIN
  SELECT 
    MIN(target_amount),
    MAX(target_amount),
    AVG(target_amount),
    COUNT(*) FILTER (WHERE target_amount <= 0)
  INTO min_target, max_target, avg_target, zero_count
  FROM goals;
  
  RAISE NOTICE 'Goal target amounts validation:';
  RAISE NOTICE '  Minimum target: RM %', min_target;
  RAISE NOTICE '  Maximum target: RM %', max_target;
  RAISE NOTICE '  Average target: RM %', ROUND(avg_target, 2);
  RAISE NOTICE '  Goals with zero/negative target: %', zero_count;
  
  IF zero_count > 0 THEN
    RAISE EXCEPTION 'Constraint validation failed: found goals with zero/negative targets!';
  END IF;
END $$;

-- Rollback script (commented out):
-- ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_target_amount_positive;
-- ALTER TABLE goals ALTER COLUMN target_amount DROP NOT NULL;
