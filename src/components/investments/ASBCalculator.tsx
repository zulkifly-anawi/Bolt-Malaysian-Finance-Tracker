import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateASBProjection, DIVIDEND_RATES } from '../../utils/investmentCalculators';

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
  const [projection, setProjection] = useState<any>(null);

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
  const estimatedAnnualDividend = account.current_balance * (currentYearRate / 100);

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
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">2024 Dividend Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{currentYearRate}%</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Est. Annual Dividend</p>
          <p className="text-xl font-bold text-white">{formatCurrency(estimatedAnnualDividend)}</p>
        </div>

        {account.units_held && account.units_held > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-sm font-medium text-white text-opacity-80 mb-2">Units Held</p>
            <p className="text-xl font-bold text-white">{account.units_held.toLocaleString('ms-MY')}</p>
          </div>
        )}
      </div>

      <div className="glass-strong rounded-2xl p-4 mb-4">
        <h4 className="font-semibold text-white mb-3">Historical Dividend Rates</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(DIVIDEND_RATES.ASB).reverse().map(([year, rate]) => (
            <div key={year} className="text-center">
              <p className="text-xs text-white text-opacity-70 mb-1">{year}</p>
              <p className="text-sm font-bold text-emerald-400">{rate}%</p>
            </div>
          ))}
        </div>
      </div>

      {projection && (
        <div className="glass-button rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-white" />
            <h4 className="font-semibold text-white">Projection for {years} Years</h4>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Projected Balance</p>
              <p className="text-xl font-bold text-white">{formatCurrency(projection.projectedBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Total Dividends</p>
              <p className="text-xl font-bold text-white">{formatCurrency(projection.totalDividends)}</p>
            </div>
            <div>
              <p className="text-sm text-white text-opacity-80 mb-1">Total Returns</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(projection.projectedBalance - account.current_balance - projection.totalContributions)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
