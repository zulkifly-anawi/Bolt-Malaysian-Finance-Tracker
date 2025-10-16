import { useState, useEffect } from 'react';
import { Compass, TrendingUp, Calendar, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateTabungHajiProjection, DIVIDEND_RATES, HAJJ_COST_2025 } from '../../utils/investmentCalculators';

interface TabungHajiTrackerProps {
  account: {
    id: string;
    name: string;
    current_balance: number;
    monthly_contribution?: number;
  };
}

export const TabungHajiTracker = ({ account }: TabungHajiTrackerProps) => {
  const [numPeople, setNumPeople] = useState(1);
  const [projection, setProjection] = useState<any>(null);

  useEffect(() => {
    const targetAmount = HAJJ_COST_2025 * numPeople;
    const proj = calculateTabungHajiProjection(
      account.current_balance,
      account.monthly_contribution || 0,
      targetAmount
    );
    setProjection(proj);
  }, [account, numPeople]);

  const currentYearRate = DIVIDEND_RATES['Tabung Haji'][2024];
  const estimatedAnnualDividend = account.current_balance * (currentYearRate / 100);
  const totalHajjCost = HAJJ_COST_2025 * numPeople;
  const progressPercentage = Math.min((account.current_balance / totalHajjCost) * 100, 100);

  return (
    <div className="glass-card rounded-3xl p-6 liquid-shine glow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Tabung Haji Tracker</h3>
          <p className="text-sm text-white text-opacity-80">{account.name}</p>
        </div>
      </div>

      <div className="glass-button rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white text-opacity-80 text-sm mb-1">Hajj Cost Estimate 2025</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalHajjCost)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <select
              value={numPeople}
              onChange={(e) => setNumPeople(parseInt(e.target.value))}
              className="glass text-white font-semibold px-3 py-2 rounded-lg border-2 border-white border-opacity-20 cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n} className="bg-gray-800">{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg h-3 mb-2">
          <div
            className="bg-white rounded-lg h-3 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white text-opacity-80">{progressPercentage.toFixed(1)}% saved</span>
          <span className="text-white text-opacity-80">{formatCurrency(account.current_balance)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">2024 Dividend Rate</p>
          <p className="text-2xl font-bold text-teal-400">{currentYearRate}%</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Est. Annual Dividend</p>
          <p className="text-xl font-bold text-white">{formatCurrency(estimatedAnnualDividend)}</p>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-4 mb-4">
        <h4 className="font-semibold text-white mb-3">Historical Dividend Rates</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(DIVIDEND_RATES['Tabung Haji']).reverse().map(([year, rate]) => (
            <div key={year} className="text-center">
              <p className="text-xs text-white text-opacity-70 mb-1">{year}</p>
              <p className="text-sm font-bold text-teal-400">{rate}%</p>
            </div>
          ))}
        </div>
      </div>

      {projection && (
        <div className="glass-card rounded-3xl p-6 border-2 border-teal-400 border-opacity-30 liquid-shine">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-teal-400" />
            <h4 className="font-semibold text-white">Hajj Affordability Projection</h4>
          </div>

          {account.current_balance >= totalHajjCost ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-600 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xl font-bold text-green-400 mb-2">Alhamdulillah!</p>
              <p className="text-white text-opacity-90">You can afford Hajj for {numPeople} {numPeople === 1 ? 'person' : 'people'} now!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-strong rounded-xl">
                <div>
                  <p className="text-sm text-white text-opacity-80 mb-1">Years to Hajj</p>
                  <p className="text-2xl font-bold text-teal-400">
                    {projection.yearsToHajj < 30 ? `${projection.yearsToHajj} years` : '30+ years'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-teal-400" />
              </div>

              <div className="p-4 glass rounded-xl">
                <p className="text-sm text-white text-opacity-80 mb-1">Amount Needed</p>
                <p className="text-xl font-bold text-white">{formatCurrency(projection.shortfall)}</p>
              </div>

              {account.monthly_contribution && account.monthly_contribution > 0 && (
                <div className="p-4 glass-strong rounded-xl">
                  <p className="text-sm text-white text-opacity-90 mb-2">
                    At your current monthly contribution of <span className="font-bold text-white">{formatCurrency(account.monthly_contribution)}</span>,
                    you'll reach your Hajj goal in approximately <span className="font-bold text-white">{projection.yearsToHajj} years</span>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
