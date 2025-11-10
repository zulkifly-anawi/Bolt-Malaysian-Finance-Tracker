import { useState, useEffect } from 'react';
import { Wallet, Target, TrendingUp, Trophy, FileText, ArrowRight, Activity, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../services/auditService';

interface DashboardOverviewProps {
  onNavigate: (page: string) => void;
}

export const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const [stats, setStats] = useState({
    accountTypes: 0,
    institutions: 0,
    goalCategories: 0,
    goalTemplates: 0,
    achievements: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [accountTypes, institutions, goalCategories, goalTemplates, achievements, activity, profiles] = await Promise.all([
        supabase.from('admin_config_account_types').select('id', { count: 'exact', head: true }),
        supabase.from('admin_config_institutions').select('id', { count: 'exact', head: true }),
        supabase.from('admin_config_goal_categories').select('id', { count: 'exact', head: true }),
        supabase.from('goal_templates').select('id', { count: 'exact', head: true }),
        supabase.from('achievement_definitions').select('id', { count: 'exact', head: true }),
        auditService.getRecentActivity(10),
        supabase.from('profiles').select('id, onboarding_completed', { count: 'exact' }),
      ]);

      const totalUsers = profiles.count || 0;
      const activeUsers = profiles.data?.filter(p => p.onboarding_completed).length || 0;

      setStats({
        accountTypes: accountTypes.count || 0,
        institutions: institutions.count || 0,
        goalCategories: goalCategories.count || 0,
        goalTemplates: goalTemplates.count || 0,
        achievements: achievements.count || 0,
        totalUsers,
        activeUsers,
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const configCards = [
    {
      id: 'users',
      title: 'User Management',
      description: 'View and manage registered users',
      icon: Users,
      stats: `${stats.totalUsers} users, ${stats.activeUsers} active`,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'accounts',
      title: 'Account Configuration',
      description: 'Manage account types and institutions',
      icon: Wallet,
      stats: `${stats.accountTypes} types, ${stats.institutions} institutions`,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'goals',
      title: 'Goal Configuration',
      description: 'Manage goal categories and templates',
      icon: Target,
      stats: `${stats.goalCategories} categories, ${stats.goalTemplates} templates`,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'investments',
      title: 'Investment Rates',
      description: 'Manage historical dividend rates',
      icon: TrendingUp,
      stats: 'Historical rate data',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'achievements',
      title: 'Achievement System',
      description: 'Manage badges and rewards',
      icon: Trophy,
      stats: `${stats.achievements} achievements`,
      color: 'from-yellow-500 to-orange-600',
    },
  ];

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
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/70">Manage system configuration and view recent changes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="glass-card rounded-2xl p-6 hover:scale-105 transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-white/60 mb-3">{card.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80 font-medium">{card.stats}</span>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <p className="text-sm text-white/60">Last 10 configuration changes</p>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((entry) => (
              <div
                key={entry.id}
                className="glass rounded-xl p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      entry.action_type === 'CREATE' ? 'bg-green-500/20 text-green-300' :
                      entry.action_type === 'UPDATE' ? 'bg-blue-500/20 text-blue-300' :
                      entry.action_type === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {entry.action_type}
                    </span>
                    <span className="text-sm text-white/80 font-medium">{entry.table_name}</span>
                  </div>
                  <p className="text-sm text-white/60">{entry.admin_email}</p>
                </div>
                <span className="text-xs text-white/50">
                  {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => onNavigate('audit')}
          className="mt-4 w-full px-4 py-3 glass-button text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          View Full Audit Log
        </button>
      </div>
    </div>
  );
};
