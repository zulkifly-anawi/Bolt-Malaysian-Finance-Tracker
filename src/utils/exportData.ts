import { formatCurrency, formatDate } from './formatters';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportGoalsToCSV = (goals: any[]) => {
  const data = goals.map(goal => ({
    Name: goal.name,
    Category: goal.category,
    'Target Amount': goal.target_amount,
    'Current Amount': goal.current_amount || 0,
    'Target Date': goal.target_date,
    'Progress %': ((goal.current_amount || 0) / goal.target_amount * 100).toFixed(2),
    Status: goal.is_achieved ? 'Achieved' : 'In Progress',
  }));

  exportToCSV(data, 'financial-goals.csv');
};

export const exportAccountsToCSV = (accounts: any[]) => {
  const data = accounts.map(account => ({
    Name: account.name,
    Type: account.account_type,
    Institution: account.institution || '',
    'Current Balance': account.current_balance,
    'Monthly Contribution': account.monthly_contribution || 0,
    'Created Date': account.created_at,
  }));

  exportToCSV(data, 'investment-accounts.csv');
};

export const exportBalanceHistoryToCSV = (entries: any[]) => {
  const data = entries.map(entry => ({
    Date: entry.entry_date,
    Account: entry.account_name || '',
    Balance: entry.balance,
    Notes: entry.notes || '',
  }));

  exportToCSV(data, 'balance-history.csv');
};

export const generateFinancialReportHTML = (
  user: any,
  netWorth: number,
  goals: any[],
  accounts: any[],
  achievements: any[]
): string => {
  const now = new Date();
  const reportDate = formatDate(now.toISOString());

  const goalsHTML = goals
    .map(
      goal => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${goal.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${formatCurrency(goal.target_amount)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${formatCurrency(goal.current_amount || 0)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${((goal.current_amount || 0) / goal.target_amount * 100).toFixed(1)}%</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${formatDate(goal.target_date)}</td>
    </tr>
  `
    )
    .join('');

  const accountsHTML = accounts
    .map(
      account => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${account.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${account.account_type}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${account.institution || '-'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(account.current_balance)}</td>
    </tr>
  `
    )
    .join('');

  const achievementsHTML = achievements
    .filter(a => a.earned)
    .map(
      achievement => `
    <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 8px;">
      <strong>${achievement.name}</strong><br>
      <small style="color: #6b7280;">${achievement.description}</small>
    </div>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Financial Report - ${reportDate}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 30px;
    }
    .section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #1f2937;
      margin-top: 0;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
    }
    .metric {
      display: inline-block;
      background: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin-right: 16px;
      margin-bottom: 16px;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
    }
    @media print {
      body { background: white; }
      .section { box-shadow: none; border: 1px solid #e5e7eb; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0 0 8px 0;">Malaysian Financial Report</h1>
    <p style="margin: 0; opacity: 0.9;">Generated on ${reportDate}</p>
    <p style="margin: 4px 0 0 0; opacity: 0.9;">For: ${user?.email || 'User'}</p>
  </div>

  <div class="section">
    <h2>Financial Overview</h2>
    <div>
      <div class="metric">
        <div class="metric-label">Total Net Worth</div>
        <div class="metric-value">${formatCurrency(netWorth)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Active Goals</div>
        <div class="metric-value">${goals.filter(g => !g.is_achieved).length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Investment Accounts</div>
        <div class="metric-value">${accounts.length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Achievements Earned</div>
        <div class="metric-value">${achievements.filter(a => a.earned).length}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Financial Goals</h2>
    ${goals.length === 0 ? '<p style="color: #6b7280;">No goals created yet.</p>' : `
    <table>
      <thead>
        <tr>
          <th>Goal Name</th>
          <th>Target Amount</th>
          <th>Current Amount</th>
          <th>Progress</th>
          <th>Target Date</th>
        </tr>
      </thead>
      <tbody>
        ${goalsHTML}
      </tbody>
    </table>
    `}
  </div>

  <div class="section">
    <h2>Investment Accounts</h2>
    ${accounts.length === 0 ? '<p style="color: #6b7280;">No accounts created yet.</p>' : `
    <table>
      <thead>
        <tr>
          <th>Account Name</th>
          <th>Type</th>
          <th>Institution</th>
          <th style="text-align: right;">Balance</th>
        </tr>
      </thead>
      <tbody>
        ${accountsHTML}
      </tbody>
    </table>
    `}
  </div>

  <div class="section">
    <h2>Achievements & Badges</h2>
    ${achievements.filter(a => a.earned).length === 0 ? '<p style="color: #6b7280;">No achievements earned yet.</p>' : achievementsHTML}
  </div>

  <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 12px; text-align: center; color: #6b7280; font-size: 14px;">
    <p style="margin: 0;">This report was generated by Malaysian Finance Tracker</p>
    <p style="margin: 4px 0 0 0;">Keep tracking your finances to achieve your goals!</p>
  </div>
</body>
</html>
  `;
};

export const downloadFinancialReport = (
  user: any,
  netWorth: number,
  goals: any[],
  accounts: any[],
  achievements: any[]
) => {
  const html = generateFinancialReportHTML(user, netWorth, goals, accounts, achievements);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `financial-report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAllData = (goals: any[], accounts: any[], balanceEntries: any[]) => {
  exportGoalsToCSV(goals);
  setTimeout(() => exportAccountsToCSV(accounts), 500);
  setTimeout(() => exportBalanceHistoryToCSV(balanceEntries), 1000);
};
