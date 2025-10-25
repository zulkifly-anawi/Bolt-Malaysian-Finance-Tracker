# OpenSpec Change Archive

This directory contains completed change proposals that have been successfully implemented and merged to the main branch.

## Archived Changes

### ✅ fix-critical-bugs-2025-01
**Completed:** October 25, 2025  
**Type:** Bug Fix  
**Priority:** Critical  
**Commit:** [deab7af](https://github.com/zulkifly-anawi/Bolt-Malaysian-Finance-Tracker/commit/deab7af)

**Summary:**
Fixed 5 critical bugs affecting core functionality:
1. Goal progress inconsistency (dual source of truth)
2. Achievement duplicate awards (race conditions)
3. Orphaned account-goal relationships
4. ASB unit price validation (RM 1.00 enforcement)
5. Division by zero protection in progress calculations

**Database Migrations:**
- `20251024001528_add_is_manual_goal_to_goals.sql`
- `20251024001529_enforce_asb_unit_price.sql`
- `20251024001530_validate_goal_target_amount.sql`
- `20251024001531_add_account_goal_removal_trigger.sql`

**Impact:**
- Established single source of truth for goal tracking
- Prevented duplicate achievement notifications
- Automated goal mode switching on account removal
- Enforced Malaysian ASB standards
- Eliminated division by zero errors

---

### ✅ add-account-goal-linking-ui-2025-01
**Completed:** October 25, 2025  
**Type:** Feature Addition  
**Priority:** High  
**Commit:** [deab7af](https://github.com/zulkifly-anawi/Bolt-Malaysian-Finance-Tracker/commit/deab7af)

**Summary:**
Implemented comprehensive account-goal linking interface with allocation-based progress tracking and bidirectional mode switching.

**New Components:**
- `AccountSelector.tsx` - Multi-select account picker with allocation percentages
- `AccountGoalLinker.tsx` - Post-creation modal for managing funding sources
- `iconUtils.ts` - Dynamic Lucide icon resolver

**Key Features:**
- Tracking mode toggle (Manual vs Account-Linked)
- Allocation percentage system (0-100% per account)
- Real-time validation and progress calculation
- Portal-rendered modals for reliable visibility
- Live icon preview in admin panel

**Statistics:**
- 47 files changed
- 9,359 lines added
- 3 new components
- 10+ files modified
- 10 core tasks + 6 enhancements completed

**Impact:**
- Enabled automatic progress tracking from account balances
- Provided flexible multi-account allocation
- Enhanced user experience with real-time feedback
- Improved admin panel with dynamic icon management

---

## Archive Guidelines

### When to Archive
A change proposal should be archived when:
1. ✅ All tasks are completed
2. ✅ Code is merged to main branch
3. ✅ Database migrations are applied to production
4. ✅ Documentation is updated
5. ✅ Feature is live in production

### Archive Process
1. Move the change folder from `openspec/changes/` to `openspec/changes/archive/`
2. Update the proposal status from `PROPOSED` to `✅ COMPLETED`
3. Add completion date and commit hash
4. Update this README with a summary entry

### Archive Contents
Each archived change should contain:
- `proposal.md` - Original proposal with updated status
- `tasks.md` - Task list with completion status
- `specs/` - Specification deltas (if applicable)
- `README.md` - Quick reference guide
- `IMPLEMENTATION_SUMMARY.md` - Post-completion summary (optional)
- `TESTING_GUIDE.md` - Testing documentation (optional)

### Retention Policy
- Archived changes are kept indefinitely for historical reference
- Serves as documentation for future similar changes
- Useful for onboarding new team members
- Provides audit trail for compliance

---

**Total Archived Changes:** 2  
**Last Updated:** October 25, 2025  
**Maintainer:** Zulkifly Anawi (@zulkifly-anawi)
