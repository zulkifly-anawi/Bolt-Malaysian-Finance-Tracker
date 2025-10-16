import { useState } from 'react';
import { X, Target, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDateInput } from '../../utils/formatters';
import { validateGoalData } from '../../utils/validation';
import type { Goal } from '../../types/database';

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

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'House Downpayment',
  'Car Purchase',
  'Hajj',
  'Children Education',
  'Retirement',
  'Wedding',
  'Business Capital',
  'Vacation',
  'Other',
];

export const GoalForm = ({ onClose, onSuccess, initialData, editData }: GoalFormProps) => {
  const { user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

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
        const { error: updateError } = await supabase
          .from('goals')
          .update({
            name: formData.name,
            category: formData.category,
            target_amount: formData.targetAmount,
            target_date: formData.targetDate,
            description: formData.description,
            priority: formData.priority,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editData.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('goals').insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          target_amount: formData.targetAmount,
          target_date: formData.targetDate,
          description: formData.description,
          priority: formData.priority,
          current_amount: 0,
        });

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} goal. Please try again.`);
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
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800">
                    {cat}
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
