import { useState, useEffect } from 'react';
import { Compass, TrendingUp, Calendar, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateTabungHajiProjection, DIVIDEND_RATES, HAJJ_COST_2025, UMRAH_COST } from '../../utils/investmentCalculators';
import { MobileDropdown } from '../common/MobileDropdown';

interface TabungHajiTrackerProps {
  account: {
    id: string;
    name: string;
    current_balance: number;
    monthly_contribution?: number;
    pilgrimage_goal_type?: 'Hajj' | 'Umrah' | null;
  };
}

export const TabungHajiTracker = ({ account }: TabungHajiTrackerProps) => {
  const [numPeople, setNumPeople] = useState(1);
  const [projection, setProjection] = useState<any>(null);

  const pilgrimageType = account.pilgrimage_goal_type || 'Hajj';
  const isUmrah = pilgrimageType === 'Umrah';
  const baseCost = isUmrah ? UMRAH_COST : HAJJ_COST_2025;
  const pilgrimageName = isUmrah ? 'Umrah' : 'Hajj';

  useEffect(() => {
    const targetAmount = baseCost * numPeople;
    const proj = calculateTabungHajiProjection(
      account.current_balance,
      account.monthly_contribution || 0,
      targetAmount,
      pilgrimageType
    );
    setProjection(proj);
  }, [account, numPeople, baseCost, pilgrimageType]);

  const currentYearRate = DIVIDEND_RATES['Tabung Haji'][2024];
  const estimatedAnnualDividend = account.current_balance * (currentYearRate / 100);
  const totalCost = baseCost * numPeople;
  const progressPercentage = Math.min((account.current_balance / totalCost) * 100, 100);

  const personOptions = [
    { value: 1, label: '1 person' },
    { value: 2, label: '2 people' },
    { value: 3, label: '3 people' },
    { value: 4, label: '4 people' },
    { value: 5, label: '5 people' },
  ];

  const iconColor = isUmrah ? 'from-blue-500 to-sky-600' : 'from-teal-500 to-cyan-600';
  const accentColor = isUmrah ? 'text-blue-400' : 'text-teal-400';
  const borderColor = isUmrah ? 'border-blue-400' : 'border-teal-400';

  return (
    <div className="glass-card rounded-3xl p-6 liquid-shine glow">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Tabung Haji Tracker</h3>
          <p className="text-sm text-white text-opacity-80">{account.name}</p>
        </div>
      </div>

      <div className="glass-button rounded-2xl p-6 mb-4">
        <div className="mb-4">
          <p className="text-white text-opacity-80 text-sm mb-1">
            {pilgrimageName} Cost Estimate {isUmrah ? '' : '2025'}
          </p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalCost)}</p>
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

      <div className="mb-6">
        <MobileDropdown
          label={`${pilgrimageName} Cost Estimate for how many person`}
          value={numPeople}
          options={personOptions}
          onChange={setNumPeople}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">2024 Dividend Rate</p>
          <p className={`text-2xl font-bold ${accentColor}`}>{currentYearRate}%</p>
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
              <p className={`text-sm font-bold ${accentColor}`}>{rate}%</p>
            </div>
          ))}
        </div>
      </div>

      {projection && (
        <div className={`glass-card rounded-3xl p-6 border-2 ${borderColor} border-opacity-30 liquid-shine`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className={`w-5 h-5 ${accentColor}`} />
            <h4 className="font-semibold text-white">{pilgrimageName} Affordability Projection</h4>
          </div>

          {account.current_balance >= totalCost ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-600 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xl font-bold text-green-400 mb-2">Alhamdulillah!</p>
              <p className="text-white text-opacity-90">
                You can afford {pilgrimageName} for {numPeople} {numPeople === 1 ? 'person' : 'people'} now!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-strong rounded-xl">
                <div>
                  <p className="text-sm text-white text-opacity-80 mb-1">Years to {pilgrimageName}</p>
                  <p className={`text-2xl font-bold ${accentColor}`}>
                    {projection.yearsToHajj < 30 ? `${projection.yearsToHajj} years` : '30+ years'}
                  </p>
                </div>
                <TrendingUp className={`w-8 h-8 ${accentColor}`} />
              </div>

              <div className="p-4 glass rounded-xl">
                <p className="text-sm text-white text-opacity-80 mb-1">Amount Needed</p>
                <p className="text-xl font-bold text-white">{formatCurrency(projection.shortfall)}</p>
              </div>

              {account.monthly_contribution && account.monthly_contribution > 0 && (
                <div className="p-4 glass-strong rounded-xl">
                  <p className="text-sm text-white text-opacity-90 mb-2">
                    At your current monthly contribution of <span className="font-bold text-white">{formatCurrency(account.monthly_contribution)}</span>,
                    you'll reach your {pilgrimageName} goal in approximately <span className="font-bold text-white">{projection.yearsToHajj} years</span>.
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
