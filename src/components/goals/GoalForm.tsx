import { useState, useEffect } from 'react';
import { X, Target, AlertCircle, Hand, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDateInput } from '../../utils/formatters';
import { validateGoalData } from '../../utils/validation';
import type { Goal } from '../../types/database';
import { useGoalCategories } from '../../hooks/useConfig';
import { AccountSelector, type SelectedAccount } from './AccountSelector';

interface GoalFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    name: string;
    category: string;
    targetAmount: number;
    description?: string;
  };
  editData?: Goal;
}

export const GoalForm = ({ onClose, onSuccess, initialData, editData }: GoalFormProps) => {
  const { user } = useAuth();
  const { categories } = useGoalCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    name: editData?.name || initialData?.name || '',
    category: editData?.category || initialData?.category || 'Other',
    targetAmount: editData?.target_amount || initialData?.targetAmount || 0,
    targetDate: editData?.target_date ? formatDateInput(editData.target_date) : '',
    description: editData?.description || initialData?.description || '',
    priority: (editData?.priority || 'medium') as 'high' | 'medium' | 'low',
  });

  // Tracking mode state (manual vs account-linked)
  const [trackingMode, setTrackingMode] = useState<'manual' | 'account-linked'>(
    editData?.is_manual_goal === false ? 'account-linked' : 'manual'
  );

  // Selected accounts for account-linked mode
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>([]);

    // Load existing account-goal links when editing
    useEffect(() => {
      const loadAccountLinks = async () => {
        if (!editData?.id || trackingMode !== 'account-linked') return;

        try {
          const { data: links, error } = await supabase
            .from('account_goals')
            .select(`
              account_id,
              allocation_percentage,
              accounts (
                id,
                name,
                current_balance
              )
            `)
            .eq('goal_id', editData.id);

          if (error) throw error;

          if (links && links.length > 0) {
            const mappedAccounts: SelectedAccount[] = links
                .filter((link): link is typeof link & { 
                  accounts: { id: string; name: string; current_balance: number } 
                } => 
                  link.accounts !== null
                )
              .map(link => ({
                accountId: link.account_id,
                  accountName: (link.accounts as any).name,
                  currentBalance: (link.accounts as any).current_balance,
                allocationPercentage: link.allocation_percentage,
                  estimatedContribution: ((link.accounts as any).current_balance * link.allocation_percentage) / 100,
              }));

            setSelectedAccounts(mappedAccounts);
          }
        } catch (err) {
          console.error('Error loading account links:', err);
          // Don't show error to user, just log it
        }
      };

      loadAccountLinks();
    }, [editData?.id, trackingMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

      // Validate account-linked mode has at least one account selected
      if (trackingMode === 'account-linked' && selectedAccounts.length === 0) {
        setError('Please select at least one account to link to this goal.');
        setLoading(false);
        return;
      }

      // Validate total allocation doesn't exceed 100%
      if (trackingMode === 'account-linked') {
        const totalAllocation = selectedAccounts.reduce((sum, acc) => sum + acc.allocationPercentage, 0);
        if (totalAllocation > 100) {
          setError('Total allocation percentage cannot exceed 100%.');
          setLoading(false);
          return;
        }
      }

    const validation = validateGoalData({
      name: formData.name,
      target_amount: formData.targetAmount,
      target_date: formData.targetDate,
    });

    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && editData) {
          // Update goal with is_manual_goal flag
        const { error: updateError } = await supabase
          .from('goals')
          .update({
            name: formData.name,
            category: formData.category,
            target_amount: formData.targetAmount,
            target_date: formData.targetDate,
            description: formData.description,
            priority: formData.priority,
              is_manual_goal: trackingMode === 'manual',
            updated_at: new Date().toISOString(),
          })
          .eq('id', editData.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

          // Handle account-goal link changes
          // First, delete existing links
          const { error: deleteError } = await supabase
            .from('account_goals')
            .delete()
            .eq('goal_id', editData.id);

          if (deleteError) throw deleteError;

          // If account-linked mode, create new account_goals entries
          if (trackingMode === 'account-linked' && selectedAccounts.length > 0) {
            const accountGoalsData = selectedAccounts.map(acc => ({
              goal_id: editData.id,
              account_id: acc.accountId,
              allocation_percentage: acc.allocationPercentage,
            }));

            const { error: linkError } = await supabase
              .from('account_goals')
              .insert(accountGoalsData);

            if (linkError) throw linkError;
          }
      } else {
          // Insert goal with is_manual_goal flag
          const { data: newGoal, error: insertError } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              name: formData.name,
              category: formData.category,
              target_amount: formData.targetAmount,
              target_date: formData.targetDate,
              description: formData.description,
              priority: formData.priority,
              current_amount: 0,
              is_manual_goal: trackingMode === 'manual',
            })
            .select()
            .single();

        if (insertError) throw insertError;

          // If account-linked mode, create account_goals entries
          if (trackingMode === 'account-linked' && newGoal && selectedAccounts.length > 0) {
            const accountGoalsData = selectedAccounts.map(acc => ({
              goal_id: newGoal.id,
              account_id: acc.accountId,
              allocation_percentage: acc.allocationPercentage,
            }));

            const { error: linkError } = await supabase
              .from('account_goals')
              .insert(accountGoalsData);

            if (linkError) throw linkError;
          }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} goal. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glow" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass-button rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Financial Goal' : 'Create Financial Goal'}</h2>
                <p className="text-sm text-white text-opacity-80">{isEditMode ? 'Update your goal details' : 'Set your target and track your progress'}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white text-opacity-80 hover:text-opacity-100 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="glass-strong rounded-2xl p-4 mb-4 border border-red-500 border-opacity-30">
              <div className="flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tracking Mode Toggle */}
            <div className="glass-card rounded-2xl p-4">
              <label className="block text-sm font-medium text-white text-opacity-95 mb-3">
                Track Progress By
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTrackingMode('manual')}
                  className={`p-4 rounded-xl transition-all ${
                    trackingMode === 'manual'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg'
                      : 'glass-card hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Hand className="w-6 h-6 text-white" />
                    <span className="text-sm font-semibold text-white">Manual Entry</span>
                    <span className="text-xs text-white text-opacity-70 text-center">
                      Update progress manually
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingMode('account-linked')}
                  className={`p-4 rounded-xl transition-all ${
                    trackingMode === 'account-linked'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                      : 'glass-card hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <LinkIcon className="w-6 h-6 text-white" />
                    <span className="text-sm font-semibold text-white">Linked Accounts</span>
                    <span className="text-xs text-white text-opacity-70 text-center">
                      Track from account balances
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Goal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                placeholder="e.g., Emergency Fund"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-gray-800">
                    {cat.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Target Amount (RM) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.targetAmount || ''}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['high', 'medium', 'low'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      formData.priority === priority
                        ? 'glass-button text-white'
                        : 'glass text-white text-opacity-60 hover:text-opacity-100'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Selector (only show for account-linked mode) */}
            {trackingMode === 'account-linked' && (
              <AccountSelector
                selectedAccounts={selectedAccounts}
                onSelectionChange={setSelectedAccounts}
                disabled={loading}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all resize-none"
                placeholder="Add any notes or details about this goal..."
              />
            </div>

            {formData.targetAmount > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-sm text-white text-opacity-80 mb-1">Target Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(formData.targetAmount)}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 glass text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 glass-button text-white rounded-xl font-semibold disabled:opacity-50 transition-all"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Goal' : 'Create Goal')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
