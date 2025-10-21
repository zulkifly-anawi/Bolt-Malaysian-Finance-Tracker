import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface GoalTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  default_amount: number;
  is_active: boolean;
  sort_order: number;
}

interface EditTemplateModalProps {
  isOpen: boolean;
  template: GoalTemplate | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<GoalTemplate>) => Promise<void>;
  onCreate: (data: Omit<GoalTemplate, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const EditTemplateModal = ({ isOpen, template, onClose, onSave, onCreate }: EditTemplateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    default_amount: 0,
    is_active: true,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        description: template.description || '',
        default_amount: template.default_amount,
        is_active: template.is_active,
        sort_order: template.sort_order,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        default_amount: 0,
        is_active: true,
        sort_order: 0,
      });
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (template) {
        await onSave(template.id, formData);
      } else {
        await onCreate(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white border-opacity-20">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{template ? 'Edit' : 'Add'} Goal Template</h3>
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
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              required
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
              Default Amount (RM)
            </label>
            <input
              type="number"
              value={formData.default_amount}
              onChange={(e) => setFormData({ ...formData, default_amount: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 glass-card text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-400/50 outline-none transition-all"
              required
              min="0"
              step="0.01"
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
              {saving ? 'Saving...' : template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
