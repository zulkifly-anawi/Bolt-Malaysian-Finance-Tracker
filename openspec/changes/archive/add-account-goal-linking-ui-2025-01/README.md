# OpenSpec Change Proposal Created: Add Account-Goal Linking UI

**Status:** ✅ VALIDATED  
**Created:** 2025-01-24  
**Change ID:** `add-account-goal-linking-ui-2025-01`

---

## Summary

Created comprehensive OpenSpec change proposal to add the missing UI for linking accounts to goals, enabling the "Account-Linked" goal tracking mode.

## Files Created

1. **`proposal.md`** (350+ lines)
   - Problem statement and architecture
   - Component designs and data flows
   - User journeys and testing scenarios
   - Risk analysis and rollout strategy

2. **`tasks.md`** (400+ lines)
   - 17 detailed implementation tasks
   - 4 phases with estimates
   - Total effort: 18.5 hours
   - Critical path identified

3. **`specs/goal-tracking/spec.md`** (500+ lines)
   - 9 new requirements (ADDED)
   - 2 modified requirements (MODIFIED)
   - Detailed scenarios with Given/When/Then format
   - Technical specifications

## Validation

```bash
✅ openspec validate add-account-goal-linking-ui-2025-01 --strict
```

**Result:** Change is valid

## Key Features Proposed

### 1. Account Selection During Goal Creation
- Tracking mode toggle (Manual vs Account-Linked)
- Multi-select account interface
- Allocation percentage inputs (0-100%)
- Real-time progress preview

### 2. Manage Funding Sources
- New `AccountGoalLinker` modal component
- View/edit linked accounts post-creation
- Add/remove account links
- Update allocation percentages

### 3. Tracking Mode Switching
- Manual → Account-Linked
- Account-Linked → Manual
- Data preservation during switch
- Automatic notifications

### 4. Database Operations
- CRUD for account_goals table
- Proper validation and constraints
- Cascade delete handling
- Performance indexes

## Implementation Phases

| Phase | Focus | Tasks | Hours |
|-------|-------|-------|-------|
| 1 | Core Linking UI | 1-4 | 8 |
| 2 | Management Interface | 5-7 | 6 |
| 3 | Mode Switching | 8-10 | 4 |
| 4 | Polish & UX | 11-15 | 6.5 |

**Total:** 24.5 hours

## Dependencies

- ✅ Requires: `fix-critical-bugs-2025-01` (provides `is_manual_goal` flag) - **ALREADY IMPLEMENTED**
- ✅ Requires: `account_goals` table - **ALREADY EXISTS**
- ✅ Requires: RLS policies - **ALREADY CONFIGURED**

## Technical Highlights

### New Components
- `AccountSelector.tsx` - Multi-select with allocation inputs
- `AccountGoalLinker.tsx` - Modal for managing relationships

### Database Changes
- Add indexes: `idx_account_goals_goal_id`, `idx_account_goals_account_id`
- No schema changes (uses existing `account_goals` table)

### Business Logic
```typescript
total_progress = Σ(account_balance × allocation_percentage / 100) + manual_amount
```

## User Impact

**Before:**
- ❌ All goals are "Manual" only
- ❌ Users must manually update progress
- ❌ No automatic progress tracking
- ❌ "Account-Linked" badge never shows

**After:**
- ✅ Users can link accounts to goals
- ✅ Automatic progress calculation
- ✅ Both tracking modes fully functional
- ✅ Seamless mode switching

## Testing Coverage

- ✅ Unit tests for calculations
- ✅ Integration tests for CRUD operations
- ✅ UI tests for responsiveness
- ✅ Performance tests for large datasets
- ✅ 15+ test scenarios documented

## Success Metrics

- ✅ Users can create account-linked goals
- ✅ Progress auto-calculates from account balances
- ✅ Mode switching works bidirectionally
- ✅ No data loss during operations
- ✅ Mobile-friendly interface
- ✅ Performance < 500ms

## Next Steps

1. **Review proposal** - Stakeholder approval needed
2. **Prioritize in backlog** - Decide when to implement
3. **Begin Phase 1** - Start with core linking UI
4. **Iterative development** - Complete phases sequentially
5. **Testing & deployment** - QA then production rollout

## Related Changes

- **Builds on:** `fix-critical-bugs-2025-01`
- **Enables:** Full goal tracking system
- **Unlocks:** Advanced features (forecasting, optimization)

---

## Quick Links

- Proposal: `openspec/changes/add-account-goal-linking-ui-2025-01/proposal.md`
- Tasks: `openspec/changes/add-account-goal-linking-ui-2025-01/tasks.md`
- Spec: `openspec/changes/add-account-goal-linking-ui-2025-01/specs/goal-tracking/spec.md`

## Validation Commands

```bash
# Validate change
openspec validate add-account-goal-linking-ui-2025-01 --strict

# View change details
openspec change show add-account-goal-linking-ui-2025-01

# View deltas only
openspec change show add-account-goal-linking-ui-2025-01 --json --deltas-only
```

---

**Author:** GitHub Copilot  
**Created:** 2025-01-24  
**Validation:** ✅ PASSED
