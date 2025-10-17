import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Trophy, Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../services/auditService';

interface Achievement {
  id: string;
  achievement_type: string;
  name: string;
  description: string;
  icon: string;
  criteria: any;
  points: number;
  is_active: boolean;
  created_at: string;
}

interface AchievementFormData {
  achievement_type: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  is_active: boolean;
}

const ICON_OPTIONS = [
  'trophy', 'award', 'medal', 'star', 'target', 'zap',
  'calendar', 'briefcase', 'compass', 'heart', 'piggy-bank',
  'graduation-cap', 'home', 'car', 'plane', 'shield'
];

export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<AchievementFormData>({
    achievement_type: '',
    name: '',
    description: '',
    icon: 'trophy',
    criteria: '{}',
    points: 10,
    is_active: true,
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err: any) {
      console.error('Failed to load achievements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateCriteria = (criteriaString: string): boolean => {
    try {
      const parsed = JSON.parse(criteriaString);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.achievement_type.trim()) {
      setError('Achievement type is required');
      return;
    }

    if (!formData.name.trim()) {
      setError('Achievement name is required');
      return;
    }

    if (!validateCriteria(formData.criteria)) {
      setError('Criteria must be valid JSON object');
      return;
    }

    try {
      const criteriaObject = JSON.parse(formData.criteria);

      if (editingAchievement) {
        const { error: updateError } = await supabase
          .from('achievement_definitions')
          .update({
            achievement_type: formData.achievement_type.trim(),
            name: formData.name.trim(),
            description: formData.description.trim(),
            icon: formData.icon,
            criteria: criteriaObject,
            points: formData.points,
            is_active: formData.is_active,
          })
          .eq('id', editingAchievement.id);

        if (updateError) throw updateError;

        await auditService.logAction({
          action_type: 'UPDATE',
          table_name: 'achievement_definitions',
          record_id: editingAchievement.id,
          old_value: editingAchievement,
          new_value: formData,
        });
      } else {
        const { data: newAchievement, error: insertError } = await supabase
          .from('achievement_definitions')
          .insert([{
            achievement_type: formData.achievement_type.trim(),
            name: formData.name.trim(),
            description: formData.description.trim(),
            icon: formData.icon,
            criteria: criteriaObject,
            points: formData.points,
            is_active: formData.is_active,
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        await auditService.logAction({
          action_type: 'CREATE',
          table_name: 'achievement_definitions',
          record_id: newAchievement.id,
          new_value: formData,
        });
      }

      await loadAchievements();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save achievement');
      console.error('Save error:', err);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      achievement_type: achievement.achievement_type,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      criteria: JSON.stringify(achievement.criteria, null, 2),
      points: achievement.points,
      is_active: achievement.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (achievement: Achievement) => {
    if (!confirm(`Delete achievement "${achievement.name}"? This cannot be undone.`)) return;

    try {
      const { error: deleteError } = await supabase
        .from('achievement_definitions')
        .delete()
        .eq('id', achievement.id);

      if (deleteError) throw deleteError;

      await auditService.logAction({
        action_type: 'DELETE',
        table_name: 'achievement_definitions',
        record_id: achievement.id,
        old_value: achievement,
      });

      await loadAchievements();
    } catch (err: any) {
      setError(err.message || 'Failed to delete achievement');
      console.error('Delete error:', err);
    }
  };

  const toggleActive = async (achievement: Achievement) => {
    try {
      const { error: updateError } = await supabase
        .from('achievement_definitions')
        .update({ is_active: !achievement.is_active })
        .eq('id', achievement.id);

      if (updateError) throw updateError;

      await auditService.logAction({
        action_type: 'UPDATE',
        table_name: 'achievement_definitions',
        record_id: achievement.id,
        old_value: { is_active: achievement.is_active },
        new_value: { is_active: !achievement.is_active },
      });

      await loadAchievements();
    } catch (err: any) {
      setError(err.message || 'Failed to update achievement status');
      console.error('Toggle error:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAchievement(null);
    setFormData({
      achievement_type: '',
      name: '',
      description: '',
      icon: 'trophy',
      criteria: '{}',
      points: 10,
      is_active: true,
    });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Achievement System</h1>
          <p className="text-white/70">Manage badges and rewards for user milestones</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl font-medium transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Achievement
          </button>
        )}
      </div>

      {error && (
        <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
            </h2>
            <button
              onClick={resetForm}
              className="text-white/70 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Achievement Type (Unique ID) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.achievement_type}
                  onChange={(e) => setFormData({ ...formData, achievement_type: e.target.value })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                  placeholder="e.g., first_100k"
                  disabled={!!editingAchievement}
                />
                <p className="text-xs text-white/50 mt-1">Snake_case identifier, cannot be changed after creation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Achievement Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                  placeholder="e.g., Six Figures"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none resize-none"
                  placeholder="e.g., Reached RM100,000 in total net worth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Icon *
                </label>
                <select
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                >
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon} className="bg-gray-800">{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Criteria (JSON) *
                </label>
                <textarea
                  required
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 glass-card text-white font-mono text-sm rounded-xl focus:ring-2 focus:ring-white/30 outline-none resize-none"
                  placeholder='{"net_worth": 100000}'
                />
                <p className="text-xs text-white/50 mt-1">
                  Valid JSON object defining achievement criteria. Examples: {'{'}&#34;net_worth&#34;: 10000{'}'}, {'{'}&#34;goals_achieved&#34;: 1{'}'}
                </p>
              </div>

              <div className="flex items-center md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded glass-card"
                  />
                  <span className="text-white/80 font-medium">Active (visible to users)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 glass text-white/70 hover:text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 glass-button text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">All Achievements</h2>
          <span className="px-2 py-1 glass text-white/70 text-sm rounded-lg">
            {achievements.filter(a => a.is_active).length} active
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/50">No achievements defined</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`glass rounded-2xl p-5 transition-all ${
                  achievement.is_active ? 'hover:scale-105' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(achievement)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                        achievement.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {achievement.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-white mb-1">{achievement.name}</h3>
                <p className="text-sm text-white/70 mb-3 line-clamp-2">{achievement.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-white/60 font-mono glass px-2 py-1 rounded">
                    {achievement.achievement_type}
                  </span>
                  <span className="text-sm font-bold text-yellow-400">
                    {achievement.points} pts
                  </span>
                </div>

                <details className="mb-3">
                  <summary className="text-xs text-white/60 cursor-pointer hover:text-white/80">
                    View Criteria
                  </summary>
                  <pre className="text-xs text-white/70 mt-2 glass-strong rounded-lg p-2 overflow-x-auto">
                    {JSON.stringify(achievement.criteria, null, 2)}
                  </pre>
                </details>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="flex-1 p-2 glass-card text-blue-300 hover:text-blue-400 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(achievement)}
                    className="flex-1 p-2 glass-card text-red-300 hover:text-red-400 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
