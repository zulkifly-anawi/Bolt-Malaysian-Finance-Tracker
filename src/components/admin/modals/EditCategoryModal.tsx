import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GoalCategory } from '../../../services/configService';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: GoalCategory | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<GoalCategory>) => Promise<void>;
  onCreate: (data: Omit<GoalCategory, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const EditCategoryModal = ({ isOpen, category, onClose, onSave, onCreate }: EditCategoryModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    icon: '',
    is_active: true,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        display_name: category.display_name,
        description: category.description || '',
        icon: category.icon || '',
        is_active: category.is_active,
        sort_order: category.sort_order,
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        icon: '',
        is_active: true,
        sort_order: 0,
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (category) {
        await onSave(category.id, formData);
      } else {
        await onCreate(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white border-opacity-20">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{category ? 'Edit' : 'Add'} Goal Category</h3>
          <button
            onClick={onClose}
            className="text-white text-opacity-60 hover:text-opacity-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Name (Internal)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              placeholder="e.g., emergency-fund"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Icon
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              placeholder="e.g., shield"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 text-cyan-500 focus:ring-cyan-400/50"
            />
            <label htmlFor="is_active" className="text-white font-medium">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass px-4 py-3 rounded-xl text-white font-medium hover:scale-105 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 rounded-xl text-white font-medium hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
