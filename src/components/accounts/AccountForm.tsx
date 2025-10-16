import { useState } from 'react';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { validateAccountData } from '../../utils/validation';

interface AccountFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ACCOUNT_TYPES = [
  { value: 'ASB', label: 'ASB (Amanah Saham Bumiputera)' },
  { value: 'EPF', label: 'EPF (Employees Provident Fund)' },
  { value: 'Tabung Haji', label: 'Tabung Haji' },
  { value: 'Savings', label: 'Savings Account' },
  { value: 'Fixed Deposit', label: 'Fixed Deposit' },
  { value: 'Investment', label: 'Investment Account' },
  { value: 'Other', label: 'Other' },
];

const INSTITUTIONS = [
  'KWSP (EPF)',
  'PNB (Permodalan Nasional Berhad)',
  'Tabung Haji',
  'Maybank',
  'CIMB Bank',
  'Public Bank',
  'RHB Bank',
  'Hong Leong Bank',
  'AmBank',
  'Bank Rakyat',
  'Bank Islam',
  'HSBC',
  'Other',
];

export const AccountForm = ({ onClose, onSuccess }: AccountFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    accountType: 'ASB',
    institution: '',
    currentBalance: 0,
    monthlyContribution: 0,
    unitsHeld: 0,
    dividendRate: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    const validation = validateAccountData({
      name: formData.name,
      account_type: formData.accountType,
      current_balance: formData.currentBalance,
      units_held: formData.unitsHeld,
      monthly_contribution: formData.monthlyContribution,
      dividend_rate: formData.dividendRate,
    });

    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const { data: insertedAccount, error: insertError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: formData.name,
          account_type: formData.accountType,
          institution: formData.institution || null,
          current_balance: formData.currentBalance,
          monthly_contribution: formData.monthlyContribution || 0,
          units_held: formData.unitsHeld || 0,
          dividend_rate: formData.dividendRate || 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedAccount) throw new Error('Failed to create account');

      const { error: balanceError } = await supabase
        .from('balance_entries')
        .insert({
          account_id: insertedAccount.id,
          balance: formData.currentBalance,
          entry_date: new Date().toISOString().split('T')[0],
          notes: 'Initial balance',
        });

      if (balanceError) {
        console.error('Failed to create initial balance entry:', balanceError);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showASBFields = formData.accountType === 'ASB';
  const showDividendField = ['ASB', 'Tabung Haji', 'Investment'].includes(formData.accountType);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glow" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass-button rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add Investment Account</h2>
                <p className="text-sm text-white text-opacity-80">Track your Malaysian investments</p>
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
                Account Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                placeholder="e.g., My ASB Account"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Account Type *
              </label>
              <select
                required
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-gray-800">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Institution
              </label>
              <select
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              >
                <option value="" className="bg-gray-800">Select institution (optional)</option>
                {INSTITUTIONS.map((inst) => (
                  <option key={inst} value={inst} className="bg-gray-800">
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Current Balance (RM) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.currentBalance || ''}
                  onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Monthly Contribution (RM)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyContribution || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="500"
                />
              </div>
            </div>

            {showASBFields && (
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Units Held
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.unitsHeld || ''}
                  onChange={(e) => setFormData({ ...formData, unitsHeld: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="10000"
                />
                <p className="text-xs text-white text-opacity-60 mt-1">ASB units at RM1.00 per unit</p>
              </div>
            )}

            {showDividendField && (
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Expected Dividend Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.dividendRate || ''}
                  onChange={(e) => setFormData({ ...formData, dividendRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="4.5"
                />
                <p className="text-xs text-white text-opacity-60 mt-1">
                  {formData.accountType === 'ASB' && 'Historical ASB dividend: 4-5%'}
                  {formData.accountType === 'Tabung Haji' && 'Historical Tabung Haji dividend: 4-5%'}
                </p>
              </div>
            )}

            {formData.currentBalance > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-sm text-white text-opacity-80 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(formData.currentBalance)}</p>
                {formData.monthlyContribution > 0 && (
                  <p className="text-sm text-white text-opacity-80 mt-2">
                    Monthly contribution: {formatCurrency(formData.monthlyContribution)}
                  </p>
                )}
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
                {loading ? 'Adding...' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
