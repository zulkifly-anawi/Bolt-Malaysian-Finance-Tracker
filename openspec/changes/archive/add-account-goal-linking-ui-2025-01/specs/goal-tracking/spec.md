# Goal Tracking - Account-Goal Linking UI

**Change:** add-account-goal-linking-ui-2025-01  
**Type:** ADDED Requirements  
**Status:** PROPOSED

---

## ADDED Requirements

### Requirement: Account Selection During Goal Creation

System MUST provide interface for users to select and allocate accounts when creating account-linked goals.

#### Scenario: User Creates Account-Linked Goal

**Given** user is creating a new financial goal  
**And** user has at least one account in the system  
**When** user selects "Linked Accounts" tracking mode  
**Then** system MUST display account selection interface  
**And** system MUST show current balance for each available account  
**And** system MUST allow selection of multiple accounts  
**And** system MUST allow setting allocation percentage (0-100%) per account  

#### Scenario: Account Selection Validation

**Given** user is setting up account-linked goal  
**When** user sets allocation percentages  
**Then** system MUST validate each percentage is between 0 and 100  
**And** system MUST calculate and display total allocation  
**And** system MUST prevent saving when total exceeds 100%  
**And** system MUST display inline error when total exceeds 100%  

#### Scenario: No Accounts Available

**Given** user is creating account-linked goal  
**And** user has zero accounts in the system  
**When** user selects "Linked Accounts" mode  
**Then** system MUST display "No accounts available" message  
**And** system MUST provide "Create Account" quick action  
**And** system MUST disable goal creation until at least one account exists  

---

### Requirement: Progress Calculation from Linked Accounts

System MUST automatically calculate goal progress based on linked account balances and allocation percentages.

System MUST automatically calculate goal progress based on linked account balances and allocation percentages. (REQ-GT-021)

#### Scenario: Calculate Account-Linked Goal Progress

**Given** goal is linked to one or more accounts  
**And** each link has allocation percentage  
**When** system calculates goal progress  
**Then** system MUST sum (account.balance × allocation%) for all linked accounts  
**And** system MUST add manual_amount if present  
**And** system MUST display total as current progress  
**And** system MUST recalculate automatically when account balances change  

**Formula:**
```
total_progress = Σ(account_balance × allocation_percentage / 100) + manual_amount
```

#### Scenario: Real-Time Progress Preview

**Given** user is selecting accounts and setting allocations  
**When** user changes any allocation percentage  
**Then** system MUST immediately show RM amount from that account  
**And** system MUST immediately update total estimated progress  
**And** system MUST display progress percentage relative to target  

---

### Requirement: Manage Funding Sources Interface

System MUST provide interface for managing account-goal relationships after goal creation.

System MUST provide interface for managing account-goal relationships after goal creation.

#### Scenario: View Linked Accounts

**Given** goal is account-linked (is_manual_goal = false)  
**When** user views goal details  
**Then** system MUST display "Funding Sources" section  
**And** system MUST list all linked accounts with names  
**And** system MUST show allocation percentage for each account  
**And** system MUST show RM contribution from each account  
**And** system MUST show manual_amount if present  

#### Scenario: Open Funding Management Modal

**Given** user is viewing account-linked goal  
**When** user clicks "Manage Funding Sources" or "Link Accounts" from goal actions menu  
**Then** system MUST open AccountGoalLinker modal as full-screen overlay (portal)  
**And** system MUST load current linked accounts  
**And** system MUST load all user's available accounts  
**And** system MUST allow adding new account links  
**And** system MUST allow removing existing links  
**And** system MUST allow updating allocation percentages  
**And** system MUST show empty state if no accounts exist  
**And** system MUST keep modal accessible via keyboard focus traps  

#### Scenario: Save Funding Changes

**Given** user has modified account links or allocations  
**When** user clicks "Save"  
**Then** system MUST validate all percentages are between 0 and 100  
**And** system MUST require at least one allocation > 0 to switch goal to account-linked  
**And** system MUST allow saving with zero linked accounts by switching goal to manual mode  
**And** system MUST update account_goals table accordingly  
**And** system MUST refresh goal progress calculation  
**And** system MUST show success toast/notification  
**And** system MUST close modal and return to goal view  

---

### Requirement: Tracking Mode Switching

System MUST allow bidirectional switching between manual and account-linked tracking modes.

System MUST allow bidirectional switching between manual and account-linked tracking modes.

#### Scenario: Switch Manual Goal to Account-Linked

**Given** goal is manual (is_manual_goal = true)  
**And** goal has manual_amount > 0  
**When** user links one or more accounts  
**Then** system MUST set is_manual_goal = false  
**And** system MUST preserve manual_amount value  
**And** system MUST create account_goals entries for each allocation > 0  
**And** system MUST recalculate total progress (accounts + manual)  
**And** system MUST enforce total allocation ≤ 100%  
**And** system MUST update badge to "Account-Linked 🔗"  
**And** system MUST show inline confirmation/toast about mode change  

#### Scenario: Switch Account-Linked Goal to Manual

**Given** goal is account-linked (is_manual_goal = false)  
**When** user clicks "Switch to Manual Tracking"  
**Then** system MUST show confirmation dialog  
**And** system MUST explain consequences of unlinking  
**And** when user confirms  
**And** system MUST delete all account_goals entries  
**And** system MUST set is_manual_goal = true  
**And** system MUST update badge to "Manual ✋"  
**And** system MUST show success toast/notification  

#### Scenario: Automatic Switch on Last Account Deletion

**Given** goal is account-linked  
**And** goal has exactly one linked account  
**When** that account is deleted  
**Then** database trigger MUST automatically delete account_goals entry  
**And** database trigger MUST set is_manual_goal = true  
**And** database trigger MUST create notification for user  
**And** UI MUST update badge to "Manual ✋"  
**And** notification MUST explain automatic switch  

---

### Requirement: Account-Goal Link CRUD Operations

System MUST support create, read, update, and delete operations for account-goal relationships.

System MUST support create, read, update, and delete operations for account-goal relationships.

#### Scenario: Create Account-Goal Link

**Given** valid goal_id and account_id  
**When** system creates link  
**Then** system MUST insert into account_goals table  
**And** system MUST validate user owns both goal and account (RLS)  
**And** system MUST enforce unique constraint (account_id, goal_id)  
**And** system MUST handle duplicate insert gracefully (ON CONFLICT)  
**And** system MUST set allocation_percentage if provided  
**And** system MUST default to 100% if not provided  

#### Scenario: Update Allocation Percentage

**Given** existing account-goal link  
**When** user changes allocation percentage  
**Then** system MUST update account_goals.allocation_percentage  
**And** system MUST validate new value is 0-100  
**And** system MUST recalculate goal progress  
**And** system MUST show updated progress immediately  

#### Scenario: Delete Account-Goal Link

**Given** existing account-goal link  
**When** system deletes link  
**Then** system MUST remove from account_goals table  
**And** system MUST recalculate goal progress  
**And** if last link is deleted  
**And** system MUST trigger automatic switch to manual mode  
**And** system MUST create notification  

#### Scenario: Cascade Delete on Account Removal

**Given** account is linked to one or more goals  
**When** account is deleted  
**Then** system MUST cascade delete all account_goals entries (FK constraint)  
**And** for each affected goal with no remaining links  
**And** system MUST trigger automatic switch to manual mode  
**And** system MUST create notification per goal  

---

### Requirement: Validation and Business Rules

System MUST validate all account-goal linking operations according to defined business rules.

System MUST validate all account-goal linking operations according to defined business rules.

#### Scenario: Allocation Percentage Validation

**Given** user is setting allocation percentage  
**When** system validates input  
**Then** system MUST accept integers from 0 to 100  
**And** system MUST reject negative values  
**And** system MUST reject values > 100  
**And** system MUST reject non-numeric input  
**And** system SHOULD show inline validation message  

#### Scenario: Total Allocation Warning

**Given** goal has multiple linked accounts  
**When** sum of allocation percentages > 100%  
**Then** system SHOULD show warning message  
**And** system SHOULD highlight the issue visually  
**And** system MAY still allow saving (soft validation)  
**And** system SHOULD explain implications to user  

**Rationale:** Some users may want to over-allocate intentionally (e.g., shared accounts across multiple goals).

#### Scenario: Prevent Circular Dependencies

**Given** user is linking accounts to goal  
**When** system validates links  
**Then** system MUST ensure account is not the goal itself (N/A for current schema)  
**And** system MUST allow same account to link to multiple goals  
**And** system MUST enforce unique constraint per goal-account pair  

---

### Requirement: User Experience Requirements

System MUST provide responsive, intuitive UI for account-goal linking with real-time feedback.

System MUST provide responsive, intuitive UI for account-goal linking with real-time feedback.

#### Scenario: Real-Time Preview During Setup

**Given** user is selecting accounts and allocations  
**When** any value changes  
**Then** system MUST update progress preview within 100ms  
**And** system MUST show RM amount per account  
**And** system MUST show total estimated progress  
**And** system MUST show progress percentage  
**And** preview MUST be visually prominent  

#### Scenario: Mobile-Friendly Account Selection

**Given** user is on mobile device (viewport < 640px)  
**When** user opens account selection interface  
**Then** system MUST stack elements vertically  
**And** system MUST use full-width controls  
**And** system MUST ensure touch targets are ≥ 44px  
**And** system MUST prevent horizontal scrolling  
**And** system MUST optimize modal size for mobile  

#### Scenario: Loading States

**Given** user performs any async operation  
**When** system is fetching or saving data  
**Then** system MUST show loading indicator  
**And** system MUST disable action buttons  
**And** system SHOULD show progress bar for long operations  
**And** system MUST prevent duplicate submissions  

#### Scenario: Error Handling

**Given** any operation fails (network, validation, permission)  
**When** error occurs  
**Then** system MUST show user-friendly error message  
**And** system MUST log technical details to console  
**And** system SHOULD offer retry option when applicable  
**And** system MUST NOT show raw error messages to user  
**And** system MUST preserve user input on recoverable errors  

---

### Requirement: Performance Requirements

System MUST maintain fast response times even with large numbers of accounts and goals.

System MUST maintain fast response times even with large numbers of accounts and goals.

#### Scenario: Account List Performance

**Given** user has large number of accounts (>50)  
**When** system renders account selection  
**Then** system SHOULD implement virtual scrolling  
**And** system SHOULD lazy load account balances  
**And** initial render MUST complete within 500ms  
**And** search/filter MUST respond within 200ms  

#### Scenario: Progress Calculation Performance

**Given** goal is linked to multiple accounts  
**When** system calculates progress  
**Then** calculation MUST complete within 100ms  
**And** system SHOULD cache results  
**And** system SHOULD debounce frequent updates  
**And** system MUST NOT block UI thread  

#### Scenario: Database Query Optimization

**Given** user loads goal with linked accounts  
**When** system fetches data  
**Then** system MUST use JOIN to fetch goals + accounts in single query  
**And** system MUST use proper indexes (idx_account_goals_goal_id)  
**And** system MUST NOT perform N+1 queries  
**And** response time MUST be < 200ms for typical case  

---

### Requirement: Data Integrity Requirements

System MUST ensure data consistency and integrity across all account-goal operations.

System MUST ensure data consistency and integrity across all account-goal operations.

#### Scenario: Concurrent Modification Handling

**Given** two users editing same goal simultaneously  
**When** both try to save changes  
**Then** system MUST detect conflict via updated_at timestamp  
**And** system MUST show conflict error to second saver  
**And** system MUST offer option to refresh and retry  
**And** system MUST NOT silently overwrite data  

#### Scenario: Preserve Data on Mode Switch

**Given** goal is switching between tracking modes  
**When** mode changes  
**Then** system MUST preserve historical data  
**And** system MUST preserve manual_amount when switching to account-linked  
**And** system SHOULD offer to preserve account progress when switching to manual  
**And** system MUST maintain data integrity  

#### Scenario: Audit Trail (Future Enhancement)

**Given** account-goal relationships change  
**When** links are added/removed/updated  
**Then** system SHOULD log changes (optional for MVP)  
**And** log SHOULD include user_id, timestamp, old/new values  
**And** log SHOULD enable historical analysis  

---

## MODIFIED Requirements

### Requirement: Goal Creation (Modified)

System MUST support both manual and account-linked goal creation modes.

System MUST support both manual and account-linked goal creation modes.

**Original:** User creates goal with basic fields only  
**Modified:** User creates goal with optional account linking

#### Scenario: Goal Creation with Tracking Mode Choice

**Given** user is creating new goal  
**When** user fills goal form  
**Then** system MUST offer tracking mode choice  
**And** system MUST show "Manual" and "Linked Accounts" options  
**And** system MUST default to "Manual" for backward compatibility  
**And** if "Linked Accounts" selected  
**And** system MUST show account selection interface (REQ-GT-020)  
**And** system MUST create goal with is_manual_goal = false  

---

### Requirement: Progress Tracking (Modified)

System MUST calculate progress from both account allocations and manual amounts.

System MUST calculate progress from both account allocations and manual amounts.

**Original:** Only manual progress updates  
**Modified:** Manual OR automatic progress from accounts

#### Scenario: Hybrid Progress Tracking

**Given** goal is account-linked  
**When** system calculates progress  
**Then** system MUST include both account progress AND manual_amount  
**And** total = (sum of account allocations) + manual_amount  
**And** user MAY still add manual amounts on top of account progress  
**And** system MUST clearly distinguish sources in UI  

---

## RENAMED Requirements

None.

---

## REMOVED Requirements

None.

---

## Technical Specifications

### Database Schema (Existing)

```sql
CREATE TABLE account_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  allocation_percentage INTEGER CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, goal_id)
);

-- RLS Policies
CREATE POLICY "Users can view own account goals"
  ON account_goals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM accounts 
    WHERE accounts.id = account_goals.account_id 
    AND accounts.user_id = auth.uid()
  ));
```

### New Indexes (Required)

```sql
-- Migration: 20250124HHMMSS_add_account_goals_indexes.sql
CREATE INDEX idx_account_goals_goal_id ON account_goals(goal_id);
CREATE INDEX idx_account_goals_account_id ON account_goals(account_id);
```

### TypeScript Interfaces

```typescript
interface AccountGoalLink {
  id: string;
  account_id: string;
  goal_id: string;
  allocation_percentage: number;
  created_at: string;
  updated_at: string;
}

interface SelectedAccount {
  accountId: string;
  accountName: string;
  currentBalance: number;
  allocationPercentage: number;
  estimatedContribution?: number;
}

interface AccountSelectorProps {
  selectedAccounts: SelectedAccount[];
  onSelectionChange: (accounts: SelectedAccount[]) => void;
  availableAccounts: Account[];
  maxTotalAllocation?: number; // default 100
  loading?: boolean;
}

interface AccountGoalLinkerProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}
```

---

## UI/UX Specifications

### Visual Design

**Tracking Mode Toggle:**
- Radio buttons with icons
- Active state: bold + colored
- Glass-morphism style
- Smooth transition animation

**Account Selector:**
- Checkbox + account name + balance
- Percentage input (0-100)
- RM preview (calculated)
- Total allocation footer
- Error/warning states

**Funding Sources Section:**
- Card-based layout
- Account name + percentage + amount per row
- Visual progress bar (optional)
- Action buttons below list

### Color Coding

- Manual mode: Purple (`text-purple-300`)
- Account-linked mode: Blue (`text-blue-300`)
- Warning (>100%): Orange (`text-orange-400`)
- Error: Red (`text-red-400`)
- Success: Green (`text-green-400`)

---

## Testing Requirements

### Unit Tests
- Account selection logic
- Allocation validation
- Progress calculation formula
- Mode switching logic
- Error handling

### Integration Tests
- Create account-linked goal end-to-end
- Update account links
- Switch modes bidirectionally
- Cascade delete behavior
- Concurrent modification handling

### UI Tests
- Mobile responsiveness
- Touch interactions
- Form validation
- Loading states
- Error messages

### Performance Tests
- Load time with 100+ accounts
- Progress calculation speed
- Query performance with indexes

---

## Success Criteria

- ✅ Users can create account-linked goals
- ✅ Progress auto-calculates from account balances
- ✅ Users can switch between modes seamlessly
- ✅ No data loss during any operation
- ✅ Mobile-friendly interface
- ✅ Clear error messages and validation
- ✅ Performance meets requirements (<500ms)

---

## Dependencies

- **Requires:** `fix-critical-bugs-2025-01` (provides is_manual_goal flag)
- **Blocks:** None
- **Related:** Account management, Goal templates

---

## References

- Database Schema: `/supabase/migrations/20200101000000_base_schema.sql`
- Existing Components: `/src/components/goals/GoalForm.tsx`
- Related Change: `/openspec/changes/fix-critical-bugs-2025-01/`
