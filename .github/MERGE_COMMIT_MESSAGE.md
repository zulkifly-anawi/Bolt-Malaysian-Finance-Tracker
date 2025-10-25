# Complete Merge Commit Message

## For Reference and Documentation

---

### **Commit on Develop Branch**

```
feat: Add comprehensive account-goal linking UI system

Implements complete account-goal linking interface with bidirectional
tracking mode management, allocation-based progress calculation, and
seamless mode switching capabilities.

## New Features

### Core Components
- **AccountSelector**: Multi-select interface for goal creation with:
  - Search/filter functionality for accounts
  - Allocation percentage inputs (0-100% per account)
  - Real-time RM contribution calculation
  - Visual feedback for >100% total allocation
  - Empty state handling with call-to-action

- **AccountGoalLinker**: Post-creation modal for managing funding sources:
  - Portal-rendered overlay (z-index 9999) for reliable visibility
  - Full CRUD operations on account-goal relationships
  - Validation: prevents saving if allocation exceeds 100%
  - Summary panel with total allocation and estimated contribution
  - Success/error feedback with flash messages

### Goal Form Enhancements
- Tracking mode toggle (Manual vs Account-Linked)
- Conditional AccountSelector rendering based on mode
- Form validation: requires ≥1 account for account-linked mode
- Account-goals creation/update in handleSubmit
- Edit mode: loads existing account links via useEffect
- Database column fixes: account_name → name throughout

### Goal Card & Projection Updates
- Conditional menu entries based on is_manual_goal flag:
  - Manual mode: "Link Accounts" option
  - Account-linked mode: "Manage Funding Sources" option
- "Switch to Manual" action with ConfirmDialog
- AccountGoalLinker modal integration
- Flash message state for user feedback
- Removed duplicate menu entries

### Admin Panel Enhancements
- **Icon Resolver Utility** (iconUtils.ts):
  - Dynamic Lucide icon resolution with PascalCase conversion
  - Fallback to Target icon for invalid/missing icons
  - Handles various input formats (shield, Shield, shield-check)
  
- **Goal Category Management**:
  - Live icon preview in EditCategoryModal
  - Real-time IconPreview component updates
  - Helper text with Lucide icon examples
  - Dynamic icon rendering in GoalConfigPage category list

### UI/UX Improvements
- **Toast Component**: Added 'info' variant with blue styling
- **ToastContainer**: Type fix for toasts without onClose handler
- **Portal Rendering**: Ensures modals appear above all content
- **Loading States**: Skeleton screens during data fetching
- **Validation Feedback**: Real-time error messages for allocations

## Database Migrations

### 20251024001528_add_is_manual_goal_to_goals.sql
- Adds is_manual_goal column to goals table (default: false)
- Backfills existing goals based on account_goals existence
- Establishes single source of truth for progress calculation

### 20251024001529_enforce_asb_unit_price.sql
- Adds asb_unit_price and asb_units_held columns
- Enforces ASB unit price = RM 1.00 (Malaysian standard)
- Updates sync_asb_units_held() function with constraint
- Backfills existing ASB accounts

### 20251024001530_validate_goal_target_amount.sql
- Adds CHECK constraint: target_amount > 0
- Prevents division by zero in progress calculations
- Adds NOT NULL constraint to target_amount

### 20251024001531_add_account_goal_removal_trigger.sql
- Creates handle_account_goal_removal() trigger function
- Automatically switches goals to manual mode when last account removed
- Preserves current progress in manual_amount field
- Creates notification for users about mode switch

## Bug Fixes
- Fixed duplicate "Manage Funding Sources" menu entries
- Fixed database column references (account_name → name)
- Fixed modal z-index issues with portal rendering
- Fixed Toast type to include 'info' variant
- Fixed ToastContainer type for toasts without onClose

## Documentation Updates
- Updated OpenSpec proposal and tasks for add-account-goal-linking-ui-2025-01
- Updated goal-tracking spec with:
  - Allocation percentage in progress formula
  - Modal management scenarios
  - Tracking modes requirement section
  - Database schema with manual_amount, is_manual_goal, allocation_percentage
- Updated README with new capability documentation
- Added inline code comments for complex logic

## Technical Details

### State Management
- Local component state for modal visibility
- Real-time validation with immediate feedback
- Optimistic UI updates with server synchronization

### Database Operations
- Batch delete + insert pattern for account-goal updates
- RLS policies enforce user data isolation
- Trigger-based automation for mode switching
- Proper error handling with user-friendly messages

### Validation Rules
- Total allocation must be ≤ 100%
- At least one account required for account-linked mode
- Allocation percentage: 0-100 per account
- Target amount must be > 0 (enforced at DB level)

### Performance Considerations
- Nested queries optimized with proper indexes
- Portal rendering prevents re-renders of parent components
- Debounced search in AccountSelector
- Lazy loading of account data

## Breaking Changes
None. All changes are backward compatible with existing goals.
Existing goals backfilled as manual mode during migration.

## Migration Guide
1. Apply migrations in order (20251024001528 → 20251024001531)
2. Existing goals will automatically be set to manual mode
3. Users can switch to account-linked mode via "Link Accounts"
4. No user action required for existing functionality

## Testing
- ✅ Manual testing completed for all user flows
- ✅ Validation rules verified (>100% blocked, empty state handled)
- ✅ Mode switching tested bidirectionally
- ✅ No compilation errors (npm run typecheck passed)
- ✅ OpenSpec validation passed (--strict mode)

## Related Issues
Implements: add-account-goal-linking-ui-2025-01
Fixes: Critical bug - Goal progress inconsistency
Addresses: Missing UI for account-goal relationships

## Credits
Developed with OpenSpec methodology
Implementation: Zulkifly Anawi
Architecture: AI-assisted design with human validation

---

**Total Changes:**
- 10 core tasks completed
- 6 additional enhancements
- 4 database migrations
- 3 new components created
- 1 utility module added
- 10+ files modified
- 2000+ lines of code added
```

---

### **Merge Commit to Main Branch**

```
Merge branch 'develop' - Account-Goal Linking UI System

## Release Summary
Complete implementation of account-goal linking interface with allocation-based
progress tracking, bidirectional mode switching, and comprehensive UI/UX enhancements.

## Highlights
✨ New: AccountSelector & AccountGoalLinker components
✨ New: Tracking mode toggle (Manual ↔ Account-Linked)
✨ New: Allocation percentage system (0-100% per account)
✨ New: Icon resolver utility for dynamic Lucide icons
🐛 Fix: Duplicate menu entries, column name errors
🐛 Fix: Modal z-index issues with portal rendering
🗄️ Migration: 4 new database migrations (is_manual_goal, ASB validation, triggers)
📚 Docs: OpenSpec specs aligned with implementation

## Statistics
- 10 core tasks + 6 enhancements completed
- 3 new components, 1 utility module, 10+ files modified
- 4 database migrations (all non-breaking)
- 2000+ lines of production code
- Zero compilation errors, OpenSpec validated

## Testing Status
✅ Manual testing complete (all user flows verified)
✅ Validation rules enforced (>100% blocked, empty states handled)
✅ Mode switching bidirectional (manual ↔ account-linked)
✅ Database migrations tested locally
⚠️ Unit tests: Post-merge priority

## Deployment Notes
- All migrations are idempotent and backward compatible
- Existing goals auto-backfilled as manual mode
- No user action required for existing functionality
- Rollback available via feature flag or hotfix

## Credits
Developed by: Zulkifly Anawi (@zulkifly-anawi)
Methodology: OpenSpec AI-assisted development
Change ID: add-account-goal-linking-ui-2025-01
Related: fix-critical-bugs-2025-01

---
Merged: October 25, 2025
Version: 1.1.0 (Feature Release)
```

---

### **Git Commands Used**

```bash
# 1. Stage all changes on develop
git add -A

# 2. Commit to develop with comprehensive message
git commit -m "feat: Add comprehensive account-goal linking UI system
[... full message above ...]"

# 3. Switch to main branch
git checkout main

# 4. Pull latest changes from remote
git pull origin main

# 5. Merge develop into main with no-fast-forward
git merge --no-ff develop -m "Merge branch 'develop' - Account-Goal Linking UI System
[... full message above ...]"

# 6. Push main to remote
git push origin main

# 7. Switch back to develop and push
git checkout develop
git push origin develop
```

---

### **Commit Hashes**

- **Develop Commit:** `762aa3c`
- **Main Merge Commit:** `deab7af`
- **Remote URLs:**
  - Main: https://github.com/zulkifly-anawi/Bolt-Malaysian-Finance-Tracker/tree/main
  - Develop: https://github.com/zulkifly-anawi/Bolt-Malaysian-Finance-Tracker/tree/develop

---

### **Conventional Commit Format**

```
feat: Add comprehensive account-goal linking UI system

Type: feat (new feature)
Scope: goals, accounts, admin
Breaking Change: No
Related Issues: add-account-goal-linking-ui-2025-01

Body: [Detailed explanation of changes]
Footer: Implements #[issue-number], Fixes #[bug-number]
```

---

**Document Created:** October 25, 2025  
**Purpose:** Reference for merge commit messages and deployment documentation  
**Audience:** Development team, auditors, future maintainers
