-- Migration: Add account-goal removal trigger for automatic mode switching
-- Purpose: Handle orphaned account-goal relationships when accounts are deleted
-- Related to: fix-critical-bugs-2025-01 (Critical Bug #3: Orphaned Account-Goal Relationships)

-- Step 1: Create function to handle account-goal removal
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
DECLARE
  remaining_accounts INTEGER;
  goal_name TEXT;
  goal_user_id UUID;
  final_amount NUMERIC;
BEGIN
  -- Count remaining accounts for this goal (excluding the one being deleted)
  SELECT COUNT(*) INTO remaining_accounts
  FROM account_goals
  WHERE goal_id = OLD.goal_id AND id != OLD.id;
  
  -- If this was the last account, switch goal to manual mode
  IF remaining_accounts = 0 THEN
    -- Get goal details for notification
    SELECT name, user_id INTO goal_name, goal_user_id
    FROM goals
    WHERE id = OLD.goal_id;
    
    -- Calculate final amount from all current linked accounts before deletion
    SELECT COALESCE(SUM(a.current_balance), 0) INTO final_amount
    FROM accounts a
    JOIN account_goals ag ON a.id = ag.account_id
    WHERE ag.goal_id = OLD.goal_id;
    
    -- Switch goal to manual mode and preserve current progress
    UPDATE goals
    SET 
      is_manual_goal = true,
      current_amount = final_amount
    WHERE id = OLD.goal_id;
    
    -- Create notification about mode switch
    INSERT INTO notifications (user_id, notification_type, title, message)
    VALUES (
      goal_user_id,
      'goal_update',
      'Goal Tracking Mode Changed',
      'Goal "' || goal_name || '" switched to manual tracking because the last linked account was removed. Current progress: RM ' || ROUND(final_amount, 2) || '.'
    );
    
    -- Log the mode switch
    RAISE NOTICE 'Goal "%" (ID: %) switched to manual mode. Final amount: RM %', 
      goal_name, OLD.goal_id, final_amount;
  ELSE
    -- Still has other accounts, just log the removal
    RAISE DEBUG 'Account removed from goal ID: %. % accounts remain.', 
      OLD.goal_id, remaining_accounts;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp';

-- Step 2: Create trigger
DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
CREATE TRIGGER before_account_goal_delete
  BEFORE DELETE ON account_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_goal_removal();

-- Step 3: Add comments for documentation
COMMENT ON FUNCTION handle_account_goal_removal() IS
  'Automatically switches goal to manual tracking when last linked account is removed. Preserves current progress in current_amount field.';

COMMENT ON TRIGGER before_account_goal_delete ON account_goals IS
  'Triggers handle_account_goal_removal() to manage goal tracking mode when accounts are unlinked';

-- Step 4: Test the trigger with a verification query
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'before_account_goal_delete'
    AND tgrelid = 'account_goals'::regclass
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE '✓ Trigger "before_account_goal_delete" successfully created on account_goals table';
  ELSE
    RAISE WARNING '✗ Trigger creation may have failed!';
  END IF;
END $$;

-- Rollback script (commented out):
-- DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
-- DROP FUNCTION IF EXISTS handle_account_goal_removal();
