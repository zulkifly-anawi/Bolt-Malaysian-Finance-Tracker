/*
  # Add Performance Indexes

  1. Performance Improvements
    - Add index on `accounts.user_id` for faster user account lookups
    - Add index on `goals.user_id` for faster user goal queries
    - Add index on `account_goals.goal_id` for goal-account relationship queries
    - Add index on `account_goals.account_id` for account-goal relationship queries
    - Add index on `balance_entries.account_id` for historical balance queries
    
  2. Notes
    - These indexes are critical for dashboard performance
    - Will significantly improve query speed as data grows
    - Uses IF NOT EXISTS to prevent errors on re-run
    
  3. Security
    - No security changes, maintains existing RLS policies
*/

-- Add index on accounts.user_id for user account lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Add index on goals.user_id for user goal queries
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Add index on account_goals foreign keys for relationship queries
CREATE INDEX IF NOT EXISTS idx_account_goals_goal_id ON account_goals(goal_id);
CREATE INDEX IF NOT EXISTS idx_account_goals_account_id ON account_goals(account_id);

-- Add index on balance_entries.account_id for historical balance queries
CREATE INDEX IF NOT EXISTS idx_balance_entries_account_id ON balance_entries(account_id);

-- Add composite index for balance entries by account and date
CREATE INDEX IF NOT EXISTS idx_balance_entries_account_date ON balance_entries(account_id, entry_date DESC);
