# Testing Verification Guide

**Change Proposal:** fix-critical-bugs-2025-01  
**Purpose:** Verify all 5 critical bug fixes work correctly

## Test Scenarios

### ✅ Bug #1: Goal Progress Inconsistency

**Problem:** Goals couldn't distinguish between manual and account-linked tracking
**Fix:** Added `is_manual_goal` flag with UI indicators

#### Test Steps:
1. **Create Manual Goal**
   - Go to Goals section
   - Create a new goal without linking accounts
   - ✅ Verify badge shows "Manual" with hand icon (purple)
   - ✅ Verify `is_manual_goal = true` in database

2. **Create Account-Linked Goal**
   - Create goal and link to an account
   - ✅ Verify badge shows "Account-Linked" with link icon (blue)
   - ✅ Verify `is_manual_goal = false` in database

3. **Test Mode Switching**
   - Create account-linked goal
   - Remove the linked account
   - ✅ Verify goal automatically switches to manual mode
   - ✅ Verify notification is created about the switch
   - ✅ Verify badge changes to "Manual"

**SQL Verification:**
```sql
-- Check is_manual_goal field exists and is set correctly
SELECT id, name, is_manual_goal, 
  (SELECT COUNT(*) FROM account_goals WHERE goal_id = goals.id) as account_count
FROM goals;

-- Manual goals should have account_count = 0
-- Account-linked goals should have account_count > 0
```

---

### ✅ Bug #2: Duplicate Achievement Unlocking

**Problem:** Multiple concurrent checks could unlock same achievement multiple times
**Fix:** Used `upsert()` with `ignoreDuplicates: true`

#### Test Steps:
1. **Single Achievement Unlock**
   - Perform action that triggers achievement
   - ✅ Verify achievement appears once in user_achievements
   - ✅ Verify single notification created

2. **Rapid Concurrent Unlocks** (needs manual testing)
   - Perform multiple actions quickly that trigger same achievement
   - ✅ Verify only ONE entry in user_achievements
   - ✅ Verify no error messages in console

**SQL Verification:**
```sql
-- Check for duplicate achievements (should return 0 rows)
SELECT user_id, achievement_type, COUNT(*) as duplicate_count
FROM user_achievements
GROUP BY user_id, achievement_type
HAVING COUNT(*) > 1;

-- Verify unique constraint exists
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'user_achievements'::regclass
  AND contype = 'u';
```

---

### ✅ Bug #3: Orphaned Account-Goal Relationships

**Problem:** Removing last linked account left goal in limbo
**Fix:** Trigger auto-switches goal to manual mode

#### Test Steps:
1. **Remove Last Account from Goal**
   - Create goal with 1 linked account
   - Delete the account OR unlink it
   - ✅ Verify goal switches to `is_manual_goal = true`
   - ✅ Verify notification created: "Goal '[name]' switched to manual tracking"
   - ✅ Verify badge changes to "Manual"

2. **Remove One of Multiple Accounts**
   - Create goal with 2+ linked accounts
   - Remove one account
   - ✅ Verify goal stays as `is_manual_goal = false`
   - ✅ Verify NO notification created
   - ✅ Verify badge stays "Account-Linked"

**SQL Verification:**
```sql
-- Check trigger exists
SELECT tgname, tgrelid::regclass, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'before_account_goal_delete';

-- Test trigger logic
SELECT id, name, is_manual_goal,
  (SELECT COUNT(*) FROM account_goals WHERE goal_id = goals.id) as account_count
FROM goals
WHERE is_manual_goal = false AND 
  (SELECT COUNT(*) FROM account_goals WHERE goal_id = goals.id) = 0;
-- Should return 0 rows (no account-linked goals with zero accounts)
```

---

### ✅ Bug #4: ASB Unit Price Validation

**Problem:** ASB unit price not enforced to Malaysian standard (RM 1.00)
**Fix:** Added columns, constraint, and sync function

#### Test Steps:
1. **Create New ASB Account**
   - Go to Accounts
   - Add new ASB account with any balance (e.g., RM 5000)
   - ✅ Verify `asb_unit_price = 1.00`
   - ✅ Verify `asb_units_held = current_balance / 1.00` (e.g., 5000 units)

2. **Update ASB Balance**
   - Update existing ASB account balance
   - ✅ Verify `asb_units_held` auto-updates to match balance
   - ✅ Verify `asb_unit_price` remains 1.00

3. **Test Constraint** (via SQL)
   ```sql
   -- This should FAIL with constraint violation
   UPDATE accounts
   SET asb_unit_price = 1.50
   WHERE account_type = 'ASB'
   LIMIT 1;
   -- Expected error: constraint "asb_unit_price_must_be_one"
   ```

**SQL Verification:**
```sql
-- Check all ASB accounts have correct price
SELECT id, name, current_balance, asb_unit_price, asb_units_held
FROM accounts
WHERE account_type = 'ASB';
-- All should have asb_unit_price = 1.00
-- All should have asb_units_held = current_balance

-- Verify constraint exists
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'accounts'::regclass
  AND conname = 'asb_unit_price_must_be_one';
```

---

### ✅ Bug #5: Division by Zero in Progress Calculations

**Problem:** `target_amount = 0` caused crashes in progress calculations
**Fix:** Database constraint + frontend/backend guards

#### Test Steps:
1. **Database Prevention**
   ```sql
   -- This should FAIL with constraint violation
   INSERT INTO goals (user_id, name, target_amount, target_date, priority, category)
   VALUES (
     (SELECT id FROM auth.users LIMIT 1),
     'Test Zero Goal',
     0,  -- INVALID!
     '2025-12-31',
     'medium',
     'savings'
   );
   -- Expected error: constraint "goals_target_amount_positive"
   ```

2. **Frontend Validation**
   - Try to create goal with target amount = 0
   - ✅ Verify error message appears
   - ✅ Verify form won't submit
   - Try negative amount
   - ✅ Verify error message appears

3. **Safe Calculation Fallbacks** (if somehow a zero exists)
   - Manually set a goal's target to 0 (via direct SQL override)
   - View goal in UI
   - ✅ Verify no crash/error
   - ✅ Verify progress shows 0% instead of NaN
   - ✅ Verify exports don't crash

**Code Verification:**
```typescript
// Check formatters.ts
calculateProgress(1000, 0) // Should return 0, not crash
isGoalOnTrack(1000, 0, '2025-12-31') // Should return false, not crash

// Check exportData.ts progress calculations
// All should have: target_amount > 0 ? calculation : 0

// Check GoalProjection.tsx
// Progress bar width should handle zero gracefully
```

**SQL Verification:**
```sql
-- Verify constraint exists
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'goals'::regclass
  AND conname = 'goals_target_amount_positive';

-- Check for any invalid goals (should return 0 rows)
SELECT id, name, target_amount
FROM goals
WHERE target_amount <= 0;
```

---

## Comprehensive Integration Tests

### Test 1: Full Goal Lifecycle
1. Create account-linked goal → verify badge "Account-Linked"
2. Add progress → verify calculations work
3. Remove account → verify switches to manual + notification
4. Add manual progress → verify still calculates correctly
5. Mark complete → verify achievement unlocks (only once)

### Test 2: ASB Investment Journey
1. Create ASB account with RM 10,000
2. Verify units_held = 10,000 and unit_price = 1.00
3. Create goal linked to ASB account
4. Update ASB balance to RM 12,000
5. Verify goal progress updates
6. Verify units auto-sync to 12,000

### Test 3: Multiple Goals Multiple Accounts
1. Create 3 accounts
2. Create goal A linked to accounts 1 & 2
3. Create goal B linked to account 3
4. Remove account 1 → verify goal A stays account-linked
5. Remove account 2 → verify goal A switches to manual
6. Verify goal B unaffected

---

## Automated Test Commands

```bash
# Run TypeScript compilation check
npm run build

# Run linter
npm run lint

# Check for type errors
npx tsc --noEmit

# Verify migrations applied
supabase db diff

# Check database constraints
psql -h localhost -U postgres -d postgres -c "
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid IN ('goals'::regclass, 'accounts'::regclass, 'user_achievements'::regclass)
  AND contype IN ('c', 'u')
ORDER BY table_name, constraint_name;
"
```

---

## Acceptance Criteria

✅ **All tests pass without errors**
✅ **No console errors in browser**
✅ **No database constraint violations**
✅ **UI displays correctly on all screen sizes**
✅ **Notifications appear when expected**
✅ **No crashes during normal user flows**
✅ **Calculations return valid numbers (no NaN/Infinity)**
✅ **Database integrity maintained**

---

## Sign-off

- [ ] All manual tests completed
- [ ] All SQL verifications run successfully
- [ ] No errors in production logs
- [ ] Code review approved
- [ ] Ready for production deployment

**Tested by:** _________________  
**Date:** _________________  
**Environment:** [ ] Local  [ ] Staging  [ ] Production
