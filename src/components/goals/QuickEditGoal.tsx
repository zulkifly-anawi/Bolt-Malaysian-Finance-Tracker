import { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateInput } from '../../utils/formatters';
import type { Goal } from '../../types/database';

interface QuickEditGoalProps {
  goal: Goal;
  onCancel: () => void;
  onSuccess: () => void;
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

export const QuickEditGoal = ({ goal, onCancel, onSuccess }: QuickEditGoalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: goal.name,
    category: goal.category || 'Other',
    targetDate: formatDateInput(goal.target_date),
    priority: goal.priority as 'high' | 'medium' | 'low',
    description: goal.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      setError('Goal name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          name: formData.name.trim(),
          category: formData.category,
          target_date: formData.targetDate,
          priority: formData.priority,
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update goal. Please try again.');
      console.error('Quick edit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border-2 border-white border-opacity-20">
      {error && (
        <div className="glass-strong rounded-xl p-3 mb-4 border border-red-500 border-opacity-30">
          <div className="flex items-center gap-2 text-red-200 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white text-opacity-90 mb-2">
            Goal Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 glass-card text-white placeholder-white placeholder-opacity-40 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-30 outline-none transition-all text-sm"
            placeholder="e.g., Emergency Fund"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white text-opacity-90 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-30 outline-none transition-all text-sm"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white text-opacity-90 mb-2">
              Target Date *
            </label>
            <input
              type="date"
              required
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-30 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white text-opacity-90 mb-2">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
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
          <label className="block text-sm font-medium text-white text-opacity-90 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 glass-card text-white placeholder-white placeholder-opacity-40 rounded-lg focus:ring-2 focus:ring-white focus:ring-opacity-30 outline-none transition-all resize-none text-sm"
            placeholder="Add notes or details..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 glass text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 glass-button text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
