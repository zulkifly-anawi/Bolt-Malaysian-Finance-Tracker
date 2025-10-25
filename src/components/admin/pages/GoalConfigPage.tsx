import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { adminConfigService } from '../../../services/adminConfigService';
import { supabase } from '../../../lib/supabase';
import type { GoalCategory } from '../../../services/configService';
import { ConfirmDialog } from '../../ConfirmDialog';
import { EditCategoryModal } from '../modals/EditCategoryModal';
import { EditTemplateModal } from '../modals/EditTemplateModal';
import { ToastContainer } from '../../common/ToastContainer';
import type { ToastProps } from '../../common/Toast';
import { resolveLucideIcon } from '../../../utils/iconUtils';

export const GoalConfigPage = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories');
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);
  const [editingCategory, setEditingCategory] = useState<GoalCategory | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleCreateCategory = async (data: Omit<GoalCategory, 'id' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'>) => {
    try {
      await adminConfigService.createGoalCategory(data);
      await loadData();
      showToast('Category created successfully', 'success');
    } catch (error) {
      console.error('Failed to create category:', error);
      showToast('Failed to create category', 'error');
      throw error;
    }
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

  const handleCreateTemplate = async (data: any) => {
    try {
      await adminConfigService.createGoalTemplate(data);
      await loadData();
      showToast('Template created successfully', 'success');
    } catch (error) {
      console.error('Failed to create template:', error);
      showToast('Failed to create template', 'error');
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
          <button
            onClick={() => {
              if (activeTab === 'categories') {
                setEditingCategory(null);
                setShowCategoryModal(true);
              } else {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }
            }}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {activeTab === 'categories' ? (
          <div className="space-y-3">
            {categories.map((category) => {
              const IconComponent = resolveLucideIcon(category.icon);

              return (
                <div
                  key={category.id}
                  className="glass rounded-xl p-4 hover:bg-white/5 transition-all relative"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-2">
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
                  <div className="flex items-center gap-4 pr-24">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{category.display_name}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          category.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-white/60">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="glass rounded-2xl p-5 hover:scale-105 transition-all relative"
              >
                <div className="absolute top-4 right-4 flex gap-1">
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
                <div className="pr-16 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{template.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      template.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">{template.category}</span>
                </div>
                {template.description && (
                  <p className="text-sm text-white/70 mb-3 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-white">
                    RM {template.default_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditCategoryModal
        isOpen={editingCategory !== null || showCategoryModal}
        category={editingCategory}
        onClose={() => {
          setEditingCategory(null);
          setShowCategoryModal(false);
        }}
        onSave={handleEditCategory}
        onCreate={handleCreateCategory}
      />

      <EditTemplateModal
        isOpen={editingTemplate !== null || showTemplateModal}
        template={editingTemplate}
        onClose={() => {
          setEditingTemplate(null);
          setShowTemplateModal(false);
        }}
        onSave={handleEditTemplate}
        onCreate={handleCreateTemplate}
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

  <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
};
