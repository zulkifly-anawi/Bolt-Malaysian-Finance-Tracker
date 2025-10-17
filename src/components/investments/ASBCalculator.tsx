import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateASBProjection, DIVIDEND_RATES, ASB_RATES_DETAILED, calculateASBDividendByUnits } from '../../utils/investmentCalculators';

interface ASBCalculatorProps {
  account: {
    id: string;
    name: string;
    current_balance: number;
    units_held?: number;
    monthly_contribution?: number;
  };
  onUpdate?: () => void;
}

export const ASBCalculator = ({ account }: ASBCalculatorProps) => {
  const [years, setYears] = useState(5);
  const [projection, setProjection] = useState<{
    projectedBalance: number;
    totalDividends: number;
    totalContributions: number;
    yearlyBreakdown: Array<{year: number; balance: number; dividend: number}>;
  } | null>(null);

  useEffect(() => {
    const proj = calculateASBProjection(
      account.current_balance,
      account.units_held || 0,
      account.monthly_contribution || 0,
      years
    );
    setProjection(proj);
  }, [account, years]);

  const currentYearRate = DIVIDEND_RATES.ASB[2024];
  const currentYearDetails = ASB_RATES_DETAILED[2024];
  const estimatedAnnualDividend = account.current_balance * (currentYearRate / 100);
  const estimatedDividendByUnits = account.units_held ? calculateASBDividendByUnits(account.units_held, currentYearRate) : 0;
  const formatSen = (value: number) => `${value.toFixed(2)} sen`;

  return (
    <div className="glass-card rounded-3xl p-6 liquid-shine glow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">ASB Dividend Calculator</h3>
          <p className="text-sm text-white text-opacity-80">{account.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-medium text-white text-opacity-80">Current Balance</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(account.current_balance)}</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white text-opacity-80">2024 Total Distribution</p>
            <div className="group relative">
              <Info className="w-4 h-4 text-white text-opacity-60 hover:text-opacity-100 cursor-help" />
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 glass-strong rounded-xl text-xs text-white z-10">
                <p className="font-semibold mb-1">Distribution Breakdown:</p>
                <p>Dividend: {formatSen(currentYearDetails.dividend)}</p>
                <p>Bonus: {formatSen(currentYearDetails.bonus)}</p>
                <p className="mt-1 text-emerald-400">Total: {formatSen(currentYearDetails.total)}</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{currentYearRate}%</p>
          <p className="text-xs text-white text-opacity-60 mt-1">{formatSen(currentYearDetails.total)} per unit</p>
        </div>

        {account.units_held && account.units_held > 0 ? (
          <>
            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-medium text-white text-opacity-80 mb-2">Units Held</p>
              <p className="text-xl font-bold text-white">{account.units_held.toLocaleString('ms-MY')}</p>
              <p className="text-xs text-white text-opacity-60 mt-1">@ RM 1.00 per unit</p>
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-medium text-white text-opacity-80 mb-2">Est. Annual Return (2024 Rate)</p>
              <p className="text-xl font-bold text-white">{formatCurrency(estimatedDividendByUnits)}</p>
              <p className="text-xs text-emerald-400 text-opacity-80 mt-1">Based on {account.units_held.toLocaleString('ms-MY')} units</p>
            </div>
          </>
        ) : (
          <div className="glass rounded-2xl p-4">
            <p className="text-sm font-medium text-white text-opacity-80 mb-2">Est. Annual Dividend</p>
            <p className="text-xl font-bold text-white">{formatCurrency(estimatedAnnualDividend)}</p>
            <p className="text-xs text-white text-opacity-60 mt-1">Based on balance</p>
          </div>
        )}
      </div>

      <div className="glass-strong rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white">Historical Distribution Rates</h4>
          <span className="text-xs text-white text-opacity-60 px-2 py-1 glass rounded-lg">Official ASB Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="text-left text-white text-opacity-70 pb-2 px-2">Year</th>
                <th className="text-right text-white text-opacity-70 pb-2 px-2">Dividend</th>
                <th className="text-right text-white text-opacity-70 pb-2 px-2">Bonus</th>
                <th className="text-right text-white text-opacity-70 pb-2 px-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ASB_RATES_DETAILED).reverse().map(([year, rates]) => (
                <tr key={year} className="border-b border-white border-opacity-10">
                  <td className="py-2 px-2 text-white font-medium">{year}</td>
                  <td className="py-2 px-2 text-right text-white text-opacity-90">{formatSen(rates.dividend)}</td>
                  <td className="py-2 px-2 text-right text-white text-opacity-90">{formatSen(rates.bonus)}</td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-bold">{rates.total}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white text-opacity-60 mt-3 italic">* Rates shown are per unit distributions in sen</p>
      </div>

      {projection && (
        <div className="glass-button rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white" />
              <h4 className="font-semibold text-white">Future Projection ({years} Years)</h4>
            </div>
            <span className="text-xs text-amber-400 px-2 py-1 glass rounded-lg flex items-center gap-1">
              <Info className="w-3 h-3" />
              Estimate
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-white text-opacity-80 mb-2">Projection Period (Years)</label>
            <input
              type="range"
              min="1"
              max="20"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full h-2 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white text-opacity-70 mt-1">
              <span>1 year</span>
              <span>{years} years</span>
              <span>20 years</span>
            </div>
          </div>

          <div className="glass rounded-xl p-3 mb-4 border border-amber-400 border-opacity-30">
            <p className="text-xs text-white text-opacity-80">
              <span className="font-semibold text-amber-400">Note:</span> Future projections are estimates based on the 2024 rate of {currentYearRate}% ({formatSen(currentYearDetails.total)} per unit). Actual returns may vary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Projected Balance</p>
              <p className="text-xl font-bold text-white">{formatCurrency(projection.projectedBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Total Dividends Earned</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(projection.totalDividends)}</p>
            </div>
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Net Returns</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(projection.projectedBalance - account.current_balance - projection.totalContributions)}
              </p>
            </div>
          </div>

          {account.monthly_contribution > 0 && (
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-white text-opacity-70">Total Contributions: {formatCurrency(projection.totalContributions)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
