# Data Export

## Overview
CSV export functionality for user's financial data including accounts, goals, transactions, and progress history.

## Requirements

### Requirement: Export Accounts Data
The system SHALL allow users to export their accounts to CSV format.

#### Scenario: Export all accounts
- **WHEN** user clicks "Export Accounts" button
- **THEN** system fetches all user's accounts
- **AND** includes columns: Name, Type, Current Balance, Institution, Account Number, Created Date, Last Updated
- **AND** formats balance with RM prefix
- **AND** formats dates as YYYY-MM-DD
- **AND** generates CSV file
- **AND** triggers browser download with filename: accounts_YYYY-MM-DD.csv

#### Scenario: Export ASB accounts with units
- **WHEN** exporting accounts
- **AND** account is ASB type
- **THEN** system includes additional columns:
  - Units Held
  - ASB Unit Price
  - Last Dividend Rate
  - Last Dividend Date
- **AND** calculates unit value (units × price)

#### Scenario: Export EPF accounts with details
- **WHEN** exporting accounts
- **AND** account is EPF type
- **THEN** system includes additional columns:
  - Account Type (Account 1 or Account 2)
  - Savings Type (Conventional or Shariah)
  - Contribution Rate Method
  - Monthly Contribution

### Requirement: Export Goals Data
The system SHALL allow users to export their goals to CSV format.

#### Scenario: Export all goals
- **WHEN** user clicks "Export Goals" button
- **THEN** system fetches all user's goals
- **AND** includes columns: Name, Category, Target Amount, Current Amount, Progress %, Target Date, Status, Created Date, Achieved Date
- **AND** calculates progress percentage
- **AND** formats amounts with RM prefix
- **AND** shows status (Active, Achieved, Archived)
- **AND** generates CSV file
- **AND** triggers download: goals_YYYY-MM-DD.csv

#### Scenario: Include goal allocations
- **WHEN** exporting goals
- **THEN** system optionally includes allocated accounts
- **AND** shows account names linked to each goal
- **AND** uses pipe separator for multiple accounts (Account1|Account2)

### Requirement: Export Complete Financial Snapshot
The system SHALL allow users to export all data in one comprehensive export.

#### Scenario: Full data export
- **WHEN** user clicks "Export All Data" button
- **THEN** system creates ZIP file containing:
  - accounts.csv
  - goals.csv
  - progress_history.csv
  - account_goals.csv (account-goal relationships)
  - summary.txt (export metadata)
- **AND** triggers download: finance_data_YYYY-MM-DD.zip

#### Scenario: Export metadata
- **WHEN** creating full export
- **THEN** system includes summary.txt with:
  - Export date and time
  - User email (partially masked)
  - Record counts (X accounts, Y goals)
  - Data date range
  - App version

### Requirement: Export Progress History
The system SHALL allow users to export goal progress entries.

#### Scenario: Export progress timeline
- **WHEN** user exports progress history
- **THEN** system fetches all goal_progress_entries
- **AND** includes columns: Goal Name, Previous Amount, New Amount, Change, Entry Date, Notes
- **AND** sorts by entry_date DESC
- **AND** groups by goal (optional)
- **AND** formats as CSV: progress_history_YYYY-MM-DD.csv

### Requirement: Export Formatting
The system SHALL format CSV exports for compatibility with Excel and Google Sheets.

#### Scenario: CSV format standards
- **WHEN** generating CSV
- **THEN** system uses comma separator
- **AND** wraps text fields in double quotes
- **AND** escapes internal quotes with double quotes
- **AND** uses UTF-8 encoding with BOM for Excel compatibility
- **AND** includes header row with column names

#### Scenario: Number formatting
- **WHEN** exporting numbers
- **THEN** system formats currency as plain numbers (no commas in CSV)
- **AND** uses 2 decimal places for amounts
- **AND** includes RM prefix in separate column or before amount

#### Scenario: Date formatting
- **WHEN** exporting dates
- **THEN** system uses ISO 8601 format (YYYY-MM-DD)
- **AND** uses YYYY-MM-DD HH:MM:SS for timestamps
- **AND** uses UTC timezone

### Requirement: Export Security
The system SHALL ensure exports only contain user's own data.

#### Scenario: Data isolation
- **WHEN** user initiates export
- **THEN** system applies RLS policies
- **AND** filters by user_id
- **AND** prevents cross-user data leakage
- **AND** validates user session before export

#### Scenario: Export confirmation
- **WHEN** user requests full data export
- **THEN** system shows confirmation dialog
- **AND** warns about sensitive data in export
- **AND** requires explicit confirmation
- **AND** logs export action (for audit)

### Requirement: Export Triggers Achievement
The system SHALL award achievement for first data export.

#### Scenario: Data Expert achievement
- **WHEN** user exports data for first time
- **THEN** system checks for "Data Expert" achievement
- **AND** unlocks achievement if not already earned
- **AND** creates notification
- **AND** displays achievement modal

### Requirement: Export Performance
The system SHALL handle large exports efficiently.

#### Scenario: Large data export
- **WHEN** user has 1000+ records
- **THEN** system processes export asynchronously
- **AND** shows loading indicator
- **AND** streams data to file (no memory buildup)
- **AND** completes within 30 seconds

#### Scenario: Batch processing
- **WHEN** exporting very large datasets
- **THEN** system fetches data in batches (500 records)
- **AND** writes to file incrementally
- **AND** shows progress bar (optional)

## Technical Details

### Export Utility Functions
```typescript
// src/utils/exportData.ts

export async function exportAccountsToCSV(userId: string): Promise<void> {
  // 1. Fetch user accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  // 2. Format data
  const rows = accounts.map(account => ({
    Name: account.name,
    Type: account.account_type,
    'Current Balance': formatCurrency(account.current_balance),
    Institution: account.institution || '',
    'Account Number': account.account_number || '',
    'Created Date': formatDate(account.created_at),
    'Last Updated': formatDate(account.updated_at)
  }));
  
  // 3. Generate CSV
  const csv = generateCSV(rows);
  
  // 4. Trigger download
  downloadFile(csv, `accounts_${formatDate(new Date())}.csv`, 'text/csv');
}

export async function exportGoalsToCSV(userId: string): Promise<void> {
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  const rows = goals.map(goal => ({
    Name: goal.name,
    Category: goal.category,
    'Target Amount': formatCurrency(goal.target_amount),
    'Current Amount': formatCurrency(goal.current_amount),
    'Progress %': calculateProgress(goal.current_amount, goal.target_amount),
    'Target Date': formatDate(goal.target_date),
    Status: goal.is_achieved ? 'Achieved' : 'Active',
    'Created Date': formatDate(goal.created_at),
    'Achieved Date': goal.achieved_at ? formatDate(goal.achieved_at) : ''
  }));
  
  const csv = generateCSV(rows);
  downloadFile(csv, `goals_${formatDate(new Date())}.csv`, 'text/csv');
}

export async function exportAllData(userId: string): Promise<void> {
  // Create multiple CSVs and zip them
  const zip = new JSZip();
  
  // Add accounts
  const accountsCSV = await generateAccountsCSV(userId);
  zip.file('accounts.csv', accountsCSV);
  
  // Add goals
  const goalsCSV = await generateGoalsCSV(userId);
  zip.file('goals.csv', goalsCSV);
  
  // Add progress history
  const progressCSV = await generateProgressHistoryCSV(userId);
  zip.file('progress_history.csv', progressCSV);
  
  // Add summary
  const summary = generateExportSummary(userId);
  zip.file('summary.txt', summary);
  
  // Generate zip and download
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(blob, `finance_data_${formatDate(new Date())}.zip`, 'application/zip');
  
  // Check for achievement
  await checkAchievements(userId);
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]?.toString() || '';
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  
  // Add BOM for Excel compatibility
  return '\uFEFF' + csvRows.join('\n');
}

function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Implementation Files
- `src/utils/exportData.ts` - Core export functions
- `src/components/common/ExportButton.tsx` - Export UI trigger
- `src/components/common/ExportDialog.tsx` - Export options dialog

### Dependencies
- `jszip` - For creating ZIP archives (full export)
- Browser File API - For triggering downloads

### Export Button Placement
Export buttons appear in:
1. Dashboard - "Export All Data" button
2. Accounts page - "Export Accounts" button
3. Goals page - "Export Goals" button
4. Settings page - "Download My Data" section

### Example Usage
```typescript
// In Dashboard.tsx
import { exportAllData, exportAccountsToCSV, exportGoalsToCSV } from '../utils/exportData';

<Button onClick={() => exportAllData(user.id)}>
  <Download className="mr-2 h-4 w-4" />
  Export All Data
</Button>

<Button onClick={() => exportAccountsToCSV(user.id)}>
  Export Accounts
</Button>

<Button onClick={() => exportGoalsToCSV(user.id)}>
  Export Goals
</Button>
```
