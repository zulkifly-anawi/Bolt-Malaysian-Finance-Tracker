# Goal Tracking

## Overview
Financial goal setting and progress tracking system with Malaysian-specific goal templates, account allocation, and automatic progress calculation.

## Requirements

### Requirement: Create Financial Goal
The system SHALL allow users to create and track financial goals with target amounts and deadlines.

#### Scenario: Create goal from template
- **WHEN** user selects a goal template (Emergency Fund, Hajj, House, etc.)
- **THEN** system pre-fills goal with template defaults
- **AND** links template_id to goal_templates table
- **AND** sets category, description, and suggested target amount
- **AND** allows user to customize values before saving

#### Scenario: Create custom goal
- **WHEN** user creates goal without template
- **THEN** system prompts for goal name
- **AND** prompts for target amount
- **AND** prompts for target date
- **AND** prompts for category
- **AND** optionally accepts description and priority
- **AND** saves goal with user_id

### Requirement: Goal Progress Tracking
The system SHALL automatically calculate and display goal progress based on linked account balances and manual contributions.

#### Scenario: Calculate progress
- **WHEN** goal has accounts allocated via account_goals
- **THEN** system sums (account.current_balance × allocation_percentage / 100) for each linked account
- **AND** adds manual_amount (if any) to the total
- **AND** calculates progress percentage (total / target * 100)
- **AND** displays progress bar with percentage
- **AND** shows remaining amount needed

#### Scenario: Update progress manually
- **WHEN** user updates goal current_amount directly
- **THEN** system saves new value
- **AND** recalculates progress percentage
- **AND** creates entry in goal_progress_entries for historical tracking
- **AND** updates updated_at timestamp

### Requirement: Account Allocation
The system SHALL allow users to allocate specific accounts toward goals with configurable percentages.

#### Scenario: Allocate account to goal
- **WHEN** user links an account to a goal using the account selector
- **THEN** system creates account_goals relationship with allocation_percentage (0-100)
- **AND** prevents total allocation from exceeding 100%
- **AND** includes allocation-adjusted balance in goal progress calculation
- **AND** allows multiple accounts per goal
- **AND** allows same account for multiple goals (enforced via composite uniqueness)

#### Scenario: Manage funding sources after creation
- **WHEN** user opens "Link Accounts" / "Manage Funding Sources" from goal actions
- **THEN** system presents AccountGoalLinker modal overlay
- **AND** loads available accounts and current allocations
- **AND** allows adding/removing accounts and editing percentages
- **AND** requires at least one allocation > 0 to keep goal in account-linked mode
- **AND** saves changes back to account_goals and updates goal progress

#### Scenario: Remove account allocation
- **WHEN** user removes an account link or sets its allocation to 0
- **THEN** system removes or updates the account_goals relationship
- **AND** recalculates goal progress without that allocation
- **AND** if no accounts remain, system switches goal to manual tracking

### Requirement: Goal Completion
The system SHALL track when goals are achieved and allow manual completion.

#### Scenario: Automatic completion detection
- **WHEN** goal current_amount >= target_amount
- **THEN** system shows goal as on-track or completable
- **AND** displays visual indicator (green progress bar)
- **AND** optionally triggers achievement notification

#### Scenario: Manual goal completion
- **WHEN** user marks goal as complete
- **THEN** system sets is_achieved = true
- **AND** sets achieved_at to current timestamp
- **AND** triggers achievement check for "Goal Crusher" badge
- **AND** creates notification for achievement if earned
- **AND** displays congratulations message

#### Scenario: Undo completion
- **WHEN** user unmarks completed goal
- **THEN** system sets is_achieved = false
- **AND** sets achieved_at = null
- **AND** returns goal to active status

### Requirement: Tracking Modes
The system SHALL support manual tracking and account-linked tracking with bidirectional switching.

#### Scenario: Create manual vs account-linked goal
- **WHEN** user creates a goal
- **THEN** system lets user choose between manual and account-linked tracking modes
- **AND** defaults to manual when no accounts exist
- **AND** loads account selector only when account-linked mode is chosen

#### Scenario: Switch manual goal to account-linked
- **WHEN** user links one or more accounts with allocation > 0
- **THEN** system sets is_manual_goal = false
- **AND** persists account_goals records for each allocation
- **AND** recalculates progress using accounts plus manual_amount
- **AND** displays success notification/toast

#### Scenario: Switch account-linked goal to manual
- **WHEN** user clicks "Switch to Manual Tracking" and confirms
- **THEN** system removes all account_goals records
- **AND** sets is_manual_goal = true
- **AND** retains manual_amount value
- **AND** displays success notification/toast
- **AND** ensures UI badges update accordingly

### Requirement: Goal Categories
The system SHALL organize goals into predefined Malaysian-relevant categories.

#### Scenario: Category support
- **WHEN** creating or viewing goals
- **THEN** system provides categories:
  - Emergency (Emergency Fund)
  - Property (House Downpayment)
  - Vehicle (Car Downpayment)
  - Education (Children's Education)
  - Hajj (Hajj Fund)
  - Hajj (Umrah Fund)
  - Retirement (Retirement Savings)
  - Life Event (Wedding Fund)
  - Other

### Requirement: Goal Templates
The system SHALL provide pre-configured goal templates for common Malaysian financial goals.

#### Scenario: View templates
- **WHEN** user opens goal creation
- **THEN** system displays 8 default templates:
  - Emergency Fund (RM 10,000-30,000)
  - House Downpayment (RM 50,000-100,000)
  - Car Downpayment (RM 10,000-30,000)
  - Children Education Fund (RM 50,000-150,000)
  - Hajj Fund (RM 45,000)
  - Umrah Fund (RM 15,000)
  - Retirement Fund (RM 500,000-1,000,000)
  - Wedding Fund (RM 30,000-80,000)

#### Scenario: Use template
- **WHEN** user selects a template
- **THEN** system copies template data to new goal
- **AND** maintains link via template_id
- **AND** allows full customization of amounts and dates

### Requirement: Goal Projections
The system SHALL calculate projected completion dates based on current progress and contribution rates.

#### Scenario: Calculate projection
- **WHEN** goal has monthly_contribution set
- **AND** current progress is known
- **THEN** system calculates months remaining: (target - current) / monthly_contribution
- **AND** projects completion date from current date + months
- **AND** displays "On track" or "Behind schedule" status

#### Scenario: Account-based projection
- **WHEN** goal uses account allocation (no manual contribution)
- **AND** accounts have dividend/interest rates
- **THEN** system projects growth based on dividend history
- **AND** calculates estimated completion date
- **AND** shows projection in goal details

### Requirement: Progress History
The system SHALL maintain historical record of goal progress over time.

#### Scenario: Track progress entries
- **WHEN** user manually updates goal progress
- **THEN** system creates goal_progress_entries record
- **AND** stores previous_amount, new_amount, change_amount
- **AND** stores entry_date and notes
- **AND** links to goal_id and user_id

#### Scenario: View progress timeline
- **WHEN** user views goal details
- **THEN** system displays progress history chart
- **AND** shows progress entries over time
- **AND** displays milestone achievements
- **AND** shows trend line toward target

## Technical Details

### Database Schema
```sql
goals table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users)
  - name: text
  - target_amount: numeric
  - current_amount: numeric (default 0)
  - manual_amount: numeric (default 0)
  - target_date: date
  - category: text
  - description: text
  - priority: text
  - is_manual_goal: boolean (default true)
  - is_achieved: boolean (default false)
  - achieved_at: timestamp (nullable)
  - monthly_contribution: numeric (nullable)
  - template_id: uuid (foreign key to goal_templates, nullable)
  - created_at: timestamp
  - updated_at: timestamp

goal_templates table:
  - id: uuid (primary key)
  - name: text (unique)
  - category: text
  - description: text
  - default_amount: numeric
  - icon: text
  - sort_order: integer
  - is_active: boolean

account_goals table (many-to-many):
  - account_id: uuid (foreign key to accounts)
  - goal_id: uuid (foreign key to goals)
  - allocation_percentage: numeric (0-100, defaults to 100)
  - created_at: timestamp

goal_progress_entries table:
  - id: uuid (primary key)
  - user_id: uuid
  - goal_id: uuid (foreign key to goals)
  - previous_amount: numeric
  - new_amount: numeric
  - change_amount: numeric
  - entry_date: date
  - notes: text (nullable)
  - created_at: timestamp
```

### RLS Policies
- Users can only view their own goals
- Users can create goals for themselves
- Users can update their own goals
- Users can delete their own goals
- Admins can manage all goals (admin override policy)
- Templates readable by all authenticated users
- Admins can manage templates

### Implementation Files
- `src/components/goals/GoalForm.tsx` - Create/edit UI
- `src/components/goals/GoalCard.tsx` - Display component
- `src/components/goals/GoalProjection.tsx` - Completion projections
- `src/components/goals/GoalTemplates.tsx` - Template selection
- `src/components/goals/ProgressUpdateModal.tsx` - Manual progress updates
- `src/components/goals/ProgressHistoryTimeline.tsx` - Historical view
