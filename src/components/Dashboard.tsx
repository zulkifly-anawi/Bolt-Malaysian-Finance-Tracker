import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Target, Wallet, TrendingUp, Plus, Pencil, Trash2, CheckCircle, Circle, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, calculateProgress, isGoalOnTrack } from '../utils/formatters';

export const Dashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goals, setGoals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [goalsData, accountsData] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('target_date'),
      supabase.from('accounts').select('*').eq('user_id', user.id),
    ]);

    if (goalsData.data) {
      const goalsWithAmounts = await Promise.all(
        goalsData.data.map(async (goal) => {
          const { data: linkedAccounts } = await supabase
            .from('account_goals')
            .select('account_id, allocation_percentage')
            .eq('goal_id', goal.id);

          let currentAmount = 0;
          if (linkedAccounts) {
            for (const link of linkedAccounts) {
              const account = accountsData.data?.find((a: any) => a.id === link.account_id);
              if (account) {
                const percentage = link.allocation_percentage || 100;
                currentAmount += (account.current_balance * percentage) / 100;
              }
            }
          }
          return { ...goal, current_amount: currentAmount };
        })
      );
      setGoals(goalsWithAmounts);
    }

    if (accountsData.data) setAccounts(accountsData.data);
    setLoading(false);
  };

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Malaysian Finance Tracker</h1>
            <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          {['dashboard', 'goals', 'accounts'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              {tab === 'dashboard' && <TrendingUp className="w-4 h-4 inline mr-2" />}
              {tab === 'goals' && <Target className="w-4 h-4 inline mr-2" />}
              {tab === 'accounts' && <Wallet className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Total Net Worth</p>
                      <h2 className="text-3xl font-bold">{formatCurrency(totalNetWorth)}</h2>
                    </div>
                  </div>
                  <div className="text-blue-100 text-sm">{accounts.length} active accounts</div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Goals</h2>
                  {goals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
                      <p className="text-gray-600">Create your first financial goal to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goals.filter(g => !g.is_achieved).map((goal) => {
                        const progress = calculateProgress(goal.current_amount || 0, goal.target_amount);
                        const onTrack = isGoalOnTrack(goal.current_amount || 0, goal.target_amount, goal.target_date);
                        return (
                          <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-1">{goal.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(goal.target_date)}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold">{progress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${onTrack ? 'bg-green-600' : 'bg-orange-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{formatCurrency(goal.current_amount || 0)}</span>
                                <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
                  <button onClick={() => alert('Add goal functionality - see implementation')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-5 h-5" />
                    <span>Add Goal</span>
                  </button>
                </div>
                <p className="text-gray-600">Your financial goals will appear here. Goals management features are ready for implementation.</p>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Investment Accounts</h2>
                  <button onClick={() => alert('Add account functionality - see implementation')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-5 h-5" />
                    <span>Add Account</span>
                  </button>
                </div>
                {accounts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                    <p className="text-gray-600 mb-4">No accounts created yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-lg mb-3">{account.name}</h3>
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.current_balance)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
