# Goal Tracking - Delta Spec

This delta documents changes to the Goal Tracking capability to fix critical bug: Goal Progress Inconsistency.

## MODIFIED Requirements

### Requirement: Goal Progress Tracking
The system SHALL automatically calculate and display goal progress with a single source of truth.

#### Scenario: Calculate progress from account allocation
- **WHEN** goal has accounts allocated via account_goals
- **THEN** system sums current_balance of all linked accounts
- **AND** calculates progress percentage (sum / target * 100)
- **AND** displays progress bar with percentage
- **AND** shows "Account-Linked" badge
- **AND** ignores manual current_amount field

#### Scenario: Calculate progress manually
- **WHEN** goal has NO accounts allocated (is_manual_goal = true)
- **THEN** system uses current_amount field for progress
- **AND** calculates progress percentage (current_amount / target * 100)
- **AND** displays progress bar with percentage  
- **AND** shows "Manual" badge
- **AND** allows direct updates to current_amount

#### Scenario: Update progress manually
- **WHEN** user updates goal current_amount directly
- **AND** goal is in manual mode (no accounts linked)
- **THEN** system saves new value
- **AND** recalculates progress percentage
- **AND** creates entry in goal_progress_entries for historical tracking
- **AND** updates updated_at timestamp

#### Scenario: Prevent manual updates on account-linked goals
- **WHEN** user attempts to update current_amount
- **AND** goal has accounts allocated (is_manual_goal = false)
- **THEN** system shows error: "Cannot manually update account-linked goals"
- **AND** suggests removing accounts first to enable manual mode
- **AND** does not save the update

### MODIFIED Requirement: Account Allocation Lifecycle
The system SHALL manage goal tracking mode when accounts are added or removed.

#### Scenario: Switch to account-linked mode
- **WHEN** user links first account to a manual goal
- **THEN** system sets is_manual_goal = false
- **AND** calculates progress from account balance going forward
- **AND** preserves current_amount as historical value
- **AND** shows notification: "Goal switched to account tracking"

#### Scenario: Switch to manual mode
- **WHEN** user removes last account from goal
- **THEN** system sets is_manual_goal = true
- **AND** copies last calculated balance to current_amount
- **AND** allows manual updates going forward
- **AND** shows notification: "Goal switched to manual tracking"

#### Scenario: Maintain mode with multiple accounts
- **WHEN** goal has multiple accounts
- **AND** user removes one but not all
- **THEN** system keeps is_manual_goal = false
- **AND** continues calculating from remaining accounts
- **AND** does not change tracking mode

## ADDED Requirements

### Requirement: Goal Target Validation
The system SHALL validate goal target amounts to prevent invalid calculations.

#### Scenario: Reject zero target amount
- **WHEN** user creates or updates goal with target_amount = 0
- **THEN** system shows validation error: "Target amount must be greater than 0"
- **AND** prevents saving the goal
- **AND** highlights target_amount field

#### Scenario: Reject negative target amount
- **WHEN** user enters negative target_amount
- **THEN** system shows validation error: "Target amount cannot be negative"
- **AND** prevents saving the goal
- **AND** resets field to previous valid value

#### Scenario: Protect division by zero
- **WHEN** calculating progress percentage
- **THEN** system checks if target_amount > 0
- **AND** returns 0% if target <= 0 (safety fallback)
- **AND** logs warning for debugging

### Requirement: Goal Tracking Mode Visibility
The system SHALL clearly indicate which tracking mode each goal uses.

#### Scenario: Display tracking mode badge
- **WHEN** viewing goal card or details
- **THEN** system displays badge indicating mode:
  - "🔗 Account-Linked" if is_manual_goal = false
  - "✏️ Manual" if is_manual_goal = true
- **AND** uses distinct colors (blue for account, gray for manual)
- **AND** adds tooltip explaining the mode

#### Scenario: Show account allocation status
- **WHEN** viewing account-linked goal
- **THEN** system lists all linked accounts
- **AND** shows each account's current balance
- **AND** shows sum of all accounts
- **AND** provides "Manage Accounts" button

#### Scenario: Show manual update option
- **WHEN** viewing manual goal
- **THEN** system shows "Update Progress" button
- **AND** allows entering new current_amount
- **AND** hides account allocation section

## Technical Details

### Database Schema Changes
```sql
-- Add is_manual_goal flag
ALTER TABLE goals ADD COLUMN is_manual_goal BOOLEAN DEFAULT false;

-- Backfill existing goals
UPDATE goals
SET is_manual_goal = NOT EXISTS (
  SELECT 1 FROM account_goals WHERE goal_id = goals.id
);

-- Add target amount validation
ALTER TABLE goals
  ADD CONSTRAINT goals_target_amount_positive
  CHECK (target_amount > 0);

-- Create trigger for mode switching
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM account_goals 
    WHERE goal_id = OLD.goal_id AND id != OLD.id
  ) THEN
    UPDATE goals
    SET 
      is_manual_goal = true,
      current_amount = (
        SELECT COALESCE(SUM(current_balance), 0)
        FROM accounts a
        JOIN account_goals ag ON a.id = ag.account_id
        WHERE ag.goal_id = OLD.goal_id
      )
    WHERE id = OLD.goal_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_account_goal_delete
  BEFORE DELETE ON account_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_goal_removal();
```

### Updated Progress Calculation Logic
```typescript
// src/utils/goalCalculations.ts

export function calculateGoalProgress(goal: Goal, linkedAccounts?: Account[]): number {
  // Validate target amount
  if (goal.target_amount <= 0) {
    console.warn(`Goal ${goal.id} has invalid target amount: ${goal.target_amount}`);
    return 0;
  }
  
  let currentAmount: number;
  
  if (goal.is_manual_goal || !linkedAccounts || linkedAccounts.length === 0) {
    // Manual mode: use current_amount field
    currentAmount = goal.current_amount || 0;
  } else {
    // Account-linked mode: sum linked account balances
    currentAmount = linkedAccounts.reduce(
      (sum, account) => sum + (account.current_balance || 0), 
      0
    );
  }
  
  // Calculate percentage (capped at 100%)
  return Math.min((currentAmount / goal.target_amount) * 100, 100);
}

export function getGoalTrackingMode(goal: Goal, linkedAccounts?: Account[]): 'manual' | 'account-linked' {
  if (goal.is_manual_goal || !linkedAccounts || linkedAccounts.length === 0) {
    return 'manual';
  }
  return 'account-linked';
}
```

### Migration Script
```sql
-- Migration: YYYYMMDD_fix_goal_progress_inconsistency.sql

-- Step 1: Add column
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_manual_goal BOOLEAN DEFAULT false;

-- Step 2: Backfill based on account_goals existence
UPDATE goals
SET is_manual_goal = (
  SELECT COUNT(*) = 0
  FROM account_goals
  WHERE account_goals.goal_id = goals.id
);

-- Step 3: Add constraint
ALTER TABLE goals
  ADD CONSTRAINT IF NOT EXISTS goals_target_amount_positive
  CHECK (target_amount > 0);

-- Step 4: Create trigger function
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM account_goals 
    WHERE goal_id = OLD.goal_id AND id != OLD.id
  ) THEN
    UPDATE goals
    SET 
      is_manual_goal = true,
      current_amount = (
        SELECT COALESCE(SUM(current_balance), 0)
        FROM accounts a
        JOIN account_goals ag ON a.id = ag.account_id
        WHERE ag.goal_id = OLD.goal_id
      )
    WHERE id = OLD.goal_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger
DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
CREATE TRIGGER before_account_goal_delete
  BEFORE DELETE ON account_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_goal_removal();

-- Rollback script
-- ALTER TABLE goals DROP COLUMN IF EXISTS is_manual_goal;
-- ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_target_amount_positive;
-- DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
-- DROP FUNCTION IF EXISTS handle_account_goal_removal();
```

### Component Updates Required
- `src/components/goals/GoalForm.tsx` - Add target_amount validation
- `src/components/goals/GoalCard.tsx` - Show tracking mode badge
- `src/components/goals/GoalProjection.tsx` - Use new calculation logic
- `src/components/goals/ProgressUpdateModal.tsx` - Check is_manual_goal before allowing updates
- `src/utils/formatters.ts` - Update calculateProgress() with safety check
- `src/utils/goalCalculations.ts` - New file for centralized goal logic
