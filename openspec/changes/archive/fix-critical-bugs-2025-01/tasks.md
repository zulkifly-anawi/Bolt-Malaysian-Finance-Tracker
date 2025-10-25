# Implementation Tasks

## Phase 1: Database Migrations (Non-Breaking)

### Task 1.1: Add is_manual_goal column to goals table
- [ ] Create migration file `YYYYMMDD_add_is_manual_goal_to_goals.sql`
- [ ] Add column: `ALTER TABLE goals ADD COLUMN is_manual_goal BOOLEAN DEFAULT false`
- [ ] Backfill existing data based on account_goals existence
- [ ] Test migration on local database
- [ ] Add rollback statement

**Estimated Time:** 2 hours
**Dependencies:** None
**Assignee:** Backend developer

### Task 1.2: Add ASB unit price constraint
- [ ] Create migration file `YYYYMMDD_enforce_asb_unit_price.sql`
- [ ] Update all existing ASB accounts to have unit_price = 1.00
- [ ] Add constraint: `CHECK (account_type != 'ASB' OR asb_unit_price = 1.00)`
- [ ] Test with valid and invalid data
- [ ] Add rollback statement

**Estimated Time:** 2 hours
**Dependencies:** None
**Assignee:** Backend developer

### Task 1.3: Add goal target amount validation
- [ ] Create migration file `YYYYMMDD_validate_goal_target_amount.sql`
- [ ] Check existing goals for target_amount <= 0 (should be none)
- [ ] Add constraint: `CHECK (target_amount > 0)`
- [ ] Test constraint enforcement
- [ ] Add rollback statement

**Estimated Time:** 1 hour
**Dependencies:** None
**Assignee:** Backend developer

### Task 1.4: Create account-goal removal trigger
- [ ] Create migration file `YYYYMMDD_add_account_goal_removal_trigger.sql`
- [ ] Create function `handle_account_goal_removal()`
- [ ] Create BEFORE DELETE trigger on account_goals
- [ ] Test trigger with various scenarios
- [ ] Add rollback statement

**Estimated Time:** 3 hours
**Dependencies:** Task 1.1 (needs is_manual_goal column)
**Assignee:** Backend developer

### Task 1.5: Update sync_asb_units_held function
- [ ] Create migration file `YYYYMMDD_update_asb_sync_function.sql`
- [ ] Replace function to enforce unit_price = 1.00
- [ ] Ensure units_held = current_balance for ASB
- [ ] Test with ASB account updates
- [ ] Add rollback statement

**Estimated Time:** 2 hours
**Dependencies:** None
**Assignee:** Backend developer

## Phase 2: Backend Logic Updates

### Task 2.1: Update achievement checker with duplicate prevention
- [ ] Modify `src/utils/achievementChecker.ts`
- [ ] Add `.select().single()` to insert query
- [ ] Check if insert succeeded before creating notification
- [ ] Add error handling for duplicate attempts
- [ ] Update function return type to indicate success

**Estimated Time:** 2 hours
**Dependencies:** None
**Assignee:** Frontend developer

### Task 2.2: Update goal progress calculation logic
- [ ] Create/update utility function in `src/utils/formatters.ts`
- [ ] Implement logic: if account_goals exists, sum balances; else use current_amount
- [ ] Add safety check for is_manual_goal flag
- [ ] Handle edge cases (no accounts, deleted accounts)
- [ ] Update all components using progress calculation

**Estimated Time:** 4 hours
**Dependencies:** Task 1.1 (needs is_manual_goal column)
**Assignee:** Frontend developer

### Task 2.3: Add division by zero protection
- [ ] Update `calculateProgress()` in `src/utils/formatters.ts`
- [ ] Add check: `if (target <= 0) return 0`
- [ ] Add unit tests for edge cases
- [ ] Document behavior in JSDoc comments

**Estimated Time:** 1 hour
**Dependencies:** None
**Assignee:** Frontend developer

## Phase 3: Frontend Updates

### Task 3.1: Add goal form validation
- [ ] Update `src/components/goals/GoalForm.tsx`
- [ ] Add validation: target_amount > 0
- [ ] Show user-friendly error message
- [ ] Prevent form submission with invalid data
- [ ] Add client-side validation before API call

**Estimated Time:** 2 hours
**Dependencies:** None
**Assignee:** Frontend developer

### Task 3.2: Add goal tracking mode indicators
- [ ] Update `src/components/goals/GoalCard.tsx`
- [ ] Show badge: "Manual" vs "Account-Linked"
- [ ] Add tooltip explaining difference
- [ ] Style indicators clearly
- [ ] Add help link to documentation

**Estimated Time:** 3 hours
**Dependencies:** Task 2.2
**Assignee:** Frontend developer

### Task 3.3: Add account removal warning
- [ ] Update account deletion flow
- [ ] Check if account is last one linked to goals
- [ ] Show warning: "This will switch X goals to manual tracking"
- [ ] Add confirmation dialog
- [ ] Show which goals will be affected

**Estimated Time:** 3 hours
**Dependencies:** Task 1.4
**Assignee:** Frontend developer

### Task 3.4: Update goal progress display
- [ ] Update `src/components/goals/GoalProjection.tsx`
- [ ] Use new calculation logic
- [ ] Show data source (accounts vs manual)
- [ ] Add refresh button for account-linked goals
- [ ] Handle loading states

**Estimated Time:** 2 hours
**Dependencies:** Task 2.2
**Assignee:** Frontend developer

### Task 3.5: Add ASB account creation restrictions
- [ ] Update `src/components/accounts/AccountForm.tsx`
- [ ] When ASB selected, disable unit_price field
- [ ] Show helper text: "ASB units = RM 1.00 each"
- [ ] Auto-fill unit_price = 1.00
- [ ] Validate on submit

**Estimated Time:** 2 hours
**Dependencies:** None
**Assignee:** Frontend developer

## Phase 4: Testing

### Task 4.1: Write unit tests for achievement checker
- [ ] Test duplicate prevention (concurrent calls)
- [ ] Test notification only on successful insert
- [ ] Test error handling
- [ ] Mock Supabase responses
- [ ] Achieve 100% code coverage

**Estimated Time:** 3 hours
**Dependencies:** Task 2.1
**Assignee:** QA/Developer

### Task 4.2: Write unit tests for goal progress
- [ ] Test account-linked calculation
- [ ] Test manual goal calculation
- [ ] Test division by zero protection
- [ ] Test edge cases (null values, empty arrays)
- [ ] Achieve 100% code coverage

**Estimated Time:** 3 hours
**Dependencies:** Task 2.2, Task 2.3
**Assignee:** QA/Developer

### Task 4.3: Write integration tests for goal lifecycle
- [ ] Test creating goal with accounts
- [ ] Test adding/removing accounts from goal
- [ ] Test switching from account-linked to manual
- [ ] Test progress calculation throughout lifecycle
- [ ] Test with real database (local)

**Estimated Time:** 4 hours
**Dependencies:** All Phase 1-3 tasks
**Assignee:** QA Lead

### Task 4.4: Write integration tests for ASB accounts
- [ ] Test creating ASB account
- [ ] Test updating ASB balance
- [ ] Test unit_price enforcement
- [ ] Test units_held synchronization
- [ ] Test constraint violations

**Estimated Time:** 2 hours
**Dependencies:** Task 1.2, Task 1.5
**Assignee:** QA/Developer

### Task 4.5: Perform manual QA testing
- [ ] Test all goal tracking scenarios
- [ ] Test achievement unlocking
- [ ] Test ASB account management
- [ ] Test edge cases and error states
- [ ] Document findings in test report

**Estimated Time:** 4 hours
**Dependencies:** All previous tasks
**Assignee:** QA Lead

## Phase 5: Documentation

### Task 5.1: Update OpenSpec specifications
- [ ] Update `goal-tracking/spec.md` with new behavior
- [ ] Update `account-management/spec.md` with ASB rules
- [ ] Update `achievement-system/spec.md` with duplicate prevention
- [ ] Add scenarios for new validations
- [ ] Run `openspec validate --strict`

**Estimated Time:** 3 hours
**Dependencies:** All implementation complete
**Assignee:** Tech Lead

### Task 5.2: Update user documentation
- [ ] Create guide: "Understanding Goal Tracking Modes"
- [ ] Update FAQ with common questions
- [ ] Add troubleshooting section
- [ ] Update help tooltips in app
- [ ] Create migration guide for existing users

**Estimated Time:** 4 hours
**Dependencies:** None
**Assignee:** Technical Writer

### Task 5.3: Update API documentation
- [ ] Document new validations
- [ ] Document new database fields
- [ ] Document trigger behavior
- [ ] Add examples for common operations
- [ ] Update error codes documentation

**Estimated Time:** 2 hours
**Dependencies:** All Phase 1 complete
**Assignee:** Backend developer

## Phase 6: Deployment

### Task 6.1: Deploy to staging environment
- [ ] Run all migrations in order
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify all features working
- [ ] Run smoke tests

**Estimated Time:** 2 hours
**Dependencies:** All Phase 1-5 complete
**Assignee:** DevOps

### Task 6.2: Perform staging validation
- [ ] Run full test suite
- [ ] Perform manual exploratory testing
- [ ] Test with production-like data
- [ ] Check error logs for issues
- [ ] Get stakeholder sign-off

**Estimated Time:** 3 hours
**Dependencies:** Task 6.1
**Assignee:** QA Lead

### Task 6.3: Deploy to production
- [ ] Schedule maintenance window
- [ ] Run migrations during low-traffic period
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Monitor error rates
- [ ] Verify critical paths working

**Estimated Time:** 2 hours
**Dependencies:** Task 6.2
**Assignee:** DevOps

### Task 6.4: Post-deployment monitoring
- [ ] Monitor error logs for 24 hours
- [ ] Check achievement duplication rate
- [ ] Verify ASB accounts compliance
- [ ] Check user feedback/support tickets
- [ ] Document any issues found

**Estimated Time:** 4 hours (spread over 24h)
**Dependencies:** Task 6.3
**Assignee:** DevOps + Support

## Summary

**Total Estimated Time:** ~60 hours
**Team Required:** 
- 1 Backend Developer (15 hours)
- 1 Frontend Developer (20 hours)
- 1 QA Lead (15 hours)
- 1 DevOps Engineer (8 hours)
- 1 Technical Writer (4 hours)

**Critical Path:**
1. Phase 1 (Migrations) → Phase 2 (Logic) → Phase 3 (UI) → Phase 4 (Testing) → Phase 6 (Deployment)
2. Phase 5 (Documentation) can run parallel with Phase 4

**Risks:**
- Migration failures on production data
- User confusion during transition
- Performance impact of new trigger

**Mitigation:**
- Test migrations on production snapshot
- Staged rollout with feature flags
- Monitor performance metrics closely
