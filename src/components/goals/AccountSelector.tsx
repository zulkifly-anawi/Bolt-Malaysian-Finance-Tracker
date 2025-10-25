import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import type { Account } from '../../types/database';

export interface SelectedAccount {
  accountId: string;
  accountName: string;
  currentBalance: number;
  allocationPercentage: number;
  estimatedContribution: number;
}

interface AccountSelectorProps {
  selectedAccounts: SelectedAccount[];
  onSelectionChange: (accounts: SelectedAccount[]) => void;
  disabled?: boolean;
}

export const AccountSelector = ({ selectedAccounts, onSelectionChange, disabled }: AccountSelectorProps) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAccountSelected = (accountId: string) => {
    return selectedAccounts.some(sa => sa.accountId === accountId);
  };

  const toggleAccount = (account: Account) => {
    if (isAccountSelected(account.id)) {
      // Remove account
      onSelectionChange(selectedAccounts.filter(sa => sa.accountId !== account.id));
    } else {
      // Add account with default 100% allocation
      const newAccount: SelectedAccount = {
        accountId: account.id,
        accountName: account.name,
        currentBalance: account.current_balance,
        allocationPercentage: 100,
        estimatedContribution: account.current_balance,
      };
      onSelectionChange([...selectedAccounts, newAccount]);
    }
  };

  const updateAllocation = (accountId: string, percentage: number) => {
    const updated = selectedAccounts.map(sa => {
      if (sa.accountId === accountId) {
        const validPercentage = Math.max(0, Math.min(100, percentage));
        return {
          ...sa,
          allocationPercentage: validPercentage,
          estimatedContribution: (sa.currentBalance * validPercentage) / 100,
        };
      }
      return sa;
    });
    onSelectionChange(updated);
  };

  const totalAllocation = selectedAccounts.reduce((sum, sa) => sum + sa.allocationPercentage, 0);
  const totalEstimated = selectedAccounts.reduce((sum, sa) => sum + sa.estimatedContribution, 0);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No Accounts Available</h3>
          <p className="text-white text-opacity-70 mb-4">
            You need to create at least one account before you can link it to a goal.
          </p>
          <button
            type="button"
            onClick={() => window.location.href = '#accounts'}
            className="px-4 py-2 glass-button text-white rounded-xl hover:bg-white hover:bg-opacity-10 transition-all"
          >
            Go to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
          Select Accounts to Link
        </label>
        <p className="text-xs text-white text-opacity-70 mb-3">
          Choose which accounts will fund this goal and set allocation percentages
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white text-opacity-50" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search accounts..."
          className="w-full pl-10 pr-4 py-2 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all text-sm"
          disabled={disabled}
        />
      </div>

      {/* Account List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredAccounts.map(account => {
          const selected = isAccountSelected(account.id);
          const selectedAccount = selectedAccounts.find(sa => sa.accountId === account.id);

          return (
            <div key={account.id} className={`glass-card rounded-xl p-3 transition-all ${selected ? 'ring-2 ring-blue-400' : ''}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleAccount(account)}
                  disabled={disabled}
                  className="mt-1 w-4 h-4 rounded border-gray-400 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm">{account.name}</span>
                    <span className="text-xs text-white text-opacity-70">{account.account_type}</span>
                  </div>
                  <div className="text-xs text-white text-opacity-80 mb-2">
                    Balance: {formatCurrency(account.current_balance)}
                  </div>

                  {/* Allocation Input (shown when selected) */}
                  {selected && selectedAccount && (
                    <div className="mt-2 pt-2 border-t border-white border-opacity-10">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-white text-opacity-90 whitespace-nowrap">
                          Allocation:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedAccount.allocationPercentage}
                          onChange={(e) => updateAllocation(account.id, parseInt(e.target.value) || 0)}
                          disabled={disabled}
                          className="w-16 px-2 py-1 glass-card text-white text-sm text-center rounded focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                        <span className="text-xs text-white text-opacity-70">%</span>
                        <span className="text-xs text-white text-opacity-90 ml-auto">
                          = {formatCurrency(selectedAccount.estimatedContribution)}
                        </span>
                      </div>
                      <p className="text-xs text-white text-opacity-60 mt-1">
                        {selectedAccount.allocationPercentage}% of this account's balance will count toward this goal
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedAccounts.length > 0 && (
        <div className="glass-strong rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white text-opacity-90">Selected Accounts:</span>
            <span className="font-semibold text-white">{selectedAccounts.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white text-opacity-90">Total Allocation:</span>
            <span className={`font-semibold ${totalAllocation > 100 ? 'text-orange-400' : 'text-white'}`}>
              {totalAllocation}%
            </span>
          </div>
          {totalAllocation > 100 && (
            <div className="flex items-center gap-2 text-xs text-orange-300 bg-orange-500 bg-opacity-10 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Total allocation exceeds 100%. This means you're over-committing these accounts.</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-white border-opacity-10">
            <span className="font-medium text-white">Estimated Progress:</span>
            <span className="font-bold text-white text-lg">{formatCurrency(totalEstimated)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
