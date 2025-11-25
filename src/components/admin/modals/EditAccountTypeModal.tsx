import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AccountType } from '../../../services/configService';

interface EditAccountTypeModalProps {
  isOpen: boolean;
  accountType: AccountType | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<AccountType>) => Promise<void>;
  onCreate: (data: Omit<AccountType, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const EditAccountTypeModal = ({
  isOpen,
  accountType,
  onClose,
  onSave,
  onCreate,
}: EditAccountTypeModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountType) {
      setFormData({
        name: accountType.name,
        display_name: accountType.display_name,
        description: accountType.description || '',
        is_active: accountType.is_active,
        sort_order: accountType.sort_order || 0,
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        is_active: true,
        sort_order: 0,
      });
    }
    setError(null);
  }, [accountType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (accountType) {
        // Edit existing
        await onSave(accountType.id, formData);
      } else {
        // Create new
        await onCreate(formData);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save account type');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-3xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {accountType ? 'Edit Account Type' : 'Add Account Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Name (Internal) *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none"
              placeholder="e.g., ASB"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none"
              placeholder="e.g., ASB (Amanah Saham Bumiputera)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none resize-none"
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none"
              min="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-2 focus:ring-cyan-400/50"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-white/80">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 glass text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : accountType ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
