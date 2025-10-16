import { Target, TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, calculateMonthsRemaining } from '../../utils/formatters';
import { calculateGoalProjection, recommendBestAccount } from '../../utils/investmentCalculators';
import type { Goal, Account } from '../../types/database';

interface GoalProjectionProps {
  goal: Goal;
  accounts: Account[];
  monthlyContribution?: number;
}

export const GoalProjection = ({ goal, accounts, monthlyContribution = 0 }: GoalProjectionProps) => {
  const projection = calculateGoalProjection(
    goal.current_amount,
    goal.target_amount,
    goal.target_date,
    monthlyContribution
  );

  const bestAccount = recommendBestAccount(accounts as any, goal.category || 'Other');
  const monthsRemaining = calculateMonthsRemaining(goal.target_date);
  const remaining = goal.target_amount - goal.current_amount;

  const statusColors = {
    ahead: { badge: 'bg-green-600', text: 'text-green-400' },
    'on-track': { badge: 'bg-blue-600', text: 'text-blue-400' },
    behind: { badge: 'bg-orange-600', text: 'text-orange-400' },
  };

  const colors = statusColors[projection.status];

  return (
    <div className="glass-card rounded-3xl p-6 liquid-shine glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${colors.badge} rounded-xl p-3 shadow-lg`}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{goal.name}</h3>
            <p className="text-sm text-white text-opacity-70">{goal.category}</p>
          </div>
        </div>
        <div className={`px-3 py-1 ${colors.badge} text-white text-sm font-semibold rounded-full shadow-lg`}>
          {projection.status === 'ahead' ? 'Ahead' : projection.status === 'on-track' ? 'On Track' : 'Behind'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-4 h-4 ${colors.text}`} />
            <p className="text-sm font-medium text-white text-opacity-80">Target Amount</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(goal.target_amount)}</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-4 h-4 ${colors.text}`} />
            <p className="text-sm font-medium text-white text-opacity-80">Target Date</p>
          </div>
          <p className="text-xl font-bold text-white">{formatDate(goal.target_date)}</p>
          <p className="text-sm text-white text-opacity-70">{monthsRemaining} months remaining</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Current Progress</p>
          <p className="text-xl font-bold text-white">{formatCurrency(goal.current_amount)}</p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
            <div
              className={`${colors.badge} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-white text-opacity-80 mb-2">Remaining Amount</p>
          <p className="text-xl font-bold text-white">{formatCurrency(remaining)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className={`w-5 h-5 ${colors.text} mt-1`} />
            <div className="flex-1">
              <p className="font-semibold text-white mb-1">Monthly Savings Needed</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {formatCurrency(projection.monthlyNeeded)}
              </p>
              <p className="text-sm text-white text-opacity-70 mt-1">
                Save this amount monthly to reach your goal by {formatDate(goal.target_date)}
              </p>
            </div>
          </div>
        </div>

        {monthlyContribution > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className={`w-5 h-5 ${colors.text} mt-1`} />
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">Projected Completion</p>
                <p className="text-lg font-bold text-white">
                  {formatDate(projection.projectedCompletionDate)}
                </p>
                <p className="text-sm text-white text-opacity-70 mt-1">
                  At your current rate of {formatCurrency(monthlyContribution)}/month
                </p>
              </div>
            </div>
          </div>
        )}

        {projection.status === 'ahead' && (
          <div className="glass rounded-2xl p-4 border-2 border-green-400 border-opacity-30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Great Progress!</p>
                <p className="text-sm text-white text-opacity-80">
                  You're ahead by {formatCurrency(Math.abs(projection.difference))}. Keep up the excellent work!
                </p>
              </div>
            </div>
          </div>
        )}

        {projection.status === 'behind' && (
          <div className="glass rounded-2xl p-4 border-2 border-orange-400 border-opacity-30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-1" />
              <div>
                <p className="font-semibold text-white mb-1">Action Needed</p>
                <p className="text-sm text-white text-opacity-80">
                  You're behind by {formatCurrency(Math.abs(projection.difference))}. Consider increasing your monthly contributions to stay on track.
                </p>
              </div>
            </div>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="glass-button rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Recommendation</p>
                <p className="text-sm text-white text-opacity-90">
                  Best account for this goal: <span className="font-bold text-white">{bestAccount}</span>
                </p>
                <p className="text-xs text-white text-opacity-70 mt-1">
                  This account type typically offers the best returns for {(goal.category || 'Other').toLowerCase()} goals.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
