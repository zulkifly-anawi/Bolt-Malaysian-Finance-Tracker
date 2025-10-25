# Account Management - Delta Spec

This delta documents changes to the Account Management capability to fix critical bugs: ASB Unit Price Validation and Orphaned Account-Goal Relationships.

## MODIFIED Requirements

### Requirement: Add ASB Account
The system SHALL enforce Malaysian ASB unit pricing standards.

#### Scenario: Create ASB account with enforced unit price
- **WHEN** user selects "ASB" account type
- **THEN** system creates account with account_type = 'ASB'
- **AND** automatically sets asb_unit_price = 1.00 (non-editable)
- **AND** sets units_held equal to current_balance (1:1 ratio)
- **AND** displays helper text: "ASB units are valued at RM 1.00 each"
- **AND** disables unit_price field in form

#### Scenario: Update ASB account balance
- **WHEN** user updates ASB account current_balance
- **THEN** system triggers sync_asb_units_held() function
- **AND** enforces asb_unit_price = 1.00
- **AND** automatically sets units_held = current_balance
- **AND** prevents manual unit_price modifications
- **AND** validates unit price remains 1.00

#### Scenario: Reject invalid ASB unit price
- **WHEN** attempting to set asb_unit_price != 1.00 for ASB account
- **THEN** database constraint rejects the update
- **AND** returns error: "ASB unit price must be RM 1.00"
- **AND** frontend shows user-friendly validation message

## MODIFIED Requirement: Account Deletion Impact
The system SHALL handle account deletion effects on linked goals.

#### Scenario: Delete account linked to goals
- **WHEN** user attempts to delete account
- **AND** account is linked to one or more goals
- **THEN** system shows warning dialog listing affected goals
- **AND** explains: "Removing this account will affect X goals"
- **AND** for each goal:
  - If account is last one linked: "Will switch to manual tracking"
  - If account is one of many: "Will be removed from goal allocation"
- **AND** requires explicit confirmation

#### Scenario: Automatic goal mode switch on account deletion
- **WHEN** account is deleted
- **AND** account was last one linked to a goal
- **THEN** account_goals record is deleted (CASCADE)
- **AND** trigger handle_account_goal_removal() fires
- **AND** goal is switched to manual mode (is_manual_goal = true)
- **AND** current progress is preserved in current_amount
- **AND** notification created: "Goal '{name}' switched to manual tracking"

#### Scenario: Partial account removal from goal
- **WHEN** account is deleted
- **AND** account was one of multiple linked to a goal
- **THEN** account_goals record is deleted (CASCADE)
- **AND** goal remains in account-linked mode
- **AND** progress recalculated from remaining accounts
- **AND** no notification needed (goal still has accounts)

## ADDED Requirements

### Requirement: ASB Unit Price Enforcement
The system SHALL enforce Malaysian ASB unit pricing at database and application levels.

#### Scenario: Database constraint enforcement
- **WHEN** any update/insert affects ASB account
- **THEN** database checks asb_unit_price = 1.00
- **AND** rejects any other value with constraint violation
- **AND** error code: 23514 (check constraint violation)

#### Scenario: Trigger automatic correction
- **WHEN** sync_asb_units_held() trigger fires
- **AND** account type is 'ASB'
- **THEN** trigger forces asb_unit_price := 1.00
- **AND** calculates units_held := current_balance / 1.00
- **AND** returns updated NEW record

#### Scenario: UI prevention of invalid input
- **WHEN** user creates/edits ASB account in UI
- **THEN** unit_price field is:
  - Pre-filled with 1.00
  - Disabled (read-only)
  - Styled as non-editable
- **AND** helper text shown: "ASB units = RM 1.00 (fixed)"

### Requirement: Account Deletion Warning System
The system SHALL warn users before deleting accounts linked to goals.

#### Scenario: Fetch affected goals before deletion
- **WHEN** user clicks delete on account
- **THEN** system queries account_goals table
- **AND** fetches all goals linked to this account
- **AND** for each goal, determines if it's the last account
- **AND** builds warning message with details

#### Scenario: Display detailed warning
- **WHEN** account has linked goals
- **THEN** system displays modal with:
  - Account name and current balance
  - List of affected goals
  - Impact per goal (switch to manual / remove from allocation)
  - Checkbox: "I understand the impact"
  - Cancel and Confirm Delete buttons

#### Scenario: Safe deletion with no goals
- **WHEN** account has no linked goals
- **THEN** system shows simple confirmation
- **AND** message: "Delete {account name}?"
- **AND** no goal impact warning needed
- **AND** proceeds with deletion on confirmation

## Technical Details

### Database Schema Changes

```sql
-- Add constraint to enforce ASB unit price
ALTER TABLE accounts
  ADD CONSTRAINT asb_unit_price_must_be_one
  CHECK (
    account_type != 'ASB' OR 
    asb_unit_price = 1.00 OR 
    asb_unit_price IS NULL
  );

-- Update sync function to enforce ASB rules
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to ASB accounts
  IF NEW.account_type = 'ASB' THEN
    -- Enforce ASB unit price = 1.00
    NEW.asb_unit_price := 1.00;
    
    -- Calculate units (always 1:1 ratio with balance)
    NEW.asb_units_held := NEW.current_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for account deletion goal impact
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
DECLARE
  remaining_accounts INTEGER;
  goal_name TEXT;
BEGIN
  -- Count remaining accounts for this goal (excluding the one being deleted)
  SELECT COUNT(*) INTO remaining_accounts
  FROM account_goals
  WHERE goal_id = OLD.goal_id AND id != OLD.id;
  
  -- If this was the last account, switch goal to manual mode
  IF remaining_accounts = 0 THEN
    -- Get goal name for notification
    SELECT name INTO goal_name FROM goals WHERE id = OLD.goal_id;
    
    -- Calculate final balance from all current accounts before deletion
    UPDATE goals
    SET 
      is_manual_goal = true,
      current_amount = (
        SELECT COALESCE(SUM(a.current_balance), 0)
        FROM accounts a
        JOIN account_goals ag ON a.id = ag.account_id
        WHERE ag.goal_id = OLD.goal_id
      )
    WHERE id = OLD.goal_id;
    
    -- Create notification about mode switch
    INSERT INTO notifications (user_id, notification_type, title, message)
    SELECT 
      user_id,
      'goal_update',
      'Goal Tracking Mode Changed',
      'Goal "' || goal_name || '" switched to manual tracking because the last linked account was removed.'
    FROM goals
    WHERE id = OLD.goal_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
CREATE TRIGGER before_account_goal_delete
  BEFORE DELETE ON account_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_goal_removal();
```

### Frontend Changes

#### ASB Account Form Component
```typescript
// src/components/accounts/AccountForm.tsx

export function AccountForm({ account, onSave }: Props) {
  const [accountType, setAccountType] = useState(account?.account_type || '');
  const [unitPrice, setUnitPrice] = useState(account?.asb_unit_price || 1.00);
  
  const isASB = accountType === 'ASB';
  
  return (
    <form>
      {/* Account Type Selection */}
      <Select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
        <option value="ASB">ASB</option>
        <option value="EPF">EPF</option>
        {/* ... other types */}
      </Select>
      
      {/* Unit Price Field - Disabled for ASB */}
      {isASB && (
        <div className="form-field">
          <label>Unit Price</label>
          <input
            type="number"
            value={1.00}
            disabled
            className="bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-gray-600 mt-1">
            ℹ️ ASB units are valued at RM 1.00 each (Malaysian standard)
          </p>
        </div>
      )}
      
      {/* Balance Field */}
      <div className="form-field">
        <label>Current Balance</label>
        <input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        {isASB && (
          <p className="text-sm text-gray-600 mt-1">
            Units held: {formatNumber(balance)} (automatically synced)
          </p>
        )}
      </div>
    </form>
  );
}
```

#### Account Deletion Warning Component
```typescript
// src/components/accounts/AccountDeleteWarning.tsx

interface AccountDeleteWarningProps {
  account: Account;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AccountDeleteWarning({ account, onConfirm, onCancel }: Props) {
  const [affectedGoals, setAffectedGoals] = useState<Goal[]>([]);
  const [understood, setUnderstood] = useState(false);
  
  useEffect(() => {
    fetchAffectedGoals();
  }, [account.id]);
  
  async function fetchAffectedGoals() {
    // Get goals linked to this account
    const { data: goalLinks } = await supabase
      .from('account_goals')
      .select('goal_id, goals(*)')
      .eq('account_id', account.id);
    
    const goals = goalLinks?.map(link => link.goals) || [];
    
    // For each goal, check if this is the last account
    const goalsWithImpact = await Promise.all(
      goals.map(async (goal) => {
        const { count } = await supabase
          .from('account_goals')
          .select('*', { count: 'exact', head: true })
          .eq('goal_id', goal.id);
        
        return {
          ...goal,
          isLastAccount: count === 1,
        };
      })
    );
    
    setAffectedGoals(goalsWithImpact);
  }
  
  if (affectedGoals.length === 0) {
    // No goals affected - simple confirmation
    return (
      <ConfirmDialog
        title="Delete Account"
        message={`Are you sure you want to delete "${account.name}"?`}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }
  
  // Goals affected - show detailed warning
  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>
        ⚠️ Delete Account with Goal Links
      </DialogTitle>
      
      <DialogContent>
        <p className="mb-4">
          This account is linked to {affectedGoals.length} goal(s). Deleting it will:
        </p>
        
        <ul className="space-y-2">
          {affectedGoals.map(goal => (
            <li key={goal.id} className="flex items-start gap-2">
              {goal.isLastAccount ? (
                <>
                  <AlertTriangle className="text-orange-500 mt-1" size={16} />
                  <div>
                    <strong>{goal.name}</strong>
                    <p className="text-sm text-gray-600">
                      Will switch to manual tracking (last account removed)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Info className="text-blue-500 mt-1" size={16} />
                  <div>
                    <strong>{goal.name}</strong>
                    <p className="text-sm text-gray-600">
                      Will be removed from allocation (other accounts remain)
                    </p>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
          />
          <span>I understand the impact on these goals</span>
        </label>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onConfirm}
          disabled={!understood}
          variant="destructive"
        >
          Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Migration Script
```sql
-- Migration: YYYYMMDD_fix_asb_and_account_deletion.sql

-- Part 1: Fix existing ASB accounts
UPDATE accounts
SET 
  asb_unit_price = 1.00,
  asb_units_held = current_balance
WHERE account_type = 'ASB'
  AND (asb_unit_price IS NULL OR asb_unit_price != 1.00);

-- Part 2: Add ASB unit price constraint
ALTER TABLE accounts
  ADD CONSTRAINT IF NOT EXISTS asb_unit_price_must_be_one
  CHECK (
    account_type != 'ASB' OR 
    asb_unit_price = 1.00 OR 
    asb_unit_price IS NULL
  );

-- Part 3: Update sync function
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_type = 'ASB' THEN
    NEW.asb_unit_price := 1.00;
    NEW.asb_units_held := NEW.current_balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Part 4: Create account-goal removal handler
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
DECLARE
  remaining_accounts INTEGER;
  goal_name TEXT;
BEGIN
  SELECT COUNT(*) INTO remaining_accounts
  FROM account_goals
  WHERE goal_id = OLD.goal_id AND id != OLD.id;
  
  IF remaining_accounts = 0 THEN
    SELECT name INTO goal_name FROM goals WHERE id = OLD.goal_id;
    
    UPDATE goals
    SET 
      is_manual_goal = true,
      current_amount = (
        SELECT COALESCE(SUM(a.current_balance), 0)
        FROM accounts a
        JOIN account_goals ag ON a.id = ag.account_id
        WHERE ag.goal_id = OLD.goal_id
      )
    WHERE id = OLD.goal_id;
    
    INSERT INTO notifications (user_id, notification_type, title, message)
    SELECT 
      user_id,
      'goal_update',
      'Goal Tracking Mode Changed',
      'Goal "' || goal_name || '" switched to manual tracking.'
    FROM goals
    WHERE id = OLD.goal_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Part 5: Create trigger
DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
CREATE TRIGGER before_account_goal_delete
  BEFORE DELETE ON account_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_goal_removal();

-- Rollback
-- ALTER TABLE accounts DROP CONSTRAINT IF EXISTS asb_unit_price_must_be_one;
-- DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
-- DROP FUNCTION IF EXISTS handle_account_goal_removal();
```

### Component Updates Required
- `src/components/accounts/AccountForm.tsx` - Disable unit_price for ASB
- `src/components/accounts/AccountDeleteWarning.tsx` - New component for deletion warnings
- `src/components/EnhancedDashboard.tsx` - Use AccountDeleteWarning before deletion
- `src/utils/validation.ts` - Add ASB validation helpers
