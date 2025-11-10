import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, Shield, Search, TrendingUp, Wallet, Target, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Profile } from '../../../types/database';

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  recentUsers: number;
  activeUsers: number;
}

interface UserWithStats extends Profile {
  accountCount?: number;
  goalCount?: number;
  totalBalance?: number;
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminUsers: 0,
    recentUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Fetch all users with their profiles
      // Admin users can see all profiles due to the "Admins can view all profiles" RLS policy
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles?.length || 0, 'users');

      // Get user statistics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const usersWithStats: UserWithStats[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get account count and total balance
          const { data: accounts } = await supabase
            .from('accounts')
            .select('id, current_balance')
            .eq('user_id', profile.id);

          // Get goal count
          const { data: goals } = await supabase
            .from('goals')
            .select('id')
            .eq('user_id', profile.id);

          const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;

          return {
            ...profile,
            accountCount: accounts?.length || 0,
            goalCount: goals?.length || 0,
            totalBalance,
          };
        })
      );

      setUsers(usersWithStats);

      // Calculate stats
      const totalUsers = usersWithStats.length;
      const adminUsers = usersWithStats.filter(u => u.is_admin).length;
      const recentUsers = usersWithStats.filter(u => new Date(u.created_at) > thirtyDaysAgo).length;
      const activeUsers = usersWithStats.filter(u => (u.accountCount || 0) > 0 || (u.goalCount || 0) > 0).length;

      setStats({
        totalUsers,
        adminUsers,
        recentUsers,
        activeUsers,
      });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Refresh users
      await loadUsers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-sm text-white/60">View and manage registered users</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-strong rounded-2xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Total Users</h3>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          <p className="text-xs text-white/50 mt-1">Registered accounts</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Active Users</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
          <p className="text-xs text-white/50 mt-1">With accounts or goals</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Recent Users</h3>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.recentUsers}</p>
          <p className="text-xs text-white/50 mt-1">Last 30 days</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/70">Admins</h3>
            <Shield className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.adminUsers}</p>
          <p className="text-xs text-white/50 mt-1">Admin privileges</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-white/70 p-4">User</th>
                <th className="text-left text-sm font-medium text-white/70 p-4">Email</th>
                <th className="text-center text-sm font-medium text-white/70 p-4">Accounts</th>
                <th className="text-center text-sm font-medium text-white/70 p-4">Goals</th>
                <th className="text-right text-sm font-medium text-white/70 p-4">Total Balance</th>
                <th className="text-center text-sm font-medium text-white/70 p-4">Joined</th>
                <th className="text-center text-sm font-medium text-white/70 p-4">Admin</th>
                <th className="text-center text-sm font-medium text-white/70 p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-xs text-white/50">
                        {user.onboarding_completed ? '✓ Onboarded' : 'Not onboarded'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/50" />
                      <span className="text-white/90 text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Wallet className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-medium">{user.accountCount || 0}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{user.goalCount || 0}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(user.totalBalance || 0)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="w-4 h-4 text-white/50" />
                      <span className="text-white/70 text-sm">{formatDate(user.created_at)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAdminStatus(user.id, user.is_admin);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        user.is_admin
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      }`}
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="glass-strong rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">User Details</h2>
                  <p className="text-sm text-white/60">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Full Name</p>
                  <p className="text-white font-medium">{selectedUser.full_name || 'Not set'}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Age</p>
                  <p className="text-white font-medium">{selectedUser.age || 'Not set'}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Monthly Salary</p>
                  <p className="text-white font-medium">{formatCurrency(selectedUser.monthly_salary)}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Total Balance</p>
                  <p className="text-emerald-400 font-medium">{formatCurrency(selectedUser.totalBalance || 0)}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Accounts</p>
                  <p className="text-white font-medium">{selectedUser.accountCount || 0}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Goals</p>
                  <p className="text-white font-medium">{selectedUser.goalCount || 0}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Notifications</p>
                  <p className="text-white font-medium">
                    {selectedUser.notifications_enabled ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/50 mb-1">Onboarding</p>
                  <p className="text-white font-medium">
                    {selectedUser.onboarding_completed ? '✓ Completed' : 'Not completed'}
                  </p>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/50 mb-1">EPF Contribution Settings</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-white/50">Employee: {selectedUser.epf_employee_contribution_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Employer: {selectedUser.epf_employer_contribution_percentage}%</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/50 mb-1">Account Created</p>
                <p className="text-white font-medium">{formatDate(selectedUser.created_at)}</p>
              </div>

              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/50 mb-1">Last Updated</p>
                <p className="text-white font-medium">{formatDate(selectedUser.updated_at)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => toggleAdminStatus(selectedUser.id, selectedUser.is_admin)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedUser.is_admin
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                }`}
              >
                {selectedUser.is_admin ? 'Remove Admin Access' : 'Grant Admin Access'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
