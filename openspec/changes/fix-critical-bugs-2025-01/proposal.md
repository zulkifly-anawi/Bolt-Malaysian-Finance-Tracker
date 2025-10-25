# Fix Critical Bugs - January 2025

## Summary
Addresses 5 critical bugs identified through spec analysis that could cause data inconsistency, duplicate records, incorrect calculations, and poor user experience.

## Motivation
These bugs represent fundamental issues in core functionality:
1. **Goal Progress Inconsistency** - Two conflicting sources of truth for goal progress
2. **Achievement Duplicate Awards** - Race conditions in concurrent achievement checks
3. **Orphaned Account-Goal Relationships** - Undefined behavior when removing accounts from goals
4. **ASB Unit Price Validation** - Allows incorrect values violating Malaysian ASB principles
5. **Division by Zero in Progress** - Crashes when goal has zero target amount

## Goals
- Establish single source of truth for goal progress calculation
- Prevent duplicate achievement awards under concurrent operations
- Define clear behavior for account-goal relationship lifecycle
- Enforce ASB unit price = RM 1.00 (Malaysian standard)
- Add validation to prevent invalid goal configurations

## Non-Goals
- Implementing transaction/expense tracking (separate feature)
- Multi-currency support (separate feature)
- Fixing low-priority UI/UX issues
- Performance optimizations unrelated to these bugs

## Proposed Solution

### 1. Goal Progress Single Source of Truth
**Current Problem:** Both `goals.current_amount` (manual) and `account_goals` (calculated) exist, causing confusion.

**Solution:** 
- Make progress calculation the single source of truth
- Deprecate manual `current_amount` updates
- Calculate progress as: `SUM(linked_accounts.current_balance)` OR `current_amount` (if no accounts linked)
- Add `is_manual_goal` boolean flag to distinguish goal types

**Database Changes:**
```sql
ALTER TABLE goals ADD COLUMN is_manual_goal BOOLEAN DEFAULT false;
```

**Logic:**
- If `account_goals` exists → calculate from accounts (ignore `current_amount`)
- If no `account_goals` → use manual `current_amount`
- Clear indicator in UI which mode goal is in

### 2. Achievement Duplicate Prevention
**Current Problem:** Race condition allows multiple concurrent award attempts.

**Solution:**
- Add `ON CONFLICT DO NOTHING` to achievement insert
- Return boolean indicating if award was successful
- Only create notification if insert succeeded

**Code Changes:**
```typescript
// achievementChecker.ts
const { data, error } = await supabase
  .from('user_achievements')
  .insert({
    user_id: userId,
    achievement_type: achievement.type,
    // ... other fields
  })
  .select()
  .single();

if (data) {
  // Only create notification if insert succeeded (not a duplicate)
  await createNotification(...);
}
```

**Database:**
```sql
-- Ensure UNIQUE constraint exists (already present)
ALTER TABLE user_achievements 
  ADD CONSTRAINT user_achievements_user_achievement_unique 
  UNIQUE (user_id, achievement_id);
```

### 3. Account-Goal Relationship Lifecycle
**Current Problem:** Removing all accounts from goal leaves goal in undefined state.

**Solution:**
- When last account removed from goal:
  - Set `is_manual_goal = true`
  - Keep last calculated `current_amount` as starting point
  - Show notification: "Goal switched to manual tracking"
- Add database trigger to handle this automatically

**Database Changes:**
```sql
CREATE OR REPLACE FUNCTION handle_account_goal_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this was the last account for this goal
  IF NOT EXISTS (
    SELECT 1 FROM account_goals 
    WHERE goal_id = OLD.goal_id AND id != OLD.id
  ) THEN
    -- Switch goal to manual mode and preserve current progress
    UPDATE goals
    SET 
      is_manual_goal = true,
      current_amount = (
        SELECT COALESCE(SUM(current_balance), 0)
        FROM accounts
        WHERE id IN (
          SELECT account_id FROM account_goals WHERE goal_id = OLD.goal_id
        )
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

### 4. ASB Unit Price Enforcement
**Current Problem:** Function allows custom `asb_unit_price`, but ASB is ALWAYS RM 1.00/unit.

**Solution:**
- Enforce `asb_unit_price = 1.00` for ASB accounts
- Update trigger to set price automatically
- Add database constraint
- Simplify: `asb_units_held` always equals `current_balance`

**Database Changes:**
```sql
-- Update trigger to enforce ASB rules
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to ASB accounts
  IF NEW.account_type = 'ASB' THEN
    -- ASB unit price is ALWAYS RM 1.00
    NEW.asb_unit_price := 1.00;
    -- Units = Balance (1:1 ratio)
    NEW.asb_units_held := NEW.current_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint
ALTER TABLE accounts
  ADD CONSTRAINT asb_unit_price_must_be_one
  CHECK (
    account_type != 'ASB' OR asb_unit_price = 1.00
  );
```

### 5. Division by Zero Protection
**Current Problem:** Creating goal with `target_amount = 0` causes division by zero.

**Solution:**
- Add database constraint: `target_amount > 0`
- Add UI validation before submission
- Add utility function safety check

**Database Changes:**
```sql
ALTER TABLE goals
  ADD CONSTRAINT goals_target_amount_positive
  CHECK (target_amount > 0);
```

**Code Changes:**
```typescript
// formatters.ts
export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0; // Safety check
  return Math.min((current / target) * 100, 100);
};

// GoalForm.tsx validation
if (targetAmount <= 0) {
  setError('Target amount must be greater than 0');
  return;
}
```

## Implementation Plan

### Phase 1: Database Migrations (Non-Breaking)
1. Create migration for `is_manual_goal` column
2. Create migration for ASB unit price constraint
3. Create migration for goal target amount constraint
4. Create trigger for account-goal removal handler

### Phase 2: Backend Logic Updates
1. Update `achievementChecker.ts` with ON CONFLICT handling
2. Update goal progress calculation logic
3. Update ASB sync trigger function
4. Add validation utilities

### Phase 3: Frontend Updates
1. Update `GoalForm.tsx` with validation
2. Update `calculateProgress()` with safety checks
3. Update goal display to show manual vs. account-linked mode
4. Add UI indicators for goal tracking mode

### Phase 4: Testing
1. Test goal progress calculation in both modes
2. Test concurrent achievement awards
3. Test account removal from goals
4. Test ASB account creation/updates
5. Test goal creation with invalid amounts

## Testing Strategy

### Unit Tests
```typescript
describe('Goal Progress Calculation', () => {
  it('should use account balances when accounts linked', async () => {
    // Create goal with linked accounts
    // Verify progress comes from account sum
  });
  
  it('should use manual amount when no accounts linked', async () => {
    // Create manual goal
    // Verify progress uses current_amount
  });
  
  it('should switch to manual when last account removed', async () => {
    // Link account, then remove it
    // Verify is_manual_goal = true
  });
});

describe('Achievement Awards', () => {
  it('should not award duplicate achievements', async () => {
    // Trigger achievement multiple times concurrently
    // Verify only one award + notification
  });
});

describe('ASB Account', () => {
  it('should enforce unit price = 1.00', async () => {
    // Try creating ASB with different price
    // Verify price is forced to 1.00
  });
  
  it('should sync units = balance', async () => {
    // Update ASB balance
    // Verify units_held matches exactly
  });
});

describe('Goal Validation', () => {
  it('should reject zero target amount', async () => {
    // Try creating goal with target = 0
    // Verify validation error
  });
  
  it('should reject negative target amount', async () => {
    // Try creating goal with target < 0
    // Verify validation error
  });
});
```

### Integration Tests
- Full goal lifecycle with account allocation
- Multiple concurrent users completing goals
- ASB account creation and balance updates
- Data export with edge cases

## Migration Strategy

### Backward Compatibility
1. Existing goals without `is_manual_goal` flag → defaults to `false`
2. System detects if goal has account_goals:
   - If yes: keep as account-linked
   - If no: set `is_manual_goal = true`

### Data Migration Script
```sql
-- Backfill is_manual_goal based on existing data
UPDATE goals
SET is_manual_goal = NOT EXISTS (
  SELECT 1 FROM account_goals WHERE goal_id = goals.id
)
WHERE is_manual_goal IS NULL;

-- Fix any ASB accounts with incorrect unit prices
UPDATE accounts
SET 
  asb_unit_price = 1.00,
  asb_units_held = current_balance
WHERE account_type = 'ASB';
```

## Risks and Mitigations

### Risk 1: Breaking Existing Goals
**Mitigation:** 
- Add migration to backfill `is_manual_goal` correctly
- Test with production data snapshot
- Provide rollback migration

### Risk 2: User Confusion (Manual vs. Account-Linked)
**Mitigation:**
- Clear UI indicators showing goal mode
- Help text explaining difference
- Smooth transition messaging when mode changes

### Risk 3: Performance Impact (Trigger on Delete)
**Mitigation:**
- Trigger only fires on account_goals deletion (rare event)
- Simple EXISTS check is fast
- Add index on `account_goals(goal_id)` if needed

## Rollback Plan

Each migration includes rollback:
```sql
-- Rollback migration
ALTER TABLE goals DROP COLUMN IF EXISTS is_manual_goal;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS asb_unit_price_must_be_one;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_target_amount_positive;
DROP TRIGGER IF EXISTS before_account_goal_delete ON account_goals;
DROP FUNCTION IF EXISTS handle_account_goal_removal();
```

## Success Metrics

1. **Zero duplicate achievements** - Monitor achievement table for duplicates
2. **No division by zero errors** - Check error logs for progress calculation failures
3. **100% ASB compliance** - All ASB accounts have unit_price = 1.00
4. **Clear goal state** - All goals have explicit is_manual_goal value
5. **No orphaned states** - No goals with 0 accounts but is_manual_goal = false

## Documentation Updates

- Update `goal-tracking/spec.md` to clarify single source of truth
- Update `account-management/spec.md` to document ASB unit price enforcement
- Update `achievement-system/spec.md` to document duplicate prevention
- Add troubleshooting guide for goal tracking modes
- Update API documentation with new validations

## Timeline

- **Week 1:** Database migrations + triggers
- **Week 2:** Backend logic updates + unit tests
- **Week 3:** Frontend updates + integration tests
- **Week 4:** User testing + documentation

## Approval Required
- [ ] Product Owner - Approve goal tracking behavior change
- [ ] Tech Lead - Review database changes
- [ ] Security - Review constraint additions
- [ ] QA - Review testing strategy

## Related Issues
- Links to GitHub issues (if any)
- Links to user bug reports
- Links to support tickets
