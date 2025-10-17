import { supabase } from '../lib/supabase';

export interface AccountType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Institution {
  id: string;
  name: string;
  display_name: string;
  institution_type: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface GoalCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  value_type: string;
  category: string;
  description: string | null;
  is_active: boolean;
}

export interface ValidationRule {
  id: string;
  rule_name: string;
  field_name: string;
  rule_type: string;
  rule_value: Record<string, any>;
  error_message: string;
  is_active: boolean;
}

const FALLBACK_ACCOUNT_TYPES: AccountType[] = [
  { id: '1', name: 'ASB', display_name: 'ASB (Amanah Saham Bumiputera)', description: null, is_active: true, sort_order: 1 },
  { id: '2', name: 'EPF', display_name: 'EPF (Employees Provident Fund)', description: null, is_active: true, sort_order: 2 },
  { id: '3', name: 'Tabung Haji', display_name: 'Tabung Haji', description: null, is_active: true, sort_order: 3 },
  { id: '4', name: 'Savings', display_name: 'Savings Account', description: null, is_active: true, sort_order: 4 },
  { id: '5', name: 'Fixed Deposit', display_name: 'Fixed Deposit', description: null, is_active: true, sort_order: 5 },
  { id: '6', name: 'Investment', display_name: 'Investment Account', description: null, is_active: true, sort_order: 6 },
  { id: '7', name: 'Other', display_name: 'Other', description: null, is_active: true, sort_order: 7 },
];

const FALLBACK_INSTITUTIONS: Institution[] = [
  { id: '1', name: 'KWSP (EPF)', display_name: 'KWSP (EPF)', institution_type: 'Government', is_active: true, sort_order: 1 },
  { id: '2', name: 'Maybank', display_name: 'Maybank', institution_type: 'Bank', is_active: true, sort_order: 2 },
  { id: '3', name: 'CIMB Bank', display_name: 'CIMB Bank', institution_type: 'Bank', is_active: true, sort_order: 3 },
  { id: '4', name: 'Public Bank', display_name: 'Public Bank', institution_type: 'Bank', is_active: true, sort_order: 4 },
  { id: '5', name: 'Other', display_name: 'Other', institution_type: 'Other', is_active: true, sort_order: 5 },
];

const FALLBACK_GOAL_CATEGORIES: GoalCategory[] = [
  { id: '1', name: 'Emergency Fund', display_name: 'Emergency Fund', description: null, icon: 'shield', is_active: true, sort_order: 1 },
  { id: '2', name: 'House Downpayment', display_name: 'House Downpayment', description: null, icon: 'home', is_active: true, sort_order: 2 },
  { id: '3', name: 'Car Purchase', display_name: 'Car Purchase', description: null, icon: 'car', is_active: true, sort_order: 3 },
  { id: '4', name: 'Hajj', display_name: 'Hajj', description: null, icon: 'compass', is_active: true, sort_order: 4 },
  { id: '5', name: 'Other', display_name: 'Other', description: null, icon: 'target', is_active: true, sort_order: 5 },
];

export const configService = {
  async getAccountTypes(): Promise<AccountType[]> {
    try {
      const { data, error } = await supabase
        .from('admin_config_account_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || FALLBACK_ACCOUNT_TYPES;
    } catch (error) {
      console.error('Failed to fetch account types, using fallback:', error);
      return FALLBACK_ACCOUNT_TYPES;
    }
  },

  async getInstitutions(): Promise<Institution[]> {
    try {
      const { data, error } = await supabase
        .from('admin_config_institutions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || FALLBACK_INSTITUTIONS;
    } catch (error) {
      console.error('Failed to fetch institutions, using fallback:', error);
      return FALLBACK_INSTITUTIONS;
    }
  },

  async getGoalCategories(): Promise<GoalCategory[]> {
    try {
      const { data, error } = await supabase
        .from('admin_config_goal_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || FALLBACK_GOAL_CATEGORIES;
    } catch (error) {
      console.error('Failed to fetch goal categories, using fallback:', error);
      return FALLBACK_GOAL_CATEGORIES;
    }
  },

  async getSystemSettings(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('admin_config_system_settings')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const settings: Record<string, string> = {};
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return settings;
    } catch (error) {
      console.error('Failed to fetch system settings, using defaults:', error);
      return {
        epf_employee_contribution_default: '11',
        epf_employer_contribution_default: '12',
        age_min: '18',
        age_max: '65',
      };
    }
  },

  async getValidationRules(): Promise<ValidationRule[]> {
    try {
      const { data, error } = await supabase
        .from('admin_config_validation_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch validation rules:', error);
      return [];
    }
  },
};
