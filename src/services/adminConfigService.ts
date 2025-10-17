import { supabase } from '../lib/supabase';
import { auditService } from './auditService';
import type { AccountType, Institution, GoalCategory, SystemSetting } from './configService';

export const adminConfigService = {
  async createAccountType(data: Omit<AccountType, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('admin_config_account_types')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'CREATE',
      table_name: 'admin_config_account_types',
      record_id: result.id,
      new_value: result,
    });

    return result;
  },

  async updateAccountType(id: string, data: Partial<AccountType>) {
    const { data: oldData } = await supabase
      .from('admin_config_account_types')
      .select('*')
      .eq('id', id)
      .single();

    const { data: result, error } = await supabase
      .from('admin_config_account_types')
      .update({
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'UPDATE',
      table_name: 'admin_config_account_types',
      record_id: id,
      old_value: oldData,
      new_value: result,
    });

    return result;
  },

  async deleteAccountType(id: string) {
    const { data: oldData } = await supabase
      .from('admin_config_account_types')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('admin_config_account_types')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await auditService.logAction({
      action_type: 'DELETE',
      table_name: 'admin_config_account_types',
      record_id: id,
      old_value: oldData,
    });
  },

  async createInstitution(data: Omit<Institution, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('admin_config_institutions')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'CREATE',
      table_name: 'admin_config_institutions',
      record_id: result.id,
      new_value: result,
    });

    return result;
  },

  async updateInstitution(id: string, data: Partial<Institution>) {
    const { data: oldData } = await supabase
      .from('admin_config_institutions')
      .select('*')
      .eq('id', id)
      .single();

    const { data: result, error } = await supabase
      .from('admin_config_institutions')
      .update({
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'UPDATE',
      table_name: 'admin_config_institutions',
      record_id: id,
      old_value: oldData,
      new_value: result,
    });

    return result;
  },

  async deleteInstitution(id: string) {
    const { data: oldData } = await supabase
      .from('admin_config_institutions')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('admin_config_institutions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await auditService.logAction({
      action_type: 'DELETE',
      table_name: 'admin_config_institutions',
      record_id: id,
      old_value: oldData,
    });
  },

  async createGoalCategory(data: Omit<GoalCategory, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('admin_config_goal_categories')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'CREATE',
      table_name: 'admin_config_goal_categories',
      record_id: result.id,
      new_value: result,
    });

    return result;
  },

  async updateGoalCategory(id: string, data: Partial<GoalCategory>) {
    const { data: oldData } = await supabase
      .from('admin_config_goal_categories')
      .select('*')
      .eq('id', id)
      .single();

    const { data: result, error } = await supabase
      .from('admin_config_goal_categories')
      .update({
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'UPDATE',
      table_name: 'admin_config_goal_categories',
      record_id: id,
      old_value: oldData,
      new_value: result,
    });

    return result;
  },

  async deleteGoalCategory(id: string) {
    const { data: oldData } = await supabase
      .from('admin_config_goal_categories')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('admin_config_goal_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await auditService.logAction({
      action_type: 'DELETE',
      table_name: 'admin_config_goal_categories',
      record_id: id,
      old_value: oldData,
    });
  },

  async updateSystemSetting(key: string, value: string) {
    const { data: oldData } = await supabase
      .from('admin_config_system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    const { data: result, error } = await supabase
      .from('admin_config_system_settings')
      .update({
        setting_value: value,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction({
      action_type: 'UPDATE',
      table_name: 'admin_config_system_settings',
      record_id: result.id,
      old_value: oldData,
      new_value: result,
    });

    return result;
  },

  async getAllAccountTypes() {
    const { data, error } = await supabase
      .from('admin_config_account_types')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data;
  },

  async getAllInstitutions() {
    const { data, error } = await supabase
      .from('admin_config_institutions')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data;
  },

  async getAllGoalCategories() {
    const { data, error } = await supabase
      .from('admin_config_goal_categories')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data;
  },

  async getAllSystemSettings() {
    const { data, error } = await supabase
      .from('admin_config_system_settings')
      .select('*')
      .order('category, setting_key');

    if (error) throw error;
    return data;
  },

  async reorderItems(tableName: string, items: Array<{ id: string; sort_order: number }>) {
    const updates = items.map(item =>
      supabase
        .from(tableName)
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      throw new Error(`Failed to reorder items: ${errors.map(e => e.error?.message).join(', ')}`);
    }

    await auditService.logAction({
      action_type: 'REORDER',
      table_name: tableName,
      record_id: 'multiple',
      new_value: items,
    });
  },
};
