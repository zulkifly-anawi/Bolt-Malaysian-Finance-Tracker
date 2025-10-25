# Investment Calculators

## Overview
Malaysian-specific investment calculators for ASB (Amanah Saham Bumiputera), EPF (Employees Provident Fund), and Tabung Haji with accurate dividend rates, contribution rules, and projection calculations.

## Requirements

### Requirement: ASB Calculator
The system SHALL provide accurate ASB investment calculations using historical dividend rates.

#### Scenario: Calculate ASB returns
- **WHEN** user inputs initial investment amount
- **AND** selects investment duration in years
- **THEN** system uses historical ASB dividend rates (5.00% - 7.75%)
- **AND** calculates compound returns with annual dividends
- **AND** displays year-by-year breakdown
- **AND** shows total investment value at end period
- **AND** shows total dividends earned

#### Scenario: ASB monthly contribution projection
- **WHEN** user inputs monthly contribution amount
- **AND** specifies contribution duration
- **THEN** system calculates total contributions
- **AND** applies monthly compounding with ASB dividend rate
- **AND** projects final value
- **AND** displays contribution vs. returns chart

#### Scenario: Use ASB dividend history
- **WHEN** calculator needs dividend rate
- **THEN** system uses asb_dividend_history table
- **AND** applies most recent dividend rate (6.50% for 2024)
- **AND** optionally shows historical rates for context
- **AND** allows user to adjust assumed rate

### Requirement: EPF Calculator
The system SHALL calculate EPF retirement savings with accurate contribution rates and dividend calculations.

#### Scenario: Calculate EPF contributions
- **WHEN** user inputs monthly salary
- **THEN** system calculates 11% employee contribution (mandatory)
- **AND** calculates 13% employer contribution (standard rate)
- **AND** displays total monthly EPF contribution
- **AND** supports age-based rates (60+ = 4% employee)

#### Scenario: EPF Account 1 vs Account 2
- **WHEN** calculating EPF growth
- **THEN** system allocates 70% to Account 1 (retirement)
- **AND** allocates 30% to Account 2 (withdrawable)
- **AND** applies different dividend rates per account type
- **AND** calculates separate account balances

#### Scenario: EPF retirement projection
- **WHEN** user inputs current age and retirement age
- **AND** provides current EPF balance
- **AND** provides monthly salary
- **THEN** system projects total EPF at retirement
- **AND** uses EPF dividend history (5.35% - 6.90%)
- **AND** accounts for annual salary increments (optional)
- **AND** displays account breakdown (Account 1 + Account 2)

#### Scenario: EPF dividend calculation
- **WHEN** projecting EPF growth
- **THEN** system uses epf_dividend_history table
- **AND** applies scheme-specific rates (Conventional vs. Shariah)
- **AND** uses account-specific rates (Account 1 vs. Account 2)
- **AND** applies most recent rates (2024: Conventional Acc1 5.50%, Acc2 6.00%)

### Requirement: Tabung Haji Calculator
The system SHALL calculate Tabung Haji savings with dividend projections for Hajj planning.

#### Scenario: Calculate Tabung Haji savings
- **WHEN** user inputs initial deposit
- **AND** specifies monthly contribution
- **AND** sets target Hajj year
- **THEN** system calculates total savings
- **AND** applies Tabung Haji dividend rates (historically 4.00% - 5.50%)
- **AND** projects final value at target year
- **AND** shows if goal meets current Hajj cost (RM ~45,000)

#### Scenario: Hajj readiness assessment
- **WHEN** calculator completes projection
- **THEN** system compares final value to estimated Hajj cost
- **AND** displays "Ready for Hajj" if sufficient
- **AND** calculates shortfall if insufficient
- **AND** suggests increased contributions to meet goal

#### Scenario: Use Tabung Haji dividend history
- **WHEN** calculating returns
- **THEN** system uses tabung_haji_dividend_history table
- **AND** applies most recent dividend rate
- **AND** compounds annually
- **AND** shows year-by-year accumulation

### Requirement: Compound Interest Engine
The system SHALL accurately calculate compound interest for all investment types.

#### Scenario: Annual compounding
- **WHEN** investment compounds annually (ASB, EPF, Tabung Haji)
- **THEN** system uses formula: FV = PV × (1 + r)^n
- **AND** where r = annual rate, n = years
- **AND** adds annual contributions: FV += annual_contrib × ((1 + r)^n - 1) / r

#### Scenario: Monthly compounding with contributions
- **WHEN** user makes monthly contributions
- **THEN** system converts annual rate to monthly: r_monthly = (1 + r_annual)^(1/12) - 1
- **AND** calculates each month's contribution growth separately
- **AND** sums all contributions with their respective growth
- **AND** produces accurate final value

### Requirement: Historical Dividend Data
The system SHALL maintain accurate historical dividend rates for Malaysian investment instruments.

#### Scenario: Store ASB dividend rates
- **WHEN** system stores ASB data
- **THEN** dividend_history includes:
  - 2024: 6.50%
  - 2023: 5.75%
  - 2022: 5.00%
  - 2021: 5.50%
  - Historical range: 5.00% - 7.75%

#### Scenario: Store EPF dividend rates
- **WHEN** system stores EPF data
- **THEN** epf_dividend_history includes:
  - Scheme type (Conventional, Shariah)
  - Account type (Account 1, Account 2)
  - 2024 Conventional: 5.50% (Acc1), 6.00% (Acc2)
  - 2024 Shariah: 5.50% (Acc1), 6.00% (Acc2)
  - Historical range: 5.35% - 6.90%

#### Scenario: Store Tabung Haji dividend rates
- **WHEN** system stores Tabung Haji data
- **THEN** tabung_haji_dividend_history includes:
  - Recent rates around 4.00% - 5.50%
  - Annual dividend declarations
  - Proper date tracking

### Requirement: Interactive Adjustments
The system SHALL allow users to adjust assumptions and see real-time recalculations.

#### Scenario: Adjust dividend rate
- **WHEN** user modifies assumed dividend rate slider
- **THEN** system immediately recalculates projections
- **AND** updates all charts and figures
- **AND** maintains user input (non-destructive)

#### Scenario: Adjust contribution amount
- **WHEN** user changes monthly contribution
- **THEN** system recalculates final value
- **AND** updates timeline projection
- **AND** shows impact on goal achievement

#### Scenario: Adjust time horizon
- **WHEN** user changes investment duration
- **THEN** system extends/shortens projection
- **AND** recalculates compound growth
- **AND** updates year-by-year breakdown

### Requirement: Visual Projections
The system SHALL display investment growth visually with charts and breakdowns.

#### Scenario: Growth chart
- **WHEN** calculator completes projection
- **THEN** system displays line chart of balance over time
- **AND** separates principal vs. returns (stacked area chart)
- **AND** marks milestones (e.g., when goal is achieved)

#### Scenario: Breakdown display
- **WHEN** showing final projection
- **THEN** system displays:
  - Total contributions (principal)
  - Total returns (dividends/interest)
  - Final value
  - Percentage return
- **AND** shows year-by-year table with annual values

## Technical Details

### Database Schema
```sql
asb_dividend_history table:
  - id: uuid (primary key)
  - year: integer
  - dividend_rate: numeric
  - effective_date: date
  - created_at: timestamp

epf_dividend_history table:
  - id: uuid (primary key)
  - year: integer
  - scheme_type: text ('Conventional' or 'Shariah')
  - account_type: text ('Account 1' or 'Account 2')
  - dividend_rate: numeric
  - effective_date: date
  - created_at: timestamp

tabung_haji_dividend_history table:
  - id: uuid (primary key)
  - year: integer
  - dividend_rate: numeric
  - hibah_rate: numeric (nullable)
  - effective_date: date
  - created_at: timestamp
```

### Calculation Helpers
```typescript
// src/utils/investmentCalculators.ts

calculateASBProjection(
  initialAmount: number,
  monthlyContribution: number,
  years: number,
  annualRate: number
): ProjectionResult

calculateEPFProjection(
  currentAge: number,
  retirementAge: number,
  currentBalance: number,
  monthlySalary: number,
  employeeRate: number,
  employerRate: number,
  dividendRate: number,
  salaryIncrement?: number
): EPFProjectionResult

calculateTabungHajiProjection(
  initialDeposit: number,
  monthlyContribution: number,
  targetYear: number,
  dividendRate: number
): ProjectionResult
```

### Implementation Files
- `src/components/investments/ASBCalculator.tsx` - ASB calculator UI
- `src/components/investments/EPFCalculator.tsx` - EPF calculator UI
- `src/components/investments/TabungHajiCalculator.tsx` - Tabung Haji calculator UI
- `src/components/investments/InvestmentProjectionChart.tsx` - Shared chart component
- `src/utils/investmentCalculators.ts` - Calculation logic
- `supabase/migrations/20251015164942_add_investment_fields.sql` - Dividend history tables
- `supabase/migrations/20251017095209_update_asb_dividend_rates_2024.sql` - ASB rates
- `supabase/migrations/20251017154500_add_epf_scheme_type_to_dividend_history.sql` - EPF rates

### Key Formulas
```
Compound Interest with Regular Contributions:
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

Where:
  FV = Future Value
  PV = Present Value (initial amount)
  PMT = Payment per period (contribution)
  r = Interest rate per period
  n = Number of periods

EPF Contribution Rates (2024):
  Employee: 11% of salary (mandatory)
  Employer: 13% of salary (standard)
  Employee 60+: 4% of salary
  Account 1: 70% of contributions (retirement)
  Account 2: 30% of contributions (withdrawable)
```
