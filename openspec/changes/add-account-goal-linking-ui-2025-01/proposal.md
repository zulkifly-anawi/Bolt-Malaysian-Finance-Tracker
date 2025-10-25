# Add Account-Goal Linking UI

**Status:** PROPOSED  
**Created:** 2025-01-24  
**Type:** Feature Addition  
**Priority:** High  
**Estimated Effort:** 16-24 hours

## Problem Statement

The application has database infrastructure for linking accounts to goals (`account_goals` table), but **no UI exists to create or manage these relationships**. This means:

1. **All goals are effectively manual** - Users cannot leverage automatic progress tracking from account balances
2. **Missing core feature** - The "Account-Linked" goal mode introduced in `fix-critical-bugs-2025-01` cannot be utilized
3. **User confusion** - UI shows "Manual" and "Account-Linked" badges, but users cannot create account-linked goals
4. **Limited functionality** - Users must manually update goal progress instead of automatic syncing

### Current State

```
User Creates Goal → GoalForm (no account selection) → Database (goal created)
                                                     → is_manual_goal = true (always)
```

### Desired State

```
User Creates Goal → GoalForm (select accounts + allocations) → Database (goal + account_goals)
                                                              → is_manual_goal = false (if accounts linked)
                                                              → Progress auto-calculated from account balances
```

## Objectives

1. **Enable account selection during goal creation/editing**
2. **Support multiple accounts per goal with allocation percentages**
3. **Provide visual interface for managing existing goal-account links**
4. **Real-time progress calculation from linked account balances**
5. **Seamless switching between manual and account-linked modes**

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Goal Management Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. GoalForm Component                                       │
│     ├─ Basic goal fields (name, target, date)               │
│     ├─ NEW: Account selector (multi-select)                 │
│     ├─ NEW: Allocation percentage inputs                    │
│     └─ Smart toggle: Manual vs Account-Linked               │
│                                                              │
│  2. Goal Detail/Edit View                                    │
│     ├─ Display linked accounts with percentages             │
│     ├─ "Manage Funding Sources" button                      │
│     └─ Quick add/remove account links                       │
│                                                              │
│  3. AccountGoalLinker Component (NEW)                        │
│     ├─ Modal for managing account-goal relationships        │
│     ├─ Drag-and-drop account allocation                     │
│     ├─ Percentage slider/input for each account             │
│     ├─ Validation: total allocation ≤ 100%                  │
│     └─ Real-time progress preview                           │
│                                                              │
│  4. Database Operations                                      │
│     ├─ Insert into account_goals on goal create             │
│     ├─ Update is_manual_goal based on links                 │
│     ├─ Cascade delete handling                              │
│     └─ Trigger updates when accounts change                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Design

#### 1. Enhanced GoalForm

**New UI Elements:**
- **Tracking Mode Toggle** (at top of form)
  ```
  ┌──────────────────────────────────────────┐
  │ Track Progress By:                       │
  │ ○ Manual Entry  ● Linked Accounts        │
  └──────────────────────────────────────────┘
  ```

- **Account Selector** (when "Linked Accounts" selected)
  ```
  ┌──────────────────────────────────────────┐
  │ Select Accounts to Link                  │
  │ ☑ Savings Account      [50%] ──────────  │
  │ ☑ ASB Investment       [30%] ──────────  │
  │ ☐ EPF Account 55       [  ] ──────────   │
  │ ☐ Tabung Haji          [  ] ──────────   │
  │                                          │
  │ Total Allocation: 80% (max 100%)         │
  └──────────────────────────────────────────┘
  ```

- **Progress Preview**
  ```
  ┌──────────────────────────────────────────┐
  │ Estimated Current Progress               │
  │ Savings (50%): RM 15,000                 │
  │ ASB (30%):     RM  9,000                 │
  │ ─────────────────────────────────────    │
  │ Total:         RM 24,000 / RM 100,000    │
  │ Progress: ▓▓▓░░░░░░░ 24%                 │
  └──────────────────────────────────────────┘
  ```

#### 2. AccountGoalLinker Component (NEW)

**Dedicated modal for managing funding sources:**

```tsx
<AccountGoalLinker
  goal={currentGoal}
  accounts={userAccounts}
  linkedAccounts={currentLinks}
  onSave={(links) => updateGoalLinks(links)}
  onCancel={() => closeModal()}
/>
```

**Features:**
- Visual account cards with current balances
- Drag to reorder priority
- Percentage sliders (0-100%)
- Validation messages
- "Unlink All" → switches to manual mode

#### 3. Goal Detail Enhancements

**Add "Funding Sources" section:**
```
┌─────────────────────────────────────────────────┐
│ Goal: Emergency Fund                            │
│ Target: RM 50,000                               │
│                                                 │
│ 📊 Funding Sources                              │
│ ┌─────────────────────────────────────────┐    │
│ │ Savings Account A        50%  RM 15,000  │    │
│ │ ASB Investment           30%  RM  9,000  │    │
│ │ Manual Contributions     20%  RM  1,000  │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ [Manage Funding Sources]  [Add Manual Amount]  │
└─────────────────────────────────────────────────┘
```

### Data Flow

#### Creating Account-Linked Goal

1. User fills goal form and selects "Linked Accounts" mode
2. User selects accounts and sets percentages
3. Frontend validates: `sum(percentages) <= 100%`
4. On submit:
   ```typescript
   // 1. Create goal
   const { data: goal } = await supabase
     .from('goals')
     .insert({ ...goalData, is_manual_goal: false })
     .select()
     .single();
   
   // 2. Create account-goal links
   const links = selectedAccounts.map(acc => ({
     goal_id: goal.id,
     account_id: acc.id,
     allocation_percentage: acc.percentage,
   }));
   
   await supabase.from('account_goals').insert(links);
   ```

#### Switching Modes

**Manual → Account-Linked:**
1. User clicks "Manage Funding Sources"
2. Selects accounts and percentages
3. System updates `is_manual_goal = false`
4. `manual_amount` preserved for historical tracking

**Account-Linked → Manual:**
1. User clicks "Switch to Manual Tracking"
2. Confirmation dialog warns about unlinking
3. System deletes `account_goals` entries
4. Trigger automatically sets `is_manual_goal = true`
5. Current progress preserved

### Database Considerations

**Existing schema (already in place):**
```sql
CREATE TABLE account_goals (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  allocation_percentage INTEGER,
  created_at TIMESTAMP,
  UNIQUE(account_id, goal_id)
);
```

**New index needed:**
```sql
CREATE INDEX idx_account_goals_goal_id ON account_goals(goal_id);
```

**Business rules enforced:**
- Allocation percentage: 0-100 per account
- Total allocation per goal: 0-100% (not enforced at DB level, UI only)
- Automatic `is_manual_goal` updates via triggers (already implemented)

## User Experience

### User Journey 1: Create Account-Linked Goal

1. Click "New Goal" → Select template or custom
2. Fill basic details (name, amount, date)
3. Toggle "Track Progress By: Linked Accounts"
4. Select "Savings Account" (current balance: RM 30,000)
5. Set allocation: 50% → Preview shows RM 15,000 progress
6. Select "ASB Investment" (current balance: RM 20,000)
7. Set allocation: 30% → Preview shows RM 6,000 progress
8. See total: RM 21,000 / RM 50,000 (42%)
9. Click "Create Goal"
10. Goal card shows badge: "Account-Linked 🔗"

### User Journey 2: Manage Existing Goal Funding

1. View goal details for "House Down Payment"
2. See current funding sources:
   - Savings A: 40% → RM 20,000
   - EPF 55: 60% → RM 30,000
3. Click "Manage Funding Sources"
4. Modal opens with current links
5. Add new account: ASB (20%)
6. Adjust existing: Savings A → 30%, EPF 55 → 50%
7. Click "Save Changes"
8. Goal progress updates automatically
9. Notification: "Funding sources updated. Progress recalculated."

### User Journey 3: Switch to Manual Tracking

1. Open account-linked goal
2. Click "Switch to Manual Tracking"
3. Confirmation dialog:
   ```
   Switch to Manual Tracking?
   
   This will unlink all accounts from this goal.
   Your current progress (RM 24,000) will be preserved
   as manual amount.
   
   [Cancel]  [Switch to Manual]
   ```
4. Confirm switch
5. Badge changes to "Manual ✋"
6. "Update Progress" button now available
7. Linked accounts section hidden

## Implementation Plan

### Phase 1: Core Linking UI (8 hours)
- [ ] Add tracking mode toggle to GoalForm
- [ ] Add account multi-select component
- [ ] Add allocation percentage inputs
- [ ] Implement basic validation
- [ ] Update goal creation logic
- [ ] Test create flow

### Phase 2: Management Interface (6 hours)
- [ ] Create AccountGoalLinker component
- [ ] Add "Manage Funding Sources" button to goal details
- [ ] Implement link update/delete operations
- [ ] Add progress preview calculation
- [ ] Test edit/update flows

### Phase 3: Mode Switching (4 hours)
- [ ] Add "Switch to Manual" action
- [ ] Add confirmation dialogs
- [ ] Handle data migration (account progress → manual amount)
- [ ] Update UI state transitions
- [ ] Test mode switching

### Phase 4: Polish & UX (6 hours)
- [ ] Add visual feedback (loading states, success messages)
- [ ] Improve mobile responsiveness
- [ ] Add inline help text / tooltips
- [ ] Implement drag-and-drop (optional enhancement)
- [ ] Comprehensive testing

## Success Metrics

### Functional
- ✅ Users can select accounts when creating goals
- ✅ Allocation percentages save correctly to database
- ✅ Goal progress auto-calculates from linked accounts
- ✅ Mode switching works bidirectionally
- ✅ is_manual_goal flag updates correctly

### User Experience
- ✅ Intuitive account selection interface
- ✅ Real-time progress preview during setup
- ✅ Clear visual distinction between modes
- ✅ No data loss during mode switching
- ✅ Mobile-friendly on all screen sizes

### Technical
- ✅ No N+1 query problems
- ✅ Proper error handling
- ✅ Database integrity maintained
- ✅ Existing migrations still work
- ✅ Backward compatible with manual goals

## Testing Scenarios

### Scenario 1: Create Account-Linked Goal
**Given:** User has 3 accounts with balances  
**When:** User creates goal and links 2 accounts (50% each)  
**Then:** 
- Goal created with `is_manual_goal = false`
- 2 entries in `account_goals` table
- Progress shows sum of 50% of each account balance
- Badge shows "Account-Linked 🔗"

### Scenario 2: Validation - Over-allocation
**Given:** User creating account-linked goal  
**When:** User sets Account A: 70%, Account B: 50% (total: 120%)  
**Then:**
- Error message: "Total allocation cannot exceed 100%"
- Submit button disabled
- Visual indicator on percentage inputs

### Scenario 3: Switch Manual → Account-Linked
**Given:** Manual goal with RM 10,000 manual progress  
**When:** User links account (RM 20,000 balance, 100% allocation)  
**Then:**
- `is_manual_goal` changes to `false`
- `manual_amount` stays at RM 10,000 (preserved)
- Total progress = RM 30,000 (RM 20,000 account + RM 10,000 manual)
- Badge changes to "Account-Linked"

### Scenario 4: Account Deletion Impact
**Given:** Goal linked to 2 accounts  
**When:** User deletes one of the linked accounts  
**Then:**
- `account_goals` entry auto-deleted (CASCADE)
- Goal remains account-linked (still has 1 account)
- Progress recalculates with remaining account only
- No error messages

### Scenario 5: Delete Last Linked Account
**Given:** Goal linked to only 1 account  
**When:** User deletes that account  
**Then:**
- Trigger sets `is_manual_goal = true`
- Notification created: "Goal switched to manual tracking"
- Badge changes to "Manual ✋"
- Goal progress preserved

## Risks & Mitigations

### Risk 1: Performance with Many Accounts
**Impact:** Slow loading if user has 50+ accounts  
**Mitigation:**
- Implement virtual scrolling for account list
- Lazy load account balances
- Cache frequently accessed data

### Risk 2: Concurrent Modifications
**Impact:** Two users editing same goal could conflict  
**Mitigation:**
- Optimistic locking with updated_at checks
- Clear error messages on conflict
- "Refresh and try again" recovery flow

### Risk 3: User Confusion on Percentages
**Impact:** Users don't understand allocation percentages  
**Mitigation:**
- Add inline help text: "If you set 50%, this goal will track half of this account's balance"
- Show RM amount preview next to percentage
- Provide examples in tooltips

### Risk 4: Breaking Existing Goals
**Impact:** Changes break manual goals created before this feature  
**Mitigation:**
- Thoroughly test backward compatibility
- Existing manual goals continue working as-is
- Progressive enhancement approach

## Dependencies

### Prerequisites
- ✅ `fix-critical-bugs-2025-01` must be merged (provides `is_manual_goal` flag)
- ✅ `account_goals` table exists in database
- ✅ RLS policies configured for `account_goals`

### External
- None (all functionality internal)

## Rollout Strategy

### Phase 1: Internal Testing (1 week)
- Deploy to local/dev environment
- Test all scenarios manually
- Fix any discovered issues

### Phase 2: Staging Deployment (3 days)
- Deploy to staging
- Run migration script (index creation)
- Perform load testing
- Beta test with selected users

### Phase 3: Production Deployment
- Deploy during low-traffic window
- Monitor error logs closely
- Keep rollback plan ready
- Gradual rollout via feature flag (optional)

### Rollback Plan
If critical issues arise:
1. Disable account selection in GoalForm (feature flag)
2. Hide "Manage Funding Sources" button
3. All goals revert to manual-only behavior
4. Investigate and fix issues offline
5. Re-enable after verification

## Future Enhancements

### Post-MVP Features
1. **Smart Allocation Suggestions**
   - AI recommends optimal account allocation based on goal type
   - Example: "For retirement goals, consider 70% EPF, 30% ASB"

2. **Goal Funding Rules**
   - Auto-adjust allocations when account balances change
   - "Keep all goals proportionally funded"

3. **Account Balance Forecasting**
   - Show projected goal completion based on historical account growth
   - Factor in dividend rates, contribution schedules

4. **Bulk Operations**
   - "Link this account to all retirement goals"
   - "Update all goal allocations proportionally"

5. **Visual Funding Diagram**
   - Sankey diagram showing account → goal relationships
   - Network graph of funding sources

## Open Questions

1. **Should total allocation be allowed to exceed 100%?**
   - Pro: Flexibility for users who want to over-commit
   - Con: Confusing semantics (what does 150% mean?)
   - **Decision needed:** Strict 100% limit or warning only?

2. **How to handle negative account balances?**
   - Scenario: Credit card debt linked to goal
   - Should progress calculation go negative?
   - **Decision needed:** Treat as zero or allow negative?

3. **Manual amount + account linking?**
   - Should users be able to add manual amount on top of account progress?
   - Use case: Cash savings + linked accounts
   - **Decision needed:** Allow hybrid or force choice?

4. **Historical tracking of allocation changes?**
   - Should we log when user changes allocations?
   - Use case: Understanding progress history
   - **Decision needed:** Add audit table or skip for MVP?

## References

- OpenSpec: `/openspec/specs/goal-tracking/spec.md`
- Related Change: `fix-critical-bugs-2025-01`
- Database Schema: `supabase/migrations/20200101000000_base_schema.sql`
- Existing Components: `src/components/goals/GoalForm.tsx`

---

**Next Steps:**
1. Review and approve this proposal
2. Create detailed tasks.md
3. Update spec deltas in `/openspec/specs/goal-tracking/spec.md`
4. Begin implementation Phase 1
