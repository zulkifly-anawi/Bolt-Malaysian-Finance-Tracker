import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  admin_email: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'REORDER';
  table_name: string;
  record_id: string;
  old_value: unknown;
  new_value: unknown;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  adminUserId?: string;
  tableName?: string;
  actionType?: string;
}

export const auditService = {
  async logAction(params: {
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'REORDER';
    table_name: string;
    record_id: string;
    old_value?: unknown;
    new_value?: unknown;
  }) {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error('No user found for audit log');
        return;
      }

      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: user.id,
          admin_email: user.email || '',
          action_type: params.action_type,
          table_name: params.table_name,
          record_id: params.record_id,
          old_value: params.old_value || null,
          new_value: params.new_value || null,
          ip_address: null,
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
    }
  },

  async getAuditLogs(filter?: AuditLogFilter, limit = 100, offset = 0): Promise<AuditLogEntry[]> {
    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter?.startDate) {
      query = query.gte('timestamp', filter.startDate);
    }

    if (filter?.endDate) {
      query = query.lte('timestamp', filter.endDate);
    }

    if (filter?.adminUserId) {
      query = query.eq('admin_user_id', filter.adminUserId);
    }

    if (filter?.tableName) {
      query = query.eq('table_name', filter.tableName);
    }

    if (filter?.actionType) {
      query = query.eq('action_type', filter.actionType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async exportAuditLogs(filter?: AuditLogFilter, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const logs = await this.getAuditLogs(filter, 10000, 0);

    if (format === 'json') {
      const json = JSON.stringify(logs, null, 2);
      return new Blob([json], { type: 'application/json' });
    } else {
      const headers = [
        'Timestamp',
        'Admin Email',
        'Action Type',
        'Table Name',
        'Record ID',
        'Old Value',
        'New Value',
      ];

      const rows = logs.map(log => [
        log.timestamp,
        log.admin_email,
        log.action_type,
        log.table_name,
        log.record_id,
        JSON.stringify(log.old_value || {}),
        JSON.stringify(log.new_value || {}),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv' });
    }
  },

  async getAuditLogCount(filter?: AuditLogFilter): Promise<number> {
    let query = supabase
      .from('admin_audit_log')
      .select('id', { count: 'exact', head: true });

    if (filter?.startDate) {
      query = query.gte('timestamp', filter.startDate);
    }

    if (filter?.endDate) {
      query = query.lte('timestamp', filter.endDate);
    }

    if (filter?.adminUserId) {
      query = query.eq('admin_user_id', filter.adminUserId);
    }

    if (filter?.tableName) {
      query = query.eq('table_name', filter.tableName);
    }

    if (filter?.actionType) {
      query = query.eq('action_type', filter.actionType);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  },

  async getRecentActivity(limit = 20): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getRetentionWarnings(): Promise<AuditLogEntry[]> {
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
    sevenYearsAgo.setDate(sevenYearsAgo.getDate() + 30);

    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .lt('timestamp', sevenYearsAgo.toISOString())
      .order('timestamp');

    if (error) throw error;
    return data || [];
  },
};
