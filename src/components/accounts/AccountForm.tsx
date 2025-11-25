import { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { calculateDividendRateByMethod } from '../../utils/investmentCalculators';
import { validateAccountData, validateAge, validateSalary } from '../../utils/validation';
import { EPFContributionSection } from './EPFContributionSection';
import type { Account, EPFSavingsType, EPFDividendRateMethod } from '../../types/database';
import { useAccountTypes, useInstitutions } from '../../hooks/useConfig';

interface AccountFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: Account;
}

export const AccountForm = ({ onClose, onSuccess, editData }: AccountFormProps) => {
  const { user } = useAuth();
  const { accountTypes } = useAccountTypes();
  const { institutions } = useInstitutions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    name: editData?.name || '',
    accountType: editData?.account_type || 'ASB',
    institution: editData?.institution || '',
    currentBalance: editData?.current_balance || 0,
    monthlyContribution: editData?.monthly_contribution || 0,
    unitsHeld: editData?.units_held || 0,
    dividendRate: editData?.dividend_rate || 0,
    pilgrimageGoalType: editData?.pilgrimage_goal_type || 'Hajj',
    age: 0,
    monthlySalary: 0,
    epfSavingsType: (editData?.epf_savings_type || 'Conventional') as EPFSavingsType,
    epfDividendRateMethod: (editData?.epf_dividend_rate_method || 'latest') as EPFDividendRateMethod,
  });

  const [epfContribution, setEpfContribution] = useState<{
    isManual: boolean;
    manualAmount?: number;
    employeePercentage?: number;
    employerPercentage?: number;
    useTotal?: boolean;
  }>({
    isManual: editData?.is_manual_contribution || false,
    manualAmount: editData?.monthly_contribution || 0,
    employeePercentage: editData?.employee_contribution_percentage || undefined,
    employerPercentage: editData?.employer_contribution_percentage || undefined,
    useTotal: editData?.use_total_contribution ?? true,
  });

  const [balanceChanged, setBalanceChanged] = useState(false);

  useEffect(() => {
    if (isEditMode && editData) {
      setBalanceChanged(formData.currentBalance !== editData.current_balance);
    }
  }, [formData.currentBalance, editData, isEditMode]);

  useEffect(() => {
    if (formData.accountType === 'ASB') {
      setFormData(prev => ({
        ...prev,
        unitsHeld: prev.currentBalance
      }));
    }
  }, [formData.currentBalance, formData.accountType]);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('monthly_salary, age')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      if (data.monthly_salary) {
        setFormData(prev => ({ ...prev, monthlySalary: data.monthly_salary || 0 }));
      }
      if (data.age) {
        setFormData(prev => ({ ...prev, age: data.age || 0 }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    const validation = validateAccountData({
      name: formData.name,
      account_type: formData.accountType,
      current_balance: formData.currentBalance,
      units_held: formData.unitsHeld,
      monthly_contribution: formData.monthlyContribution,
      dividend_rate: formData.dividendRate,
    });

    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      setLoading(false);
      return;
    }

    if (formData.accountType === 'EPF') {
      const ageValidation = validateAge(formData.age);
      if (!ageValidation.isValid) {
        setError(ageValidation.errors.join('. '));
        setLoading(false);
        return;
      }

      const salaryValidation = validateSalary(formData.monthlySalary);
      if (!salaryValidation.isValid) {
        setError(salaryValidation.errors.join('. '));
        setLoading(false);
        return;
      }
    }

    try {
      if (formData.accountType === 'EPF' && formData.age > 0 && formData.monthlySalary > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            age: formData.age,
            monthly_salary: formData.monthlySalary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Failed to update profile:', profileError);
        }
      }

      const updateData: any = {
        name: formData.name,
        account_type: formData.accountType,
        institution: formData.institution || null,
        current_balance: formData.currentBalance,
        units_held: formData.unitsHeld || 0,
        dividend_rate: formData.dividendRate || 0,
        pilgrimage_goal_type: formData.accountType === 'Tabung Haji' ? formData.pilgrimageGoalType : null,
        updated_at: new Date().toISOString(),
      };

      if (formData.accountType === 'EPF') {
        updateData.is_manual_contribution = epfContribution.isManual;
        updateData.epf_savings_type = formData.epfSavingsType;
        updateData.epf_dividend_rate_method = formData.epfDividendRateMethod;
        if (epfContribution.isManual) {
          updateData.monthly_contribution = epfContribution.manualAmount || 0;
          updateData.employee_contribution_percentage = null;
          updateData.employer_contribution_percentage = null;
        } else {
          updateData.monthly_contribution = 0;
          updateData.employee_contribution_percentage = epfContribution.employeePercentage || null;
          updateData.employer_contribution_percentage = epfContribution.employerPercentage || null;
          updateData.use_total_contribution = epfContribution.useTotal ?? true;
        }
      } else {
        updateData.monthly_contribution = formData.monthlyContribution || 0;
      }

      if (isEditMode && editData) {
        const { error: updateError } = await supabase
          .from('accounts')
          .update(updateData)
          .eq('id', editData.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        if (balanceChanged) {
          const { error: balanceError } = await supabase
            .from('balance_entries')
            .insert({
              account_id: editData.id,
              balance: formData.currentBalance,
              entry_date: new Date().toISOString().split('T')[0],
              notes: 'Balance updated',
            });

          if (balanceError) {
            console.error('Failed to create balance entry:', balanceError);
          }
        }
      } else {
        const insertData: any = {
          user_id: user.id,
          ...updateData,
        };

        const { data: insertedAccount, error: insertError } = await supabase
          .from('accounts')
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;
        if (!insertedAccount) throw new Error('Failed to create account');

        const { error: balanceError } = await supabase
          .from('balance_entries')
          .insert({
            account_id: insertedAccount.id,
            balance: formData.currentBalance,
            entry_date: new Date().toISOString().split('T')[0],
            notes: 'Initial balance',
          });

        if (balanceError) {
          console.error('Failed to create initial balance entry:', balanceError);
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} account. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const showASBFields = formData.accountType === 'ASB';
  const showDividendField = ['ASB', 'Tabung Haji', 'Investment'].includes(formData.accountType);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glow" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass-button rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Account' : 'Add Investment Account'}</h2>
                <p className="text-sm text-white text-opacity-80">{isEditMode ? 'Update account details' : 'Track your Malaysian investments'}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white text-opacity-80 hover:text-opacity-100 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="glass-strong rounded-2xl p-4 mb-4 border border-red-500 border-opacity-30">
              <div className="flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {isEditMode && balanceChanged && (
            <div className="glass rounded-2xl p-4 mb-4 border border-yellow-500 border-opacity-30">
              <p className="text-sm text-yellow-200">
                Balance will be updated and a new history entry will be created
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                placeholder="e.g., My ASB Account"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Account Type *
              </label>
              <select
                required
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              >
                {accountTypes.map((type) => (
                  <option key={type.id} value={type.name} className="bg-gray-800">
                    {type.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Institution
              </label>
              <select
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              >
                <option value="" className="bg-gray-800">Select institution (optional)</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name} className="bg-gray-800">
                    {inst.display_name}
                  </option>
                ))}
              </select>
            </div>

            {formData.accountType === 'Tabung Haji' && (
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Pilgrimage Goal *
                </label>
                <select
                  required
                  value={formData.pilgrimageGoalType}
                  onChange={(e) => setFormData({ ...formData, pilgrimageGoalType: e.target.value as 'Hajj' | 'Umrah' })}
                  className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                >
                  <option value="Hajj" className="bg-gray-800">Hajj (RM 45,000 per person)</option>
                  <option value="Umrah" className="bg-gray-800">Umrah (RM 15,000 per person)</option>
                </select>
                <div className="flex items-start gap-2 mt-2">
                  <Info className="w-4 h-4 text-white text-opacity-60 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white text-opacity-60">
                    Select your pilgrimage goal. This will be used to calculate projections and track your progress.
                  </p>
                </div>
              </div>
            )}

            {formData.accountType === 'EPF' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                    Your Age *
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="65"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                    placeholder="30"
                  />
                  <div className="flex items-start gap-2 mt-2">
                    <Info className="w-4 h-4 text-white text-opacity-60 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white text-opacity-60">
                      Required for EPF retirement projections and benchmarks (Age 18-65)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                    Monthly Salary (RM) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monthlySalary || ''}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                    placeholder="5000"
                  />
                  {formData.monthlySalary > 0 && (
                    <p className="text-xs text-white text-opacity-60 mt-1">
                      {formatCurrency(formData.monthlySalary)} per month
                    </p>
                  )}
                  <div className="flex items-start gap-2 mt-2">
                    <Info className="w-4 h-4 text-white text-opacity-60 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white text-opacity-60">
                      Used to calculate your EPF contributions and retirement projections
                    </p>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Current Balance (RM) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.currentBalance || ''}
                onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                placeholder="10000"
              />
            </div>

            {formData.accountType === 'EPF' && (
              <>
                <div className="glass-strong rounded-2xl p-5 space-y-4">
                  <h4 className="font-semibold text-white mb-3">EPF Savings Type & Dividend Rate Settings</h4>

                  <div>
                    <label className="block text-sm font-medium text-white text-opacity-95 mb-3">
                      Savings Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, epfSavingsType: 'Conventional' })}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          formData.epfSavingsType === 'Conventional'
                            ? 'glass-button text-white shadow-lg'
                            : 'glass text-white text-opacity-70 hover:text-opacity-100'
                        }`}
                      >
                        Conventional
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, epfSavingsType: 'Syariah' })}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          formData.epfSavingsType === 'Syariah'
                            ? 'glass-button text-white shadow-lg'
                            : 'glass text-white text-opacity-70 hover:text-opacity-100'
                        }`}
                      >
                        Syariah
                      </button>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Info className="w-4 h-4 text-white text-opacity-60 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white text-opacity-60">
                        Select your EPF savings type. Both types offer competitive returns aligned with their respective investment principles.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                      Dividend Rate Method *
                    </label>
                    <select
                      required
                      value={formData.epfDividendRateMethod}
                      onChange={(e) => setFormData({ ...formData, epfDividendRateMethod: e.target.value as EPFDividendRateMethod })}
                      className="w-full px-4 py-3 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                    >
                      <option value="latest" className="bg-gray-800">Use Latest Rate (2024)</option>
                      <option value="3-year-average" className="bg-gray-800">Use 3-Year Average (2022-2024)</option>
                      <option value="5-year-average" className="bg-gray-800">Use 5-Year Average (2020-2024)</option>
                      <option value="historical-average" className="bg-gray-800">Use Historical Average (2017-2024)</option>
                    </select>
                    <div className="glass rounded-lg p-3 mt-2">
                      <p className="text-sm text-white font-semibold mb-1">
                        Calculated Rate: {calculateDividendRateByMethod(formData.epfSavingsType, formData.epfDividendRateMethod).toFixed(2)}%
                      </p>
                      <p className="text-xs text-white text-opacity-60">
                        This rate will be used for all retirement projections and calculations. Historical rates are estimates; actual future rates may vary.
                      </p>
                    </div>
                  </div>
                </div>

                {formData.monthlySalary > 0 && (
                  <EPFContributionSection
                    monthlySalary={formData.monthlySalary}
                    onContributionChange={setEpfContribution}
                    initialData={epfContribution}
                  />
                )}
              </>
            )}

            {formData.accountType !== 'EPF' && (
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Monthly Contribution (RM)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyContribution || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="500"
                />
              </div>
            )}

            {showASBFields && (
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Units Held
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.unitsHeld || ''}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 glass-card text-white text-opacity-70 placeholder-white placeholder-opacity-40 rounded-xl outline-none cursor-not-allowed bg-white bg-opacity-5"
                    placeholder="10000"
                  />
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <Info className="w-4 h-4 text-white text-opacity-60 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white text-opacity-60">
                    ASB units are automatically calculated at RM1.00 per unit. This field reflects your current balance and cannot be edited manually.
                  </p>
                </div>
              </div>
            )}

            {showDividendField && (
              <div>
                <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                  Expected Dividend Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.dividendRate || ''}
                  onChange={(e) => setFormData({ ...formData, dividendRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                  placeholder="4.5"
                />
                <p className="text-xs text-white text-opacity-60 mt-1">
                  {formData.accountType === 'ASB' && 'Historical ASB dividend: 4-5%'}
                  {formData.accountType === 'Tabung Haji' && 'Historical Tabung Haji dividend: 4-5%'}
                </p>
              </div>
            )}

            {formData.currentBalance > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-sm text-white text-opacity-80 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(formData.currentBalance)}</p>
                {formData.monthlyContribution > 0 && (
                  <p className="text-sm text-white text-opacity-80 mt-2">
                    Monthly contribution: {formatCurrency(formData.monthlyContribution)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 glass text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 glass-button text-white rounded-xl font-semibold disabled:opacity-50 transition-all"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Account' : 'Add Account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
