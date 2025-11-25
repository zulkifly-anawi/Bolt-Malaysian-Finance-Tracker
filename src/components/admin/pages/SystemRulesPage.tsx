import { useState, useEffect, useCallback } from 'react';
import { Settings, Shield, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../services/auditService';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  value_type: string;
  category: string;
  description: string;
  is_active: boolean;
}

interface ValidationRule {
  id: string;
  rule_name: string;
  field_name: string;
  rule_type: string;
  rule_value: any;
  error_message: string;
  is_active: boolean;
}

export const SystemRulesPage = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'rules'>('settings');
  const [error, setError] = useState('');
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [editingRule, setEditingRule] = useState<ValidationRule | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsData, rulesData] = await Promise.all([
        supabase.from('admin_config_system_settings').select('*').order('category').order('setting_key'),
        supabase.from('admin_config_validation_rules').select('*').order('field_name'),
      ]);

      if (settingsData.error) throw settingsData.error;
      if (rulesData.error) throw rulesData.error;

      setSettings(settingsData.data || []);
      setRules(rulesData.data || []);
    } catch (err: unknown) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateSetting = async (setting: SystemSetting, newValue: string) => {
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('admin_config_system_settings')
        .update({ setting_value: newValue })
        .eq('id', setting.id);

      if (updateError) throw updateError;

      await auditService.logAction({
        action_type: 'UPDATE',
        table_name: 'admin_config_system_settings',
        record_id: setting.id,
        old_value: { setting_value: setting.setting_value },
        new_value: { setting_value: newValue },
      });

      await loadData();
      setEditingSetting(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      console.error('Update error:', err);
    }
  };

  const handleUpdateRule = async (rule: ValidationRule, newValue: any, newErrorMessage: string) => {
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('admin_config_validation_rules')
        .update({
          rule_value: newValue,
          error_message: newErrorMessage,
        })
        .eq('id', rule.id);

      if (updateError) throw updateError;

      await auditService.logAction({
        action_type: 'UPDATE',
        table_name: 'admin_config_validation_rules',
        record_id: rule.id,
        old_value: { rule_value: rule.rule_value, error_message: rule.error_message },
        new_value: { rule_value: newValue, error_message: newErrorMessage },
      });

      await loadData();
      setEditingRule(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update rule');
      console.error('Update error:', err);
    }
  };

  const toggleSettingActive = async (setting: SystemSetting) => {
    try {
      const { error: updateError } = await supabase
        .from('admin_config_system_settings')
        .update({ is_active: !setting.is_active })
        .eq('id', setting.id);

      if (updateError) throw updateError;

      await auditService.logAction({
        action_type: 'UPDATE',
        table_name: 'admin_config_system_settings',
        record_id: setting.id,
        old_value: { is_active: setting.is_active },
        new_value: { is_active: !setting.is_active },
      });

      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle setting');
    }
  };

  const toggleRuleActive = async (rule: ValidationRule) => {
    try {
      const { error: updateError } = await supabase
        .from('admin_config_validation_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (updateError) throw updateError;

      await auditService.logAction({
        action_type: 'UPDATE',
        table_name: 'admin_config_validation_rules',
        record_id: rule.id,
        old_value: { is_active: rule.is_active },
        new_value: { is_active: !rule.is_active },
      });

      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle rule');
    }
  };

  const settingsByCategory = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Rules & Settings</h1>
        <p className="text-white/70">Manage system configuration and validation rules</p>
      </div>

      {error && (
        <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'settings'
              ? 'glass-button text-white'
              : 'glass text-white/70 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          System Settings
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'rules'
              ? 'glass-button text-white'
              : 'glass text-white/70 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Validation Rules
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
        </div>
      ) : activeTab === 'settings' ? (
        <div className="space-y-6">
          {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
            <div key={category} className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                {category}
              </h2>

              <div className="space-y-4">
                {categorySettings.map((setting) => (
                  <SettingItem
                    key={setting.id}
                    setting={setting}
                    isEditing={editingSetting?.id === setting.id}
                    onEdit={() => setEditingSetting(setting)}
                    onCancel={() => setEditingSetting(null)}
                    onSave={(newValue) => handleUpdateSetting(setting, newValue)}
                    onToggleActive={() => toggleSettingActive(setting)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Validation Rules
          </h2>

          <div className="space-y-4">
            {rules.map((rule) => (
              <ValidationRuleItem
                key={rule.id}
                rule={rule}
                isEditing={editingRule?.id === rule.id}
                onEdit={() => setEditingRule(rule)}
                onCancel={() => setEditingRule(null)}
                onSave={(newValue, newErrorMessage) => handleUpdateRule(rule, newValue, newErrorMessage)}
                onToggleActive={() => toggleRuleActive(rule)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SettingItem = ({
  setting,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onToggleActive,
}: {
  setting: SystemSetting;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (value: string) => void;
  onToggleActive: () => void;
}) => {
  const [editValue, setEditValue] = useState(setting.setting_value);

  useEffect(() => {
    setEditValue(setting.setting_value);
  }, [setting.setting_value]);

  if (isEditing) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {setting.setting_key}
            </label>
            <input
              type={setting.value_type === 'number' ? 'number' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
            />
            {setting.description && (
              <p className="text-xs text-white/50 mt-1">{setting.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 glass text-white/70 hover:text-white rounded-lg text-sm font-medium transition-all"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancel
            </button>
            <button
              onClick={() => onSave(editValue)}
              className="flex-1 px-3 py-2 glass-button text-white rounded-lg text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold text-white">{setting.setting_key}</h3>
          <button
            onClick={onToggleActive}
            className={`px-2 py-1 rounded-lg text-xs font-semibold ${
              setting.is_active
                ? 'bg-green-500/20 text-green-300'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {setting.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
        {setting.description && (
          <p className="text-sm text-white/60 mb-2">{setting.description}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Current value:</span>
          <code className="glass px-2 py-1 rounded text-sm font-mono text-cyan-300">
            {setting.setting_value}
          </code>
          <span className="text-xs text-white/40">({setting.value_type})</span>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="p-2 glass-card text-blue-300 hover:text-blue-400 rounded-lg transition-all"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const ValidationRuleItem = ({
  rule,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onToggleActive,
}: {
  rule: ValidationRule;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (value: any, errorMessage: string) => void;
  onToggleActive: () => void;
}) => {
  const [editValue, setEditValue] = useState(JSON.stringify(rule.rule_value, null, 2));
  const [editErrorMessage, setEditErrorMessage] = useState(rule.error_message);

  useEffect(() => {
    setEditValue(JSON.stringify(rule.rule_value, null, 2));
    setEditErrorMessage(rule.error_message);
  }, [rule]);

  const handleSave = () => {
    try {
      const parsedValue = JSON.parse(editValue);
      onSave(parsedValue, editErrorMessage);
    } catch (err) {
      alert('Invalid JSON format');
    }
  };

  if (isEditing) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Rule Value (JSON)</label>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 glass-card text-white font-mono text-sm rounded-lg focus:ring-2 focus:ring-white/30 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Error Message</label>
            <input
              type="text"
              value={editErrorMessage}
              onChange={(e) => setEditErrorMessage(e.target.value)}
              className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 glass text-white/70 hover:text-white rounded-lg text-sm font-medium transition-all"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 glass-button text-white rounded-lg text-sm font-semibold transition-all"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-white">{rule.rule_name}</h3>
            <button
              onClick={onToggleActive}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                rule.is_active
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {rule.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Field:</span>
              <code className="glass px-2 py-1 rounded font-mono text-white">{rule.field_name}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Type:</span>
              <span className="glass px-2 py-1 rounded text-white/80">{rule.rule_type}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white/50">Value:</span>
              <code className="glass px-2 py-1 rounded font-mono text-cyan-300 text-xs">
                {JSON.stringify(rule.rule_value)}
              </code>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-white/50">Error:</span>
              <span className="text-red-300 text-xs">{rule.error_message}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 glass-card text-blue-300 hover:text-blue-400 rounded-lg transition-all"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
