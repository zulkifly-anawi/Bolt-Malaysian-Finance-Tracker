import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Target, Wallet, TrendingUp, Plus, Lightbulb, Trophy, Download, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, calculateProgress, isGoalOnTrack } from '../utils/formatters';
import { ASBCalculator } from './investments/ASBCalculator';
import { TabungHajiTracker } from './investments/TabungHajiTracker';
import { EPFCalculator } from './investments/EPFCalculator';
import { GoalProjection } from './goals/GoalProjection';
import { GoalTemplates } from './goals/GoalTemplates';
import { GoalForm } from './goals/GoalForm';
import { AccountForm } from './accounts/AccountForm';
import { AchievementsBadges } from './engagement/AchievementsBadges';
import { NotificationsPanel } from './engagement/NotificationsPanel';
import { InsightsTips } from './engagement/InsightsTips';
import { ExportData } from './engagement/ExportData';
import { ConfirmDialog } from './ConfirmDialog';
import type { Goal, Account, Achievement } from '../types/database';

export const EnhancedDashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [goalFormInitialData, setGoalFormInitialData] = useState<Partial<Goal> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'account' | 'goal', id: string, name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const deleteAccount = async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    setDeleteConfirm({ type: 'account', id: accountId, name: account.name });
  };

  const deleteGoal = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    setDeleteConfirm({ type: 'goal', id: goalId, name: goal.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setError(null);
    try {
      if (deleteConfirm.type === 'account') {
        const { error: deleteError } = await supabase
          .from('accounts')
          .delete()
          .eq('id', deleteConfirm.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('goals')
          .delete()
          .eq('id', deleteConfirm.id);

        if (deleteError) throw deleteError;
      }

      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data: goalsWithAmounts, error: goalsError } = await supabase
        .from('goals')
        .select(`
          *,
          account_goals (
            account_id,
            allocation_percentage,
            accounts (
              current_balance
            )
          )
        `)
        .eq('user_id', user.id)
        .order('target_date');

      if (goalsError) throw goalsError;

      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;

      if (goalsWithAmounts) {
        const processedGoals = goalsWithAmounts.map((goal: any) => {
          let currentAmount = 0;
          if (goal.account_goals && Array.isArray(goal.account_goals)) {
            for (const link of goal.account_goals) {
              if (link.accounts) {
                const percentage = link.allocation_percentage || 100;
                currentAmount += (link.accounts.current_balance * percentage) / 100;
              }
            }
          }
          const { account_goals, ...goalData } = goal;
          return { ...goalData, current_amount: currentAmount };
        });
        setGoals(processedGoals);
      }

      if (accountsData) setAccounts(accountsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data. Please refresh the page.');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const asbAccounts = accounts.filter(acc => acc.account_type === 'ASB');
  const thAccounts = accounts.filter(acc => acc.account_type === 'Tabung Haji');
  const epfAccounts = accounts.filter(acc => acc.account_type === 'EPF');

  return (
    <div className="min-h-screen gradient-mesh">
      <nav className="glass border-b border-white border-opacity-20 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">Malaysian Finance Tracker</h1>
            <div className="flex items-center gap-2">
              <NotificationsPanel />
              <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-white text-opacity-90 hover:text-opacity-100 glass-button rounded-xl transition-all">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'accounts', label: 'Accounts', icon: Wallet },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'tips', label: 'Tips', icon: Lightbulb },
            { id: 'export', label: 'Export', icon: Download },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === id ? 'glass-button text-white' : 'glass text-white text-opacity-80 hover:text-opacity-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="glass-strong rounded-2xl p-4 mb-6 border border-red-500 border-opacity-30">
            <div className="flex items-center gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="glass-strong rounded-3xl p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="glass-strong rounded-3xl p-6 text-white glow liquid-shine">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">Financial Goals</h2>
                    <button
                      onClick={() => setShowGoalTemplates(!showGoalTemplates)}
                      className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Goal</span>
                    </button>
                  </div>

                  {showGoalTemplates && (
                    <div className="mb-6">
                      <GoalTemplates
                        onSelectTemplate={(template) => {
                          setShowGoalTemplates(false);
                          setGoalFormInitialData(template);
                          setShowGoalForm(true);
                        }}
                      />
                    </div>
                  )}

                  {goals.length === 0 ? (
                    <div className="glass-card rounded-3xl p-8 text-center liquid-shine">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Goals Yet</h3>
                      <p className="text-white text-opacity-80 mb-4">Create your first financial goal to get started</p>
                      <button
                        onClick={() => setShowGoalTemplates(true)}
                        className="px-6 py-3 glass-button text-white rounded-xl font-semibold"
                      >
                        Browse Goal Templates
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goals.filter(g => !g.is_achieved).map((goal) => {
                        const progress = calculateProgress(goal.current_amount || 0, goal.target_amount);
                        const onTrack = isGoalOnTrack(goal.current_amount || 0, goal.target_amount, goal.target_date);
                        return (
                          <div
                            key={goal.id}
                            className="glass-card rounded-2xl p-6 glass-hover transition-all relative"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteGoal(goal.id);
                              }}
                              className="absolute top-4 right-4 p-2 glass-card text-red-300 hover:text-red-400 rounded-lg transition-all"
                              title="Delete goal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div onClick={() => setSelectedGoal(goal)} className="cursor-pointer">
                              <h3 className="font-semibold text-white mb-1 pr-10">{goal.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-white text-opacity-80 mb-4">
                              <span>{formatDate(goal.target_date)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                onTrack ? 'glass text-green-300' : 'glass text-orange-300'
                              }`}>
                                {onTrack ? 'On Track' : 'Behind'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-white text-opacity-80">Progress</span>
                                <span className="font-semibold text-white">{progress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full glass rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${onTrack ? 'bg-green-400' : 'bg-orange-400'}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white text-opacity-80">{formatCurrency(goal.current_amount || 0)}</span>
                                <span className="font-medium text-white">{formatCurrency(goal.target_amount)}</span>
                              </div>
                            </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedGoal && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedGoal(null)}>
                    <div className="glass-strong rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto glow" onClick={e => e.stopPropagation()}>
                      <div className="p-6">
                        <GoalProjection goal={selectedGoal} accounts={accounts} monthlyContribution={500} />
                        <button
                          onClick={() => setSelectedGoal(null)}
                          className="mt-4 w-full px-4 py-2 glass-button text-white rounded-xl font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">Financial Goals</h2>
                  <button
                    onClick={() => setShowGoalTemplates(!showGoalTemplates)}
                    className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Goal</span>
                  </button>
                </div>

                {showGoalTemplates ? (
                  <GoalTemplates
                    onSelectTemplate={(template) => {
                      setShowGoalTemplates(false);
                      setGoalFormInitialData(template);
                      setShowGoalForm(true);
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {goals.map(goal => (
                      <GoalProjection key={goal.id} goal={goal} accounts={accounts} monthlyContribution={500} />
                    ))}
                    {goals.length === 0 && (
                      <div className="text-center py-12 glass-card rounded-3xl">
                        <p className="text-white text-opacity-80">No goals yet. Click "Add Goal" to get started.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">Investment Accounts</h2>
                  <button
                    onClick={() => setShowAccountForm(true)}
                    className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Account</span>
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <div className="glass-card rounded-3xl p-12 text-center liquid-shine">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-opacity-80 mb-4">No accounts created yet</p>
                    <button
                      onClick={() => setShowAccountForm(true)}
                      className="px-6 py-3 glass-button text-white rounded-xl font-semibold"
                    >
                      Create Your First Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {accounts.map((account) => (
                      <div key={account.id} className="glass-card rounded-2xl p-6 glass-hover">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white text-lg">{account.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 glass text-white text-sm font-medium rounded-full">
                                {account.account_type}
                              </span>
                              <button
                                onClick={() => deleteAccount(account.id)}
                                className="p-2 glass-card text-red-300 hover:text-red-400 rounded-lg transition-all"
                                title="Delete account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {account.institution && (
                            <p className="text-sm text-white text-opacity-80">{account.institution}</p>
                          )}
                        </div>
                        <div className="pt-4 border-t border-white border-opacity-20">
                          <p className="text-sm text-white text-opacity-80 mb-1">Current Balance</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(account.current_balance)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Investment Insights</h2>
                    <p className="text-sm text-white text-opacity-80">Malaysian-specific calculations and projections</p>
                  </div>
                </div>

                {asbAccounts.map(account => (
                  <ASBCalculator key={account.id} account={account} />
                ))}

                {thAccounts.map(account => (
                  <TabungHajiTracker key={account.id} account={account} />
                ))}

                {epfAccounts.map(account => (
                  <EPFCalculator key={account.id} account={account} />
                ))}

                {asbAccounts.length === 0 && thAccounts.length === 0 && epfAccounts.length === 0 && (
                  <div className="glass-card rounded-3xl p-12 text-center liquid-shine">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Investment Accounts</h3>
                    <p className="text-white text-opacity-80 mb-4">
                      Add ASB, Tabung Haji, or EPF accounts to see Malaysian-specific investment insights and projections.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <AchievementsBadges netWorth={totalNetWorth} accounts={accounts} goals={goals} />
            )}

            {activeTab === 'tips' && (
              <InsightsTips netWorth={totalNetWorth} accounts={accounts} goals={goals} />
            )}

            {activeTab === 'export' && (
              <ExportData user={user} netWorth={totalNetWorth} goals={goals} accounts={accounts} achievements={achievements} />
            )}
          </>
        )}

        {showGoalForm && (
          <GoalForm
            onClose={() => {
              setShowGoalForm(false);
              setGoalFormInitialData(null);
            }}
            onSuccess={loadData}
            initialData={goalFormInitialData}
          />
        )}

        {showAccountForm && (
          <AccountForm
            onClose={() => setShowAccountForm(false)}
            onSuccess={loadData}
          />
        )}

        <ConfirmDialog
          isOpen={deleteConfirm !== null}
          title={`Delete ${deleteConfirm?.type === 'account' ? 'Account' : 'Goal'}`}
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone and will also delete all associated data.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </div>
  );
};
