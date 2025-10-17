import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import { adminConfigService } from '../../../services/adminConfigService';
import { supabase } from '../../../lib/supabase';
import type { GoalCategory } from '../../../services/configService';
import { ConfirmDialog } from '../../ConfirmDialog';
import { EditCategoryModal } from '../modals/EditCategoryModal';
import { EditTemplateModal } from '../modals/EditTemplateModal';
import { ToastContainer } from '../../common/ToastContainer';
import type { ToastProps } from '../../common/Toast';

export const GoalConfigPage = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories');
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [editingCategory, setEditingCategory] = useState<GoalCategory | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'category' | 'template';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'category', id: '', name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, temps] = await Promise.all([
        adminConfigService.getAllGoalCategories(),
        supabase.from('goal_templates').select('*').order('sort_order'),
      ]);
      setCategories(cats || []);
      setTemplates(temps.data || []);
    } catch (error) {
      console.error('Failed to load configuration:', error);
      showToast('Failed to load configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleEditCategory = async (id: string, data: Partial<GoalCategory>) => {
    try {
      await adminConfigService.updateGoalCategory(id, data);
      await loadData();
      showToast('Category updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update category:', error);
      showToast('Failed to update category', 'error');
      throw error;
    }
  };

  const handleEditTemplate = async (id: string, data: any) => {
    try {
      await adminConfigService.updateGoalTemplate(id, data);
      await loadData();
      showToast('Template updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update template:', error);
      showToast('Failed to update template', 'error');
      throw error;
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await adminConfigService.deleteGoalCategory(deleteDialog.id);
      await loadData();
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      await adminConfigService.deleteGoalTemplate(deleteDialog.id);
      await loadData();
      showToast('Template deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete template:', error);
      showToast('Failed to delete template', 'error');
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'category') {
      handleDeleteCategory();
    } else {
      handleDeleteTemplate();
    }
    setDeleteDialog({ isOpen: false, type: 'category', id: '', name: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Goal Configuration</h1>
        <p className="text-white/70">Manage goal categories and templates</p>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'categories'
              ? 'text-cyan-300 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'templates'
              ? 'text-cyan-300 border-b-2 border-cyan-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Templates ({templates.length})
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {activeTab === 'categories' ? 'Goal Categories' : 'Goal Templates'}
          </h2>
          <button className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2 shadow-lg">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {activeTab === 'categories' ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{category.display_name}</h3>
                    {category.description && (
                      <p className="text-sm text-white/60">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    category.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 glass-button text-white rounded-lg hover:scale-110 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({
                      isOpen: true,
                      type: 'category',
                      id: category.id,
                      name: category.display_name,
                    })}
                    className="p-2 glass text-red-400 hover:bg-red-500/10 rounded-lg hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="glass rounded-2xl p-5 hover:scale-105 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{template.name}</h3>
                    <span className="text-xs text-white/60">{template.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-1.5 glass-button text-white rounded-lg hover:scale-110 transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({
                        isOpen: true,
                        type: 'template',
                        id: template.id,
                        name: template.name,
                      })}
                      className="p-1.5 glass text-red-400 hover:bg-red-500/10 rounded-lg hover:scale-110 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {template.description && (
                  <p className="text-sm text-white/70 mb-3 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    RM {template.default_amount.toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    template.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditCategoryModal
        isOpen={editingCategory !== null}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={handleEditCategory}
      />

      <EditTemplateModal
        isOpen={editingTemplate !== null}
        template={editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSave={handleEditTemplate}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete ${deleteDialog.type === 'category' ? 'Category' : 'Template'}`}
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, type: 'category', id: '', name: '' })}
      />

      <ToastContainer toasts={toasts} onClose={(id) => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};
