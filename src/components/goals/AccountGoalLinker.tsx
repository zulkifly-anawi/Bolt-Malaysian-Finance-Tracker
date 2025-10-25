import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Link as LinkIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import type { Goal } from '../../types/database';

interface LinkedAccount {
  accountId: string;
  accountName: string;
  currentBalance: number;
  allocationPercentage: number;
  estimatedContribution: number;
}

interface AccountGoalLinkerProps {
  goal: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export const AccountGoalLinker = ({ goal, onClose, onSuccess }: AccountGoalLinkerProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [accounts, setAccounts] = useState<Array<{
    id: string;
    name: string;
    current_balance: number;
    account_type: string;
  }>>([]);
  
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load user accounts and existing links
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError('');

      try {
        // Fetch user accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('id, name, current_balance, account_type')
          .eq('user_id', user.id)
          .order('name');

        if (accountsError) throw accountsError;
        setAccounts(accountsData || []);

        // Fetch existing account-goal links
        const { data: links, error: linksError } = await supabase
          .from('account_goals')
          .select(`
            account_id,
            allocation_percentage,
            accounts (
              id,
              name,
              current_balance
            )
          `)
          .eq('goal_id', goal.id);

        if (linksError) throw linksError;

        if (links && links.length > 0) {
          const mapped: LinkedAccount[] = links
            .filter(link => link.accounts !== null)
            .map(link => {
              const account = link.accounts as any;
              return {
                accountId: link.account_id,
                accountName: account.name,
                currentBalance: account.current_balance,
                allocationPercentage: link.allocation_percentage,
                estimatedContribution: (account.current_balance * link.allocation_percentage) / 100,
              };
            });
          
          setLinkedAccounts(mapped);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, goal.id]);

  const handleToggleAccount = (accountId: string) => {
    const isLinked = linkedAccounts.some(acc => acc.accountId === accountId);
    
    if (isLinked) {
      // Remove account
      setLinkedAccounts(linkedAccounts.filter(acc => acc.accountId !== accountId));
    } else {
      // Add account with default 0% allocation
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        setLinkedAccounts([
          ...linkedAccounts,
          {
            accountId: account.id,
            accountName: account.name,
            currentBalance: account.current_balance,
            allocationPercentage: 0,
            estimatedContribution: 0,
          },
        ]);
      }
    }
    
    setSuccess(''); // Clear success message on changes
  };

  const handleAllocationChange = (accountId: string, percentage: number) => {
    const validPercentage = Math.max(0, Math.min(100, percentage));
    
    setLinkedAccounts(linkedAccounts.map(acc => {
      if (acc.accountId === accountId) {
        return {
          ...acc,
          allocationPercentage: validPercentage,
          estimatedContribution: (acc.currentBalance * validPercentage) / 100,
        };
      }
      return acc;
    }));
    
    setSuccess(''); // Clear success message on changes
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate at least one account with allocation > 0
    const hasValidAllocation = linkedAccounts.some(acc => acc.allocationPercentage > 0);
    if (linkedAccounts.length > 0 && !hasValidAllocation) {
      setError('Please set allocation percentage greater than 0 for at least one account.');
      return;
    }

    // Validate total allocation
    const totalAllocation = linkedAccounts.reduce((sum, acc) => sum + acc.allocationPercentage, 0);
    if (totalAllocation > 100) {
      setError('Total allocation percentage cannot exceed 100%.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Delete existing links
      const { error: deleteError } = await supabase
        .from('account_goals')
        .delete()
        .eq('goal_id', goal.id);

      if (deleteError) throw deleteError;

      // Insert new links (only accounts with allocation > 0)
      const validLinks = linkedAccounts.filter(acc => acc.allocationPercentage > 0);
      
      if (validLinks.length > 0) {
        const linksData = validLinks.map(acc => ({
          goal_id: goal.id,
          account_id: acc.accountId,
          allocation_percentage: acc.allocationPercentage,
        }));

        const { error: insertError } = await supabase
          .from('account_goals')
          .insert(linksData);

        if (insertError) throw insertError;

        // Update goal to account-linked mode
        const { error: updateError } = await supabase
          .from('goals')
          .update({ is_manual_goal: false })
          .eq('id', goal.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // No links, set to manual mode
        const { error: updateError } = await supabase
          .from('goals')
          .update({ is_manual_goal: true })
          .eq('id', goal.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      setSuccess('Funding sources updated successfully!');
      
      // Call onSuccess and close after a brief delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update funding sources');
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAllocation = linkedAccounts.reduce((sum, acc) => sum + acc.allocationPercentage, 0);
  const totalEstimated = linkedAccounts.reduce((sum, acc) => sum + acc.estimatedContribution, 0);

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="glass-strong rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto glow" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass-button rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Manage Funding Sources</h2>
                <p className="text-sm text-white text-opacity-80">{goal.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 glass rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 glass rounded-xl border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 glass rounded-xl border border-green-500/30 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-200">{success}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Available Accounts */}
              <div>
                <h3 className="text-sm font-semibold text-white text-opacity-90 mb-3">
                  Available Accounts ({filteredAccounts.length})
                </h3>
                
                {filteredAccounts.length === 0 ? (
                  <div className="glass rounded-xl p-6 text-center">
                    <p className="text-white text-opacity-60">
                      {searchTerm ? 'No accounts found matching your search.' : 'No accounts available.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAccounts.map((account) => {
                      const isLinked = linkedAccounts.some(acc => acc.accountId === account.id);
                      const linkedAccount = linkedAccounts.find(acc => acc.accountId === account.id);
                      
                      return (
                        <div
                          key={account.id}
                          className={`glass rounded-xl p-4 transition-all ${
                            isLinked ? 'border border-blue-500/50 bg-blue-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={() => handleToggleAccount(account.id)}
                              className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <h4 className="font-medium text-white">{account.name}</h4>
                                  <p className="text-sm text-white text-opacity-60">{account.account_type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-white">{formatCurrency(account.current_balance)}</p>
                                  <p className="text-xs text-white text-opacity-60">Current Balance</p>
                                </div>
                              </div>
                              
                              {isLinked && linkedAccount && (
                                <div className="mt-3 flex items-center gap-3">
                                  <div className="flex-1">
                                    <label className="block text-xs text-white text-opacity-80 mb-1">
                                      Allocation %
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={linkedAccount.allocationPercentage}
                                      onChange={(e) => handleAllocationChange(account.id, parseFloat(e.target.value) || 0)}
                                      className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-xs text-white text-opacity-80 mb-1">
                                      Estimated Contribution
                                    </label>
                                    <div className="px-3 py-2 glass rounded-lg">
                                      <p className="text-sm font-medium text-blue-400">
                                        {formatCurrency(linkedAccount.estimatedContribution)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary */}
              {linkedAccounts.length > 0 && (
                <div className="glass-strong rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white text-opacity-90 mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-opacity-80">Linked Accounts</span>
                      <span className="font-semibold text-white">{linkedAccounts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-opacity-80">Total Allocation</span>
                      <span className={`font-semibold ${
                        totalAllocation > 100 ? 'text-red-400' : totalAllocation === 100 ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {totalAllocation.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-opacity-80">Total Estimated Contribution</span>
                      <span className="font-semibold text-blue-400">{formatCurrency(totalEstimated)}</span>
                    </div>
                    
                    {totalAllocation > 100 && (
                      <div className="mt-4 p-3 glass rounded-lg border border-yellow-500/30 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-200">
                          Total allocation exceeds 100%. Please adjust allocations before saving.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-6 py-3 glass rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || totalAllocation > 100}
                  className="flex-1 px-6 py-3 glass-button rounded-xl text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
