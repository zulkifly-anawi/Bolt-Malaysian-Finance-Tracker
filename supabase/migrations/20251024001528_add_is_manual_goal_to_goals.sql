-- Migration: Add is_manual_goal column to goals table
-- Purpose: Establish single source of truth for goal progress calculation
-- Related to: fix-critical-bugs-2025-01 (Critical Bug #1: Goal Progress Inconsistency)

-- Step 1: Add the is_manual_goal column with default value
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS is_manual_goal BOOLEAN DEFAULT false;

-- Step 2: Backfill existing goals based on account_goals existence
-- If goal has linked accounts -> is_manual_goal = false (account-linked mode)
-- If goal has NO linked accounts -> is_manual_goal = true (manual mode)
UPDATE goals
SET is_manual_goal = (
  SELECT COUNT(*) = 0
  FROM account_goals
  WHERE account_goals.goal_id = goals.id
)
WHERE is_manual_goal IS NULL OR is_manual_goal = false;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN goals.is_manual_goal IS 
  'Indicates goal tracking mode: true = manual (uses current_amount), false = account-linked (calculates from account_goals)';

-- Step 4: Verify backfill worked correctly
DO $$
DECLARE
  manual_count INTEGER;
  account_linked_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM goals;
  SELECT COUNT(*) INTO manual_count FROM goals WHERE is_manual_goal = true;
  SELECT COUNT(*) INTO account_linked_count FROM goals WHERE is_manual_goal = false;
  
  RAISE NOTICE 'Goals migration completed:';
  RAISE NOTICE '  Total goals: %', total_count;
  RAISE NOTICE '  Manual goals: %', manual_count;
  RAISE NOTICE '  Account-linked goals: %', account_linked_count;
  
  -- Sanity check: every goal should have a mode set
  IF (manual_count + account_linked_count) != total_count THEN
    RAISE WARNING 'Some goals missing is_manual_goal value!';
  END IF;
END $$;

-- Rollback script (commented out, save for emergency):
-- ALTER TABLE goals DROP COLUMN IF EXISTS is_manual_goal;
