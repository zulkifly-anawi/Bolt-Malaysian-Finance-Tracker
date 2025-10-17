export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  monthly_salary: number;
  notifications_enabled: boolean;
  email_reminders_enabled: boolean;
  last_balance_update: string | null;
  epf_employee_contribution_percentage: number;
  epf_employer_contribution_percentage: number;
  use_custom_epf_contribution: boolean;
  include_employer_contribution: boolean;
  created_at: string;
  updated_at: string;
}

export type EPFSavingsType = 'Conventional' | 'Syariah';
export type EPFDividendRateMethod = 'latest' | '3-year-average' | '5-year-average' | 'historical-average';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  account_type_id: string | null;
  account_type: string | null;
  institution_name: string | null;
  institution: string | null;
  current_balance: number;
  units_held: number;
  monthly_contribution: number;
  dividend_rate: number;
  employee_contribution_percentage: number | null;
  employer_contribution_percentage: number | null;
  use_total_contribution: boolean;
  is_manual_contribution: boolean;
  pilgrimage_goal_type: 'Hajj' | 'Umrah' | null;
  epf_savings_type: EPFSavingsType | null;
  epf_dividend_rate_method: EPFDividendRateMethod | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category: string | null;
  target_amount: number;
  current_amount: number;
  manual_amount: number;
  target_date: string;
  priority: string;
  photo_url: string | null;
  is_achieved: boolean;
  achieved_at: string | null;
  last_progress_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountGoal {
  id: string;
  account_id: string;
  goal_id: string;
  allocation_percentage: number | null;
  created_at: string;
}

export interface BalanceEntry {
  id: string;
  account_id: string;
  entry_date: string;
  balance: number;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description: string | null;
  icon: string | null;
  earned_at: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  default_amount: number;
  icon: string | null;
  created_at: string;
}

export interface DividendHistory {
  id: string;
  account_type: string;
  year: number;
  dividend_rate: number;
  created_at: string;
}

export interface GoalProgressEntry {
  id: string;
  goal_id: string;
  user_id: string;
  entry_type: 'add' | 'subtract' | 'set';
  amount: number;
  previous_manual_amount: number;
  new_manual_amount: number;
  notes: string | null;
  created_at: string;
}

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}
