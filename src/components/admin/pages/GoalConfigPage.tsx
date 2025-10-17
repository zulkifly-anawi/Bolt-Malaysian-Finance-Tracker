import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import { adminConfigService } from '../../../services/adminConfigService';
import { supabase } from '../../../lib/supabase';
import type { GoalCategory } from '../../../services/configService';

export const GoalConfigPage = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories');
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
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
                  <button className="p-2 glass-button text-white rounded-lg hover:scale-110 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 glass text-red-400 hover:bg-red-500/10 rounded-lg hover:scale-110 transition-all">
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
                    <button className="p-1.5 glass-button text-white rounded-lg hover:scale-110 transition-all">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 glass text-red-400 hover:bg-red-500/10 rounded-lg hover:scale-110 transition-all">
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
    </div>
  );
};
