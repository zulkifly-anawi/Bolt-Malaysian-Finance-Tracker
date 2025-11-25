import { formatCurrency, formatDate } from './formatters';
import { supabase } from '../lib/supabase';
import { calculateGoalProjection, calculateASBProjection, calculateEPFProjection, calculateTabungHajiProjection, HAJJ_COST_2025 } from './investmentCalculators';
import type { Account, Goal, Achievement, BalanceEntry } from '../types/database';

interface ExportUser {
  id: string;
  email: string;
}

// Extended Account type for export functions that may have additional runtime properties
interface ExportAccount extends Omit<Account, 'institution'> {
  institution?: string | null;
  epf_age?: number;
  epf_monthly_salary?: number;
}

interface InvestmentProjections {
  asb: ASBProjectionRecord[];
  epf: EPFProjectionRecord[];
  tabung_haji: TabungHajiProjectionRecord[];
}

interface ASBProjectionRecord {
  account_id: string;
  account_name: string;
  current_balance: number;
  units_held: number;
  monthly_contribution: number;
  five_year_projection: {
    projected_balance: number;
    total_dividends: number;
    total_contributions: number;
  };
}

interface EPFProjectionRecord {
  account_id: string;
  account_name: string;
  current_balance: number;
  current_age: number;
  monthly_salary: number;
  retirement_projection: {
    projected_balance_at_55: number;
    years_to_retirement: number;
    retirement_benchmark: number;
    status: string;
    additional_needed: number;
    monthly_contribution: number;
  };
}

interface TabungHajiProjectionRecord {
  account_id: string;
  account_name: string;
  current_balance: number;
  monthly_contribution: number;
  hajj_projection: {
    years_to_hajj: number;
    projected_balance: number;
    hajj_cost_target: number;
    shortfall: number;
  };
}

export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
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

export const exportGoalsToCSV = (goals: Goal[]) => {
  const data = goals.map(goal => ({
    Name: goal.name,
    Category: goal.category,
    'Target Amount': goal.target_amount,
    'Current Amount': goal.current_amount || 0,
    'Target Date': goal.target_date,
    'Progress %': goal.target_amount > 0 
      ? ((goal.current_amount || 0) / goal.target_amount * 100).toFixed(2)
      : '0.00',
    Status: goal.is_achieved ? 'Achieved' : 'In Progress',
  }));

  exportToCSV(data, 'financial-goals.csv');
};

export const exportAccountsToCSV = (accounts: ExportAccount[]) => {
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

export const exportBalanceHistoryToCSV = (entries: (BalanceEntry & { account_name?: string })[]) => {
  const data = entries.map(entry => ({
    Date: entry.entry_date,
    Account: entry.account_name || '',
    Balance: entry.balance,
    Notes: entry.notes || '',
  }));

  exportToCSV(data, 'balance-history.csv');
};

export const generateFinancialReportHTML = (
  user: ExportUser,
  netWorth: number,
  goals: Goal[],
  accounts: ExportAccount[],
  achievements: Achievement[]
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
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${
        goal.target_amount > 0 
          ? ((goal.current_amount || 0) / goal.target_amount * 100).toFixed(1)
          : '0.0'
      }%</td>
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
    .map(
      achievement => `
    <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 8px;">
      <strong>${achievement.achievement_name}</strong><br>
      <small style="color: #6b7280;">${achievement.achievement_description || 'Achievement unlocked!'}</small><br>
      <small style="color: #9ca3af;">Earned: ${formatDate(achievement.earned_at)}</small>
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
        <div class="metric-value">${achievements.length}</div>
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
    ${achievements.length === 0 ? '<p style="color: #6b7280;">No achievements earned yet.</p>' : achievementsHTML}
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
  user: ExportUser,
  netWorth: number,
  goals: Goal[],
  accounts: ExportAccount[],
  achievements: Achievement[]
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

export const exportAllData = (goals: Goal[], accounts: ExportAccount[], balanceEntries: (BalanceEntry & { account_name?: string })[]) => {
  exportGoalsToCSV(goals);
  setTimeout(() => exportAccountsToCSV(accounts), 500);
  setTimeout(() => exportBalanceHistoryToCSV(balanceEntries), 1000);
};

export const exportToJSON = (data: unknown, filename: string) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to generate JSON file');
  }
};

const fetchBalanceHistory = async (userId: string, accountIds: string[]) => {
  try {
    if (accountIds.length === 0) return [];

    const { data, error } = await supabase
      .from('balance_entries')
      .select('*')
      .eq('user_id', userId)
      .in('account_id', accountIds)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching balance history:', error);
    return [];
  }
};

const fetchGoalProgressHistory = async (userId: string, goalIds: string[]) => {
  try {
    if (goalIds.length === 0) return [];

    const { data, error } = await supabase
      .from('goal_progress_history')
      .select('*')
      .eq('user_id', userId)
      .in('goal_id', goalIds)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.warn('Goal progress history table may not exist:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn('Error fetching goal progress history:', error);
    return [];
  }
};

const fetchAccountGoalAllocations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('account_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching account goal allocations:', error);
    return [];
  }
};

const calculateAllGoalProjections = (goals: Goal[]) => {
  return goals.map(goal => {
    try {
      const monthlyContribution = 500;
      const projection = calculateGoalProjection(
        goal.current_amount || 0,
        goal.target_amount,
        goal.target_date,
        monthlyContribution,
        goal.created_at
      );

      const now = new Date();
      const target = new Date(goal.target_date);
      const monthsRemaining = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const progressPercentage = goal.target_amount > 0 
        ? ((goal.current_amount || 0) / goal.target_amount) * 100
        : 0;

      return {
        goal_id: goal.id,
        goal_name: goal.name,
        projection: {
          monthly_savings_needed: projection.monthlyNeeded,
          projected_completion_date: projection.projectedCompletionDate,
          status: projection.status,
          difference_from_target: projection.difference,
          months_remaining: monthsRemaining,
          progress_percentage: progressPercentage,
          current_amount: goal.current_amount || 0,
          target_amount: goal.target_amount,
          is_on_track: projection.status === 'on-track' || projection.status === 'ahead'
        }
      };
    } catch (error) {
      console.error(`Error calculating projection for goal ${goal.id}:`, error);
      return {
        goal_id: goal.id,
        goal_name: goal.name,
        projection: null,
        error: 'Failed to calculate projection'
      };
    }
  });
};

const calculateInvestmentProjections = (accounts: ExportAccount[]): InvestmentProjections => {
  const projections: InvestmentProjections = {
    asb: [],
    epf: [],
    tabung_haji: []
  };

  accounts.forEach(account => {
    try {
      if (account.account_type === 'ASB') {
        const asbProjection = calculateASBProjection(
          account.current_balance,
          account.units_held || 0,
          account.monthly_contribution || 0,
          5
        );
        projections.asb.push({
          account_id: account.id,
          account_name: account.name,
          current_balance: account.current_balance,
          units_held: account.units_held || 0,
          monthly_contribution: account.monthly_contribution || 0,
          five_year_projection: {
            projected_balance: asbProjection.projectedBalance,
            total_dividends: asbProjection.totalDividends,
            total_contributions: asbProjection.totalContributions
          }
        });
      } else if (account.account_type === 'EPF') {
        const epfProjection = calculateEPFProjection(
          account.current_balance,
          account.epf_age || 30,
          account.epf_monthly_salary || 0,
          55,
          11,
          12,
          true
        );
        projections.epf.push({
          account_id: account.id,
          account_name: account.name,
          current_balance: account.current_balance,
          current_age: account.epf_age || 30,
          monthly_salary: account.epf_monthly_salary || 0,
          retirement_projection: {
            projected_balance_at_55: epfProjection.projectedBalance,
            years_to_retirement: epfProjection.yearsToRetirement,
            retirement_benchmark: epfProjection.benchmark,
            status: epfProjection.status,
            additional_needed: epfProjection.additionalNeeded,
            monthly_contribution: epfProjection.monthlyContribution
          }
        });
      } else if (account.account_type === 'Tabung Haji') {
        const thProjection = calculateTabungHajiProjection(
          account.current_balance,
          account.monthly_contribution || 0,
          HAJJ_COST_2025
        );
        projections.tabung_haji.push({
          account_id: account.id,
          account_name: account.name,
          current_balance: account.current_balance,
          monthly_contribution: account.monthly_contribution || 0,
          hajj_projection: {
            years_to_hajj: thProjection.yearsToHajj,
            projected_balance: thProjection.projectedBalance,
            hajj_cost_target: HAJJ_COST_2025,
            shortfall: thProjection.shortfall
          }
        });
      }
    } catch (error) {
      console.error(`Error calculating projection for account ${account.id}:`, error);
    }
  });

  return projections;
};

export const exportComprehensiveDashboardJSON = async (
  user: ExportUser,
  netWorth: number,
  goals: Goal[],
  accounts: ExportAccount[],
  achievements: Achievement[]
) => {
  try {
    if (!user) throw new Error('User information is required');

    const exportTimestamp = new Date().toISOString();
    const accountIds = accounts.map(a => a.id);
    const goalIds = goals.map(g => g.id);

    const [balanceHistory, goalProgressHistory, accountGoalAllocations] = await Promise.all([
      fetchBalanceHistory(user.id, accountIds),
      fetchGoalProgressHistory(user.id, goalIds),
      fetchAccountGoalAllocations(user.id)
    ]);

    const goalProjections = calculateAllGoalProjections(goals);
    const investmentProjections = calculateInvestmentProjections(accounts);

    const groupedBalanceHistory: Record<string, BalanceEntry[]> = {};
    accountIds.forEach(id => {
      groupedBalanceHistory[id] = balanceHistory.filter(entry => entry.account_id === id);
    });

    const groupedProgressHistory: Record<string, BalanceEntry[]> = {};
    goalIds.forEach(id => {
      groupedProgressHistory[id] = goalProgressHistory.filter(entry => entry.goal_id === id);
    });

    const enhancedAccounts = accounts.map(account => ({
      ...account,
      balance_history: groupedBalanceHistory[account.id] || [],
      balance_history_count: (groupedBalanceHistory[account.id] || []).length
    }));

    const enhancedGoals = goals.map(goal => {
      const allocations = accountGoalAllocations.filter(a => a.goal_id === goal.id);
      const projection = goalProjections.find(p => p.goal_id === goal.id);
      const progressHistory = groupedProgressHistory[goal.id] || [];

      return {
        ...goal,
        account_allocations: allocations.map(alloc => ({
          account_id: alloc.account_id,
          allocation_percentage: alloc.allocation_percentage,
          account_name: accounts.find(a => a.id === alloc.account_id)?.name || 'Unknown'
        })),
        projection: projection?.projection || null,
        progress_history: progressHistory,
        progress_history_count: progressHistory.length
      };
    });

    const exportData = {
      metadata: {
        export_version: '1.0',
        export_timestamp: exportTimestamp,
        dashboard_name: 'Malaysian Finance Tracker',
        exported_by: user.email,
        user_id: user.id,
        record_counts: {
          total_accounts: accounts.length,
          total_goals: goals.length,
          active_goals: goals.filter(g => !g.is_achieved).length,
          achieved_goals: goals.filter(g => g.is_achieved).length,
          total_achievements: achievements.length,
          total_balance_entries: balanceHistory.length,
          total_goal_progress_entries: goalProgressHistory.length
        }
      },
      financial_overview: {
        total_net_worth: netWorth,
        total_accounts: accounts.length,
        total_goals: goals.length,
        active_goals_count: goals.filter(g => !g.is_achieved).length,
        achieved_goals_count: goals.filter(g => g.is_achieved).length,
        total_achievements: achievements.length
      },
      accounts: enhancedAccounts,
      goals: enhancedGoals,
      achievements: achievements,
      investment_projections: investmentProjections,
      goal_projections: goalProjections,
      balance_history_summary: {
        total_entries: balanceHistory.length,
        oldest_entry: balanceHistory.length > 0 ? balanceHistory[balanceHistory.length - 1]?.entry_date : null,
        newest_entry: balanceHistory.length > 0 ? balanceHistory[0]?.entry_date : null
      }
    };

    const filename = `malaysian-finance-tracker-${new Date().toISOString().split('T')[0]}.json`;
    exportToJSON(exportData, filename);

    return {
      success: true,
      recordCount: balanceHistory.length + goals.length + accounts.length + achievements.length,
      filename
    };
  } catch (error: unknown) {
    console.error('Error exporting comprehensive dashboard JSON:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to export dashboard data');
  }
};
