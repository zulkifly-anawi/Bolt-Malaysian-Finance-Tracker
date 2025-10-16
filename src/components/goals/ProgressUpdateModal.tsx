import { useState } from 'react';
import { X, Plus, Minus, Equal, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import type { Goal } from '../../types/database';

interface ProgressUpdateModalProps {
  goal: Goal;
  accountProgress: number;
  onClose: () => void;
  onSuccess: () => void;
}

type OperationType = 'add' | 'subtract' | 'set';

export const ProgressUpdateModal = ({ goal, accountProgress, onClose, onSuccess }: ProgressUpdateModalProps) => {
  const { user } = useAuth();
  const [operation, setOperation] = useState<OperationType>('add');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentManual = goal.manual_amount || 0;
  const currentTotal = accountProgress + currentManual;

  const calculateNewManualAmount = (): number => {
    const inputAmount = parseFloat(amount) || 0;

    switch (operation) {
      case 'add':
        return currentManual + inputAmount;
      case 'subtract':
        return currentManual - inputAmount;
      case 'set':
        return inputAmount;
      default:
        return currentManual;
    }
  };

  const newManualAmount = calculateNewManualAmount();
  const newTotal = accountProgress + newManualAmount;
  const newPercentage = (newTotal / goal.target_amount) * 100;
  const currentPercentage = (currentTotal / goal.target_amount) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const inputAmount = parseFloat(amount);

      const { error: entryError } = await supabase
        .from('goal_progress_entries')
        .insert({
          goal_id: goal.id,
          user_id: user.id,
          entry_type: operation,
          amount: inputAmount,
          previous_manual_amount: currentManual,
          new_manual_amount: newManualAmount,
          notes: notes.trim() || null,
        });

      if (entryError) throw entryError;

      const { error: updateError } = await supabase
        .from('goals')
        .update({
          manual_amount: newManualAmount,
          last_progress_update: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update progress. Please try again.');
      console.error('Progress update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOperationLabel = () => {
    switch (operation) {
      case 'add': return 'Add to Progress';
      case 'subtract': return 'Subtract from Progress';
      case 'set': return 'Set Manual Amount';
    }
  };

  const getChangeDisplay = () => {
    const inputAmount = parseFloat(amount) || 0;
    if (inputAmount === 0) return null;

    switch (operation) {
      case 'add':
        return `+${formatCurrency(inputAmount)}`;
      case 'subtract':
        return `-${formatCurrency(inputAmount)}`;
      case 'set':
        const diff = newManualAmount - currentManual;
        return diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Update Progress</h2>
                <p className="text-sm text-white text-opacity-80">{goal.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white text-opacity-80 hover:text-opacity-100 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="glass rounded-2xl p-4 mb-6">
            <p className="text-sm text-white text-opacity-80 mb-3">Current Progress Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-opacity-90">From Accounts:</span>
                <span className="font-semibold text-white">{formatCurrency(accountProgress)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-opacity-90">Manual Contributions:</span>
                <span className="font-semibold text-white">{formatCurrency(currentManual)}</span>
              </div>
              <div className="pt-2 border-t border-white border-opacity-20">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Progress:</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(currentTotal)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white text-opacity-80 text-sm">Target:</span>
                  <span className="text-white text-opacity-80 text-sm">{formatCurrency(goal.target_amount)}</span>
                </div>
              </div>
              <div className="w-full glass rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                />
              </div>
              <p className="text-center text-white font-semibold">{currentPercentage.toFixed(1)}%</p>
            </div>
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
              <label className="block text-sm font-medium text-white text-opacity-95 mb-3">
                Operation Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    operation === 'add'
                      ? 'glass-button text-white'
                      : 'glass text-white text-opacity-60 hover:text-opacity-100'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('subtract')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    operation === 'subtract'
                      ? 'glass-button text-white'
                      : 'glass text-white text-opacity-60 hover:text-opacity-100'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  Subtract
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('set')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    operation === 'set'
                      ? 'glass-button text-white'
                      : 'glass text-white text-opacity-60 hover:text-opacity-100'
                  }`}
                >
                  <Equal className="w-4 h-4" />
                  Set
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Amount (RM) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 glass-card text-white text-lg placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                placeholder="Enter amount"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all resize-none"
                placeholder="What is this update for? (e.g., Monthly salary, Cash deposit)"
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="glass-button rounded-2xl p-4 border-2 border-white border-opacity-20">
                <p className="text-sm text-white text-opacity-90 mb-3 font-medium">Preview Changes</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-opacity-80">Current Manual Amount:</span>
                    <span className="font-semibold text-white">{formatCurrency(currentManual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-opacity-80">Change:</span>
                    <span className={`font-semibold ${
                      operation === 'subtract' ? 'text-orange-300' : 'text-green-300'
                    }`}>
                      {getChangeDisplay()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white border-opacity-20">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">New Manual Amount:</span>
                      <span className="font-bold text-white">{formatCurrency(newManualAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white font-medium">New Total Progress:</span>
                      <span className="font-bold text-white text-lg">{formatCurrency(newTotal)}</span>
                    </div>
                  </div>
                  <div className="w-full glass rounded-full h-2 mt-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(newPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-opacity-80">
                      {currentPercentage.toFixed(1)}%
                    </span>
                    <span className="text-white font-bold text-lg">
                      {newPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
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
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="flex-1 px-4 py-3 glass-button text-white rounded-xl font-semibold disabled:opacity-50 transition-all"
              >
                {loading ? 'Updating...' : getOperationLabel()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
