# Account Management

## Overview
Financial account tracking system supporting Malaysian-specific investment vehicles (ASB, EPF, Tabung Haji) and traditional accounts (savings, fixed deposits, unit trusts).

## Requirements

### Requirement: Create Financial Account
The system SHALL allow users to create and track multiple financial accounts.

#### Scenario: Add ASB account
- **WHEN** user selects "ASB" account type
- **THEN** system creates account with account_type = 'ASB'
- **AND** sets units_held equal to current_balance (1:1 ratio)
- **AND** automatically syncs units_held when balance changes
- **AND** stores institution name and account details

#### Scenario: Add EPF account
- **WHEN** user selects "EPF" account type
- **THEN** system prompts for savings type (Account 1 or Account 2)
- **AND** prompts for scheme (Conventional or Shariah)
- **AND** prompts for dividend rate method (Historical or Custom)
- **AND** prompts for contribution percentages (employee and employer)
- **AND** stores all EPF-specific settings

#### Scenario: Add Tabung Haji account
- **WHEN** user selects "Tabung Haji" account type
- **THEN** system creates account for hajj savings tracking
- **AND** supports dividend rate tracking
- **AND** stores institution and balance information

#### Scenario: Add general account
- **WHEN** user selects account type (Savings, Fixed Deposit, Unit Trust, etc.)
- **THEN** system creates account with specified type
- **AND** prompts for institution name
- **AND** prompts for current balance
- **AND** optionally accepts units_held for investment accounts

### Requirement: Update Account Balance
The system SHALL allow users to update account balances with historical tracking.

#### Scenario: Update balance
- **WHEN** user updates account current_balance
- **THEN** system saves new balance value
- **AND** updates updated_at timestamp
- **AND** for ASB accounts, automatically updates units_held to match balance
- **AND** recalculates net worth across all accounts

### Requirement: Account Types Support
The system SHALL support multiple Malaysian and international account types.

#### Scenario: Malaysian account types
- **WHEN** displaying account type options
- **THEN** system includes Malaysian-specific types:
  - ASB (Amanah Saham Bumiputera)
  - EPF (Employees Provident Fund)
  - Tabung Haji
  - ASB Loan
  - KWSP (alternative EPF name)

#### Scenario: General account types
- **WHEN** displaying account type options
- **THEN** system includes general types:
  - Savings Account
  - Fixed Deposit
  - Unit Trust
  - Cryptocurrency
  - Other Investment

### Requirement: Account Display
The system SHALL display accounts with balance, institution, and type information.

#### Scenario: View account list
- **WHEN** user views dashboard
- **THEN** system displays all user's accounts
- **AND** shows current balance in RM format
- **AND** shows institution name
- **AND** shows account type
- **AND** shows last updated date
- **AND** calculates total net worth across all accounts

#### Scenario: Edit account
- **WHEN** user clicks edit on an account
- **THEN** system opens account form pre-filled with existing data
- **AND** allows updating all account fields
- **AND** saves changes to database
- **AND** maintains account ID and creation date

#### Scenario: Delete account
- **WHEN** user confirms account deletion
- **THEN** system removes account from database
- **AND** removes associated account_goals relationships
- **AND** updates net worth calculation
- **AND** shows confirmation message

### Requirement: ASB Units Synchronization
The system SHALL automatically synchronize ASB units_held with current_balance.

#### Scenario: ASB balance update triggers unit sync
- **WHEN** user updates ASB account balance
- **THEN** database trigger sets units_held = current_balance
- **AND** maintains 1:1 ratio (RM1.00 per unit)
- **AND** does not affect non-ASB accounts

### Requirement: EPF Contribution Tracking
The system SHALL track EPF contribution settings for projection calculations.

#### Scenario: Configure EPF contributions
- **WHEN** user sets EPF contribution percentages
- **THEN** system stores employee_contribution_percentage
- **AND** stores employer_contribution_percentage
- **AND** stores use_total_contribution flag
- **AND** stores is_manual_contribution flag
- **AND** uses settings for EPF calculator projections

## Technical Details

### Database Schema
```sql
accounts table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users)
  - name: text
  - account_type: text (ASB, EPF, Tabung Haji, etc.)
  - institution_name: text
  - current_balance: numeric
  - units_held: numeric (nullable, for ASB and investments)
  - monthly_contribution: numeric (nullable)
  - dividend_rate: numeric (nullable)
  - employee_contribution_percentage: numeric (nullable, EPF)
  - employer_contribution_percentage: numeric (nullable, EPF)
  - use_total_contribution: boolean (EPF)
  - is_manual_contribution: boolean (EPF)
  - epf_savings_type: text (Account 1 or Account 2)
  - epf_dividend_rate_method: text (Historical or Custom)
  - pilgrimage_goal_type: text (Hajj or Umrah)
  - created_at: timestamp
  - updated_at: timestamp
```

### Triggers
- `sync_asb_units_held` - Automatically sets units_held = current_balance for ASB accounts
- `update_accounts_updated_at` - Updates timestamp on changes

### RLS Policies
- Users can only view their own accounts (WHERE user_id = auth.uid())
- Users can insert accounts for themselves
- Users can update their own accounts
- Users can delete their own accounts
- Admins can manage all accounts (admin override policy)

### Implementation Files
- `src/components/accounts/AccountForm.tsx` - Create/edit UI
- `src/components/accounts/AccountCard.tsx` - Display component
- `supabase/migrations/*` - Account table schema and triggers
