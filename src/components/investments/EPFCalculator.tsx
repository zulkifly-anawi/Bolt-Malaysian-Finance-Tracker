import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertCircle, CheckCircle2, Calendar, Settings, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateEPFProjection, getEPFBenchmarkForAge, calculateDividendRateByMethod, EPF_CONVENTIONAL_RATES, EPF_SYARIAH_RATES } from '../../utils/investmentCalculators';
import type { EPFSavingsType, EPFDividendRateMethod } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getEPFContributionSettings, calculateEPFContribution, getContributionExplanation } from '../../utils/epfContributionHelpers';
import type { EPFContributionSettings } from '../../utils/epfContributionHelpers';

interface EPFCalculatorProps {
  account: {
    id: string;
    name: string;
    current_balance: number;
    monthly_contribution?: number;
    epf_savings_type?: EPFSavingsType | null;
    epf_dividend_rate_method?: EPFDividendRateMethod | null;
  };
}

export const EPFCalculator = ({ account }: EPFCalculatorProps) => {
  const { user } = useAuth();
  const [userAge, setUserAge] = useState<number>(30);
  const [monthlySalary, setMonthlySalary] = useState<number>(5000);
  const [projection, setProjection] = useState<any>(null);
  const [contributionSettings, setContributionSettings] = useState<EPFContributionSettings | null>(null);
  const [contributionBreakdown, setContributionBreakdown] = useState<any>(null);
  const [savingsType, setSavingsType] = useState<EPFSavingsType>(account.epf_savings_type || 'Conventional');
  const [rateMethod, setRateMethod] = useState<EPFDividendRateMethod>(account.epf_dividend_rate_method || 'latest');
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadContributionSettings();
  }, [user, account.id]);

  useEffect(() => {
    if (userAge && monthlySalary && contributionSettings) {
      const breakdown = calculateEPFContribution(monthlySalary, contributionSettings);
      setContributionBreakdown(breakdown);

      const proj = calculateEPFProjection(
        account.current_balance,
        userAge,
        monthlySalary,
        55,
        contributionSettings.employeePercentage,
        contributionSettings.employerPercentage,
        contributionSettings.useTotal,
        savingsType,
        rateMethod
      );
      setProjection(proj);
    }
  }, [account, userAge, monthlySalary, contributionSettings, savingsType, rateMethod]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('age, monthly_salary')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      if (data.age) setUserAge(data.age);
      if (data.monthly_salary) setMonthlySalary(data.monthly_salary);
    }
  };

  const loadContributionSettings = async () => {
    if (!user) return;
    const settings = await getEPFContributionSettings(user.id, account.id);
    setContributionSettings(settings);
  };

  const currentYearRate = calculateDividendRateByMethod(savingsType, rateMethod);
  const estimatedAnnualDividend = account.current_balance * (currentYearRate / 100);

  const updateSavingsSettings = async (newSavingsType?: EPFSavingsType, newRateMethod?: EPFDividendRateMethod) => {
    if (!user) return;

    const updates: any = {};
    if (newSavingsType) {
      setSavingsType(newSavingsType);
      updates.epf_savings_type = newSavingsType;
    }
    if (newRateMethod) {
      setRateMethod(newRateMethod);
      updates.epf_dividend_rate_method = newRateMethod;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('accounts')
        .update(updates)
        .eq('id', account.id)
        .eq('user_id', user.id);
    }
  };
  const currentBenchmark = getEPFBenchmarkForAge(userAge);
  const benchmarkProgress = (account.current_balance / currentBenchmark) * 100;

  const statusColors = {
    ahead: { border: 'border-green-400 border-opacity-30', text: 'text-green-400', badge: 'bg-green-600' },
    'on-track': { border: 'border-gray-400 border-opacity-30', text: 'text-gray-300', badge: 'bg-gray-700' },
    behind: { border: 'border-orange-400 border-opacity-30', text: 'text-orange-400', badge: 'bg-orange-600' },
  };

  const statusIcons = {
    ahead: <CheckCircle2 className="w-5 h-5" />,
    'on-track': <TrendingUp className="w-5 h-5" />,
    behind: <AlertCircle className="w-5 h-5" />,
  };

  const status = (projection?.status || 'on-track') as 'ahead' | 'on-track' | 'behind';
  const colors = statusColors[status];

  return (
    <div className="glass-card rounded-3xl p-6 liquid-shine glow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">EPF Retirement Calculator</h3>
          <p className="text-sm text-white text-opacity-80">{account.name}</p>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-5 mb-6">
        <h4 className="font-semibold text-white mb-4">EPF Savings Settings</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white text-opacity-80 mb-2">Savings Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSavingsSettings('Conventional', undefined)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  savingsType === 'Conventional'
                    ? 'glass-button text-white shadow-lg'
                    : 'glass text-white text-opacity-70 hover:text-opacity-100'
                }`}
              >
                Conventional
              </button>
              <button
                onClick={() => updateSavingsSettings('Syariah', undefined)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  savingsType === 'Syariah'
                    ? 'glass-button text-white shadow-lg'
                    : 'glass text-white text-opacity-70 hover:text-opacity-100'
                }`}
              >
                Syariah
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white text-opacity-80 mb-2">Dividend Rate Method</label>
            <select
              value={rateMethod}
              onChange={(e) => updateSavingsSettings(undefined, e.target.value as EPFDividendRateMethod)}
              className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
            >
              <option value="latest" className="bg-gray-800">Latest Rate (2024)</option>
              <option value="3-year-average" className="bg-gray-800">3-Year Average (2022-2024)</option>
              <option value="5-year-average" className="bg-gray-800">5-Year Average (2020-2024)</option>
              <option value="historical-average" className="bg-gray-800">Historical Average (2017-2024)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Current EPF Balance</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(account.current_balance)}</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Calculated Rate ({savingsType})</p>
          <p className="text-2xl font-bold text-gray-200">{currentYearRate.toFixed(2)}%</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Est. Annual Dividend</p>
          <p className="text-xl font-bold text-white">{formatCurrency(estimatedAnnualDividend)}</p>
        </div>
      </div>

      {contributionBreakdown && contributionSettings && (
        <div className="glass-strong rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Monthly Contribution Breakdown</h4>
            <div className="flex items-center gap-2 text-xs text-white text-opacity-70">
              <Settings className="w-3 h-3" />
              <span>{contributionSettings.source === 'account' ? 'Account-specific' : contributionSettings.source === 'profile' ? 'Profile default' : 'System default'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {!contributionSettings.isManual ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-white text-opacity-80">
                    Employee ({contributionSettings.employeePercentage}%)
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(contributionBreakdown.employeeContribution)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-opacity-80">
                    Employer ({contributionSettings.employerPercentage}%)
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(contributionBreakdown.employerContribution)}
                  </span>
                </div>
                <div className="pt-3 border-t border-white border-opacity-20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Total Contribution</span>
                    <span className="font-bold text-white text-xl">
                      {formatCurrency(contributionBreakdown.totalContribution)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white text-opacity-70">Used in Projections</span>
                    <span className="font-bold text-gray-200">
                      {formatCurrency(contributionBreakdown.usedContribution)}
                    </span>
                  </div>
                </div>
                {!contributionSettings.useTotal && (
                  <div className="glass rounded-lg p-3 mt-2">
                    <p className="text-xs text-white text-opacity-80">
                      Only employee contribution is used in retirement projections. Consider including employer contribution for more accurate planning.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-opacity-80">Manual Amount</span>
                  <span className="font-bold text-white text-xl">
                    {formatCurrency(contributionBreakdown.usedContribution)}
                  </span>
                </div>
                <p className="text-xs text-white text-opacity-70 mt-2">
                  Using manually entered contribution amount
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs text-white text-opacity-70">
              {getContributionExplanation(contributionSettings)}
            </p>
          </div>
        </div>
      )}

      <div className="glass-strong rounded-2xl p-5 mb-6">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="w-full flex items-center justify-between mb-4 hover:bg-white hover:bg-opacity-5 rounded-lg p-2 -m-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">Historical Dividend Rates (2017-2024)</h4>
          </div>
          <div className="flex items-center gap-2">
            {!historyExpanded && (
              <span className="text-sm text-gray-200 font-medium">
                2024: {EPF_CONVENTIONAL_RATES[2024].toFixed(2)}% (Conv), {EPF_SYARIAH_RATES[2024].toFixed(2)}% (Syariah)
              </span>
            )}
            <ChevronDown
              className={`w-5 h-5 text-white transition-transform ${historyExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {historyExpanded && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white border-opacity-20">
                    <th className="text-left text-sm font-medium text-white text-opacity-80 pb-3">Year</th>
                    <th className="text-center text-sm font-medium text-white text-opacity-80 pb-3">Conventional</th>
                    <th className="text-center text-sm font-medium text-white text-opacity-80 pb-3">Syariah</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(EPF_CONVENTIONAL_RATES).sort((a, b) => Number(b) - Number(a)).map((year) => {
                    const conventionalRate = EPF_CONVENTIONAL_RATES[Number(year)];
                    const syariahRate = EPF_SYARIAH_RATES[Number(year)];

                    return (
                      <tr key={year} className="border-b border-white border-opacity-10">
                        <td className="py-3 text-white font-medium">{year}</td>
                        <td className={`py-3 text-center font-semibold ${savingsType === 'Conventional' ? 'text-white' : 'text-white text-opacity-60'}`}>
                          {conventionalRate.toFixed(2)}%
                        </td>
                        <td className={`py-3 text-center font-semibold ${savingsType === 'Syariah' ? 'text-white' : 'text-white text-opacity-60'}`}>
                          {syariahRate.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <p className="text-xs text-white text-opacity-60">
                Historical rates shown for reference. Your selected <span className="font-semibold text-white">{savingsType}</span> rates are highlighted.
                Actual future dividend rates may vary based on EPF investment performance.
              </p>
            </div>
          </>
        )}
      </div>

      <div className={`glass-card rounded-3xl p-6 border-2 ${colors.border} mb-6 liquid-shine`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`${colors.badge} rounded-lg p-2 text-white shadow-lg`}>
            {statusIcons[status]}
          </div>
          <div>
            <h4 className="font-semibold text-white">KWSP Benchmark for Age {userAge}</h4>
            <p className={`text-sm ${colors.text} font-medium`}>
              {status === 'ahead' ? 'You are ahead of schedule!' :
               status === 'on-track' ? 'You are on track' :
               'You need to catch up'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white text-opacity-80">Your Balance vs Benchmark</span>
              <span className="font-semibold text-white">{benchmarkProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className={`${colors.badge} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(benchmarkProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-opacity-80">Your Balance:</span>
            <span className="font-bold text-white">{formatCurrency(account.current_balance)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white text-opacity-80">Recommended:</span>
            <span className="font-bold text-white">{formatCurrency(currentBenchmark)}</span>
          </div>
        </div>
      </div>

      {projection && (
        <div className="glass-button rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-white" />
            <h4 className="font-semibold text-white">Projection to Age 55</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Years to Retirement</p>
              <p className="text-2xl font-bold text-white">{projection.yearsToRetirement} years</p>
            </div>
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Projected Balance at 55</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projection.projectedBalance)}</p>
            </div>
          </div>

          <div className="glass-strong rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-opacity-80">KWSP Minimum at 55:</span>
              <span className="font-bold text-white">{formatCurrency(projection.benchmark)}</span>
            </div>

            {projection.additionalNeeded > 0 ? (
              <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                <p className="text-sm text-white text-opacity-80 mb-1">Additional Savings Needed:</p>
                <p className="text-xl font-bold text-yellow-300">{formatCurrency(projection.additionalNeeded)}</p>
                <p className="text-sm text-white text-opacity-80 mt-2">
                  Consider increasing your monthly contributions or exploring additional investment options.
                </p>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                <p className="text-green-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  You're on track to meet the recommended minimum!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
