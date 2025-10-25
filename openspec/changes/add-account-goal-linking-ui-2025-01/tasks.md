# Implementation Tasks: Add Account-Goal Linking UI

**Change:** add-account-goal-linking-ui-2025-01  
**Status:** PROPOSED  
**Total Estimated Effort:** 16-24 hours

---

## Phase 1: Core Linking UI (8 hours)

### Task 1: Add Tracking Mode Toggle to GoalForm
**Estimate:** 2 hours  
**Files:** `src/components/goals/GoalForm.tsx`

**Subtasks:**
- [ ] Add state: `trackingMode: 'manual' | 'account-linked'`
- [ ] Create radio button group UI component
- [ ] Style toggle with glass-morphism design
- [ ] Show/hide account selector based on mode
- [ ] Handle mode changes (clear selections when switching)
- [ ] Add form field validation based on mode

**Acceptance Criteria:**
- Toggle renders at top of form
- Default to 'manual' for new goals
- Default to current mode for edit goals
- Visual feedback on selection
- Mode persists when navigating form

---

### Task 2: Create Account Multi-Select Component
**Estimate:** 3 hours  
**Files:** 
- `src/components/goals/AccountSelector.tsx` (NEW)
- `src/components/goals/GoalForm.tsx`

**Subtasks:**
- [ ] Create `AccountSelector` component
- [ ] Fetch user's accounts from database
- [ ] Render checkbox list with account names + balances
- [ ] Add search/filter functionality
- [ ] Handle selection state (array of account IDs)
- [ ] Display "No accounts" state with helpful message
- [ ] Add "Create Account" quick action link

**Component Props:**
```typescript
interface AccountSelectorProps {
  selectedAccounts: SelectedAccount[];
  onSelectionChange: (accounts: SelectedAccount[]) => void;
  userAccounts: Account[];
  loading?: boolean;
}

interface SelectedAccount {
  accountId: string;
  accountName: string;
  currentBalance: number;
  allocationPercentage: number;
}
```

**Acceptance Criteria:**
- Lists all user accounts
- Shows current balance for each
- Checkbox state syncs with parent component
- Disabled state for accounts already at 100% allocation
- Mobile responsive layout

---

### Task 3: Add Allocation Percentage Inputs
**Estimate:** 2 hours  
**Files:** `src/components/goals/AccountSelector.tsx`

**Subtasks:**
- [ ] Add percentage input next to each selected account
- [ ] Implement range validation (0-100)
- [ ] Show RM amount preview next to percentage
- [ ] Calculate and display total allocation
- [ ] Add visual indicator when total > 100%
- [ ] Disable submit if validation fails
- [ ] Add helpful tooltips/help text

**Validation Rules:**
- Individual percentage: 0 ≤ x ≤ 100
- Total allocation: 0 ≤ sum ≤ 100 (warning only)
- Number format: integers only

**Acceptance Criteria:**
- Percentage inputs appear for selected accounts only
- Real-time RM amount calculation
- Total allocation display updates live
- Visual error states for invalid values
- Help text explains allocation concept

---

### Task 4: Implement Goal Creation with Links
**Estimate:** 1 hour  
**Files:** `src/components/goals/GoalForm.tsx`

**Subtasks:**
- [ ] Update `handleSubmit` to check tracking mode
- [ ] Insert goal with correct `is_manual_goal` value
- [ ] Insert account_goals records if account-linked
- [ ] Handle transaction rollback on error
- [ ] Show success message with link count
- [ ] Clear form and close modal on success

**Database Operations:**
```typescript
// 1. Create goal
const { data: goal } = await supabase
  .from('goals')
  .insert({
    ...goalData,
    is_manual_goal: trackingMode === 'manual'
  })
  .select()
  .single();

// 2. If account-linked, create links
if (trackingMode === 'account-linked') {
  const links = selectedAccounts.map(acc => ({
    goal_id: goal.id,
    account_id: acc.accountId,
    allocation_percentage: acc.allocationPercentage
  }));
  
  await supabase.from('account_goals').insert(links);
}
```

**Acceptance Criteria:**
- Goal creates successfully in both modes
- account_goals records created for account-linked goals
- Proper error handling with user-friendly messages
- Loading state during submission
- No partial data on error

---

## Phase 2: Management Interface (6 hours)

### Task 5: Create AccountGoalLinker Modal Component
**Estimate:** 3 hours  
**Files:** 
- `src/components/goals/AccountGoalLinker.tsx` (NEW)
- `src/types/database.ts`

**Subtasks:**
- [ ] Create modal component with backdrop
- [ ] Fetch current goal-account links
- [ ] Fetch user's available accounts
- [ ] Render current links with edit controls
- [ ] Allow adding new account links
- [ ] Allow removing existing links
- [ ] Update allocation percentages
- [ ] Show real-time progress preview
- [ ] Handle save operation
- [ ] Handle cancel (discard changes)

**Component Interface:**
```typescript
interface AccountGoalLinkerProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}
```

**Acceptance Criteria:**
- Modal opens/closes smoothly
- Shows current linked accounts
- Can add/remove accounts
- Can adjust percentages
- Real-time progress calculation
- Validates before saving
- Shows loading states

---

### Task 6: Add "Manage Funding Sources" UI
**Estimate:** 2 hours  
**Files:** 
- `src/components/goals/GoalProjection.tsx`
- `src/components/goals/GoalCard.tsx`

**Subtasks:**
- [ ] Add "Funding Sources" section to GoalProjection
- [ ] Display linked accounts with percentages
- [ ] Show RM contribution from each account
- [ ] Add "Manage" button to open AccountGoalLinker
- [ ] Add "Switch to Manual" button for account-linked goals
- [ ] Add "Link Accounts" button for manual goals
- [ ] Update after save operation
- [ ] Refresh goal data

**UI Layout:**
```
┌─────────────────────────────────────────┐
│ 📊 Funding Sources                      │
│ ┌───────────────────────────────────┐   │
│ │ Savings Account A  50%  RM 15,000 │   │
│ │ ASB Investment     30%  RM  9,000 │   │
│ │ Manual Amount      20%  RM  1,000 │   │
│ └───────────────────────────────────┘   │
│                                         │
│ [Manage Sources] [Switch to Manual]    │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- Section shows for account-linked goals
- Lists all linked accounts
- Shows percentages and amounts
- Buttons trigger correct actions
- Mobile responsive

---

### Task 7: Implement Link Update Operations
**Estimate:** 1 hour  
**Files:** `src/components/goals/AccountGoalLinker.tsx`

**Subtasks:**
- [ ] Implement add link operation
- [ ] Implement update allocation operation
- [ ] Implement delete link operation
- [ ] Handle optimistic updates
- [ ] Refresh parent component data
- [ ] Show success/error notifications

**Database Operations:**
```typescript
// Add link
await supabase.from('account_goals').insert({
  goal_id: goalId,
  account_id: accountId,
  allocation_percentage: percentage
});

// Update allocation
await supabase
  .from('account_goals')
  .update({ allocation_percentage: newPercentage })
  .eq('goal_id', goalId)
  .eq('account_id', accountId);

// Delete link
await supabase
  .from('account_goals')
  .delete()
  .eq('goal_id', goalId)
  .eq('account_id', accountId);
```

**Acceptance Criteria:**
- CRUD operations work correctly
- UI updates after each operation
- Proper error handling
- Loading indicators
- Success notifications

---

## Phase 3: Mode Switching (4 hours)

### Task 8: Implement Manual → Account-Linked Switch
**Estimate:** 1.5 hours  
**Files:** 
- `src/components/goals/GoalProjection.tsx`
- `src/components/goals/GoalCard.tsx`

**Subtasks:**
- [ ] Add "Link Accounts" button for manual goals
- [ ] Open AccountGoalLinker on click
- [ ] Allow account selection
- [ ] Update `is_manual_goal = false` after linking
- [ ] Keep `manual_amount` intact
- [ ] Update badge to "Account-Linked"
- [ ] Show success notification
- [ ] Refresh goal progress

**Business Logic:**
```typescript
// When linking accounts to manual goal
// 1. Create account_goals entries
// 2. is_manual_goal automatically updates to false (trigger)
// 3. Total progress = account progress + manual_amount
```

**Acceptance Criteria:**
- Button appears on manual goals
- Links accounts successfully
- Flag updates to false
- Manual amount preserved
- Badge changes
- Progress recalculates

---

### Task 9: Implement Account-Linked → Manual Switch
**Estimate:** 1.5 hours  
**Files:** `src/components/goals/GoalProjection.tsx`

**Subtasks:**
- [ ] Add "Switch to Manual" button for account-linked goals
- [ ] Show confirmation dialog
- [ ] Explain consequences (unlink accounts)
- [ ] Option to preserve current progress as manual amount
- [ ] Delete all account_goals entries
- [ ] Trigger sets `is_manual_goal = true` automatically
- [ ] Update badge to "Manual"
- [ ] Show success notification

**Confirmation Dialog:**
```
┌──────────────────────────────────────────────┐
│ Switch to Manual Tracking?                   │
│                                              │
│ This will unlink all accounts from this      │
│ goal. Your current progress (RM 24,000)      │
│ can be preserved as manual amount.           │
│                                              │
│ ☑ Save current progress as manual amount    │
│                                              │
│ [Cancel] [Switch to Manual]                  │
└──────────────────────────────────────────────┘
```

**Database Operations:**
```typescript
// 1. Optionally save current progress
if (saveProgress) {
  const currentProgress = calculateAccountProgress();
  await supabase
    .from('goals')
    .update({ manual_amount: currentProgress })
    .eq('id', goalId);
}

// 2. Delete all links (trigger handles is_manual_goal)
await supabase
  .from('account_goals')
  .delete()
  .eq('goal_id', goalId);
```

**Acceptance Criteria:**
- Confirmation dialog shows
- User can choose to preserve progress
- All links deleted
- Flag automatically set to true (trigger)
- Badge updates
- No data loss

---

### Task 10: Add Mode Switch Notifications
**Estimate:** 1 hour  
**Files:** `src/components/goals/GoalProjection.tsx`

**Subtasks:**
- [ ] Create notification when switching to account-linked
- [ ] Create notification when switching to manual
- [ ] Create notification when last account deleted (trigger-based)
- [ ] Add notification icon and styling
- [ ] Link to goal from notification
- [ ] Auto-dismiss after 10 seconds

**Notification Templates:**
```typescript
// Manual → Account-Linked
{
  title: 'Goal Tracking Updated',
  message: `"${goalName}" is now tracking progress from ${accountCount} linked accounts.`,
  type: 'success',
  icon: 'link'
}

// Account-Linked → Manual
{
  title: 'Switched to Manual Tracking',
  message: `"${goalName}" is now manually tracked. Use "Update Progress" to add amounts.`,
  type: 'info',
  icon: 'hand'
}

// Auto-switch (trigger)
{
  title: 'Goal Tracking Changed',
  message: `"${goalName}" was automatically switched to manual tracking after the last linked account was removed.`,
  type: 'warning',
  icon: 'alert-circle'
}
```

**Acceptance Criteria:**
- Notifications appear on mode switch
- Appropriate icons and colors
- Clear, helpful messages
- Auto-dismiss functionality
- Link to goal works

---

## Phase 4: Polish & UX (6 hours)

### Task 11: Add Loading States and Error Handling
**Estimate:** 2 hours  
**Files:** All components

**Subtasks:**
- [ ] Add loading spinners during data fetch
- [ ] Add skeleton loaders for account lists
- [ ] Disable buttons during operations
- [ ] Show progress indicators for saves
- [ ] Handle network errors gracefully
- [ ] Add retry mechanisms
- [ ] Show user-friendly error messages
- [ ] Log errors to console for debugging

**Error Scenarios:**
- Network timeout
- Database constraint violation
- Concurrent modification
- Permission denied
- No accounts available

**Acceptance Criteria:**
- All async operations show loading state
- Errors display helpful messages
- Retry options where appropriate
- No silent failures
- Good user experience even on slow connections

---

### Task 12: Mobile Responsiveness
**Estimate:** 2 hours  
**Files:** All components

**Subtasks:**
- [ ] Test on mobile viewport (375px, 414px)
- [ ] Adjust modal sizes for mobile
- [ ] Stack elements vertically on small screens
- [ ] Increase touch target sizes (min 44px)
- [ ] Test percentage inputs on mobile keyboard
- [ ] Optimize account list scrolling
- [ ] Fix any overflow issues
- [ ] Test on actual devices (iOS, Android)

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Acceptance Criteria:**
- All features work on mobile
- No horizontal scrolling
- Touch-friendly controls
- Readable text sizes
- Smooth scrolling

---

### Task 13: Add Inline Help and Tooltips
**Estimate:** 1 hour  
**Files:** All components

**Subtasks:**
- [ ] Add tooltip to tracking mode toggle
- [ ] Add help text for allocation percentages
- [ ] Add examples of allocation scenarios
- [ ] Add info icon next to "Total Allocation"
- [ ] Add empty state messages
- [ ] Add success state messages
- [ ] Create FAQ section (optional)

**Help Text Examples:**
```
Tracking Mode:
"Choose how to track this goal's progress:
• Manual: You manually update progress
• Linked Accounts: Progress calculated from account balances"

Allocation Percentage:
"What portion of this account should count toward this goal?
Example: Setting 50% means half of the account's balance will count as progress."

Total Allocation:
"The sum of all allocations. This can be less than 100% if some funds are for other goals, or 100% if fully dedicated."
```

**Acceptance Criteria:**
- Helpful tooltips on hover/focus
- Clear explanations
- Examples provided
- Not intrusive
- Accessible (keyboard navigation)

---

### Task 14: Create Database Index
**Estimate:** 0.5 hours  
**Files:** `supabase/migrations/20250124HHMMSS_add_account_goals_index.sql`

**Subtasks:**
- [ ] Create migration file
- [ ] Add index on `account_goals(goal_id)`
- [ ] Add index on `account_goals(account_id)` if not exists
- [ ] Test migration locally
- [ ] Verify query performance improvement

**Migration:**
```sql
-- Add index for faster goal-to-accounts lookups
CREATE INDEX IF NOT EXISTS idx_account_goals_goal_id 
  ON account_goals(goal_id);

-- Add index for faster account-to-goals lookups
CREATE INDEX IF NOT EXISTS idx_account_goals_account_id 
  ON account_goals(account_id);

-- Composite index for unique constraint efficiency
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_goals_unique 
  ON account_goals(account_id, goal_id);
```

**Acceptance Criteria:**
- Index created successfully
- Query performance improved
- No breaking changes
- Backward compatible

---

### Task 15: Comprehensive Testing
**Estimate:** 1.5 hours  
**Files:** All components

**Test Scenarios:**
- [ ] Create account-linked goal with 1 account
- [ ] Create account-linked goal with 3 accounts
- [ ] Create manual goal
- [ ] Edit account-linked goal allocations
- [ ] Switch manual → account-linked
- [ ] Switch account-linked → manual (preserve progress)
- [ ] Switch account-linked → manual (don't preserve)
- [ ] Delete account that's linked to goal (verify cascade)
- [ ] Delete last linked account (verify auto-switch)
- [ ] Test validation (over 100% allocation)
- [ ] Test with 0 accounts available
- [ ] Test with 50+ accounts (performance)
- [ ] Test mobile responsiveness
- [ ] Test error scenarios (network failure, permission denied)
- [ ] Test concurrent edits

**Acceptance Criteria:**
- All test scenarios pass
- No console errors
- Good performance
- Data integrity maintained
- UI responsive and intuitive

---

## Additional Tasks

### Task 16: Update Documentation
**Estimate:** 1 hour  
**Files:**
- `openspec/specs/goal-tracking/spec.md`
- `README.md`
- User guide (if exists)

**Subtasks:**
- [ ] Document new account-linking feature
- [ ] Add screenshots of UI
- [ ] Update user flow diagrams
- [ ] Document allocation percentage concept
- [ ] Add FAQ entries
- [ ] Update API documentation (if needed)

---

### Task 17: Create Migration Guide (Optional)
**Estimate:** 0.5 hours  
**Files:** `docs/MIGRATION_GUIDE_ACCOUNT_LINKING.md`

**Content:**
- Explain new feature to existing users
- How to convert manual goals to account-linked
- Benefits of account linking
- Common scenarios and best practices

---

## Summary

**Total Tasks:** 17  
**Total Estimated Effort:** 18.5 hours  
**Phases:** 4

**Phase Breakdown:**
- Phase 1: Core Linking UI - 8 hours (Tasks 1-4)
- Phase 2: Management Interface - 6 hours (Tasks 5-7)
- Phase 3: Mode Switching - 4 hours (Tasks 8-10)
- Phase 4: Polish & UX - 6.5 hours (Tasks 11-15, 17)

**Critical Path:**
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 15

**Can Be Parallelized:**
- Tasks 8, 9, 10 (mode switching features)
- Tasks 11, 12, 13 (polish tasks)
- Task 14 (database index)
- Task 16 (documentation)

---

## Sign-off

- [ ] All tasks reviewed
- [ ] Estimates validated
- [ ] Dependencies identified
- [ ] Ready to begin implementation

**Reviewer:** _________________  
**Date:** _________________
