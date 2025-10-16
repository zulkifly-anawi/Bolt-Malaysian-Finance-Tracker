import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';

interface InsightsTipsProps {
  netWorth: number;
  accounts: any[];
  goals: any[];
}

export const InsightsTips = ({ netWorth, accounts, goals }: InsightsTipsProps) => {
  const { user } = useAuth();
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    generateInsights();
    loadMonthlySummary();
  }, [netWorth, accounts, goals]);

  const loadMonthlySummary = async () => {
    if (!user) return;

    const now = new Date();
    const { data } = await supabase
      .from('monthly_summaries')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', now.getFullYear())
      .eq('month', now.getMonth() + 1)
      .maybeSingle();

    if (data) {
      setMonthlySummary(data);
    }
  };

  const generateInsights = () => {
    const newInsights: any[] = [];

    const goalsOnTrack = goals.filter(g => !g.is_achieved && g.current_amount >= g.target_amount * 0.5);
    const goalsBehind = goals.filter(g => !g.is_achieved && g.current_amount < g.target_amount * 0.3);

    if (netWorth >= 100000) {
      newInsights.push({
        type: 'success',
        icon: 'check',
        title: 'Excellent Progress!',
        message: `You've reached ${formatCurrency(netWorth)} in net worth. You're in the top tier of savers!`,
      });
    } else if (netWorth >= 50000) {
      newInsights.push({
        type: 'success',
        icon: 'trending-up',
        title: 'Great Momentum!',
        message: `You're halfway to six figures with ${formatCurrency(netWorth)} in net worth. Keep it up!`,
      });
    }

    if (accounts.length === 0) {
      newInsights.push({
        type: 'warning',
        icon: 'alert',
        title: 'Add Your First Account',
        message: 'Start tracking your finances by adding your first investment account (ASB, EPF, or Tabung Haji).',
      });
    }

    const accountTypes = new Set(accounts.map(a => a.account_type));
    if (accountTypes.size === 1) {
      newInsights.push({
        type: 'tip',
        icon: 'lightbulb',
        title: 'Diversify Your Investments',
        message: 'Consider spreading your investments across different account types (ASB, EPF, Tabung Haji) to reduce risk.',
      });
    }

    if (goals.length === 0) {
      newInsights.push({
        type: 'tip',
        icon: 'target',
        title: 'Set Financial Goals',
        message: 'Start by creating your first financial goal. Popular goals include Emergency Fund, House Downpayment, and Hajj Fund.',
      });
    }

    if (goalsOnTrack.length > 0) {
      newInsights.push({
        type: 'success',
        icon: 'check',
        title: `${goalsOnTrack.length} Goal${goalsOnTrack.length > 1 ? 's' : ''} On Track`,
        message: `You're making excellent progress on ${goalsOnTrack.map(g => g.name).join(', ')}. Keep going!`,
      });
    }

    if (goalsBehind.length > 0) {
      newInsights.push({
        type: 'warning',
        icon: 'alert',
        title: 'Goals Need Attention',
        message: `Consider increasing contributions to: ${goalsBehind.map(g => g.name).join(', ')}`,
      });
    }

    const hasASB = accounts.some(a => a.account_type === 'ASB');
    if (!hasASB && netWorth > 20000) {
      newInsights.push({
        type: 'tip',
        icon: 'lightbulb',
        title: 'Consider ASB Investment',
        message: 'ASB typically offers competitive dividend rates (4-5% annually). Consider opening an account if eligible.',
      });
    }

    const hasTabungHaji = accounts.some(a => a.account_type === 'Tabung Haji');
    const hasHajjGoal = goals.some(g => g.category === 'Hajj' && !g.is_achieved);
    if (hasHajjGoal && !hasTabungHaji) {
      newInsights.push({
        type: 'tip',
        icon: 'lightbulb',
        title: 'Tabung Haji for Hajj Goal',
        message: 'Consider opening a Tabung Haji account specifically for your Hajj savings. It offers Shariah-compliant returns.',
      });
    }

    const monthNow = new Date().getMonth();
    if (monthNow === 2) {
      newInsights.push({
        type: 'info',
        icon: 'trending-up',
        title: 'Dividend Season',
        message: 'March is typically when ASB dividends are announced. Keep an eye out for updates!',
      });
    }

    if (newInsights.length === 0) {
      newInsights.push({
        type: 'success',
        icon: 'check',
        title: 'All Good!',
        message: 'Your finances look healthy. Keep tracking regularly to maintain your progress.',
      });
    }

    setInsights(newInsights);
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'check':
        return CheckCircle;
      case 'trending-up':
        return TrendingUp;
      case 'trending-down':
        return TrendingDown;
      case 'alert':
        return AlertTriangle;
      case 'target':
        return Target;
      case 'lightbulb':
        return Lightbulb;
      default:
        return Lightbulb;
    }
  };

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-green-600',
          border: 'border-green-400 border-opacity-30',
        };
      case 'warning':
        return {
          iconBg: 'bg-orange-600',
          border: 'border-orange-400 border-opacity-30',
        };
      case 'tip':
        return {
          iconBg: 'bg-blue-600',
          border: 'border-blue-400 border-opacity-30',
        };
      default:
        return {
          iconBg: 'bg-gray-600',
          border: 'border-gray-400 border-opacity-30',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Insights & Tips</h2>
          <p className="text-sm text-white text-opacity-80">Personalized recommendations for your financial journey</p>
        </div>
      </div>

      {monthlySummary && (
        <div className="glass-button rounded-3xl p-6 liquid-shine glow">
          <h3 className="text-lg font-bold text-white mb-4">This Month's Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-white text-opacity-70 text-sm mb-1">Net Worth Change</p>
              <div className="flex items-center gap-2">
                {monthlySummary.net_worth_change >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <p className={`text-xl font-bold ${monthlySummary.net_worth_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(monthlySummary.net_worth_change))}
                </p>
              </div>
            </div>
            <div>
              <p className="text-white text-opacity-70 text-sm mb-1">Total Contributions</p>
              <p className="text-xl font-bold text-white">{formatCurrency(monthlySummary.total_contributions)}</p>
            </div>
            <div>
              <p className="text-white text-opacity-70 text-sm mb-1">Goals Status</p>
              <p className="text-xl font-bold text-white">
                {monthlySummary.goals_on_track} on track, {monthlySummary.goals_behind} behind
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const IconComponent = getIconComponent(insight.icon);
          const styles = getInsightStyles(insight.type);

          return (
            <div
              key={index}
              className={`glass-card border-2 ${styles.border} rounded-3xl p-6 liquid-shine transition-all hover:glow`}
            >
              <div className="flex items-start gap-4">
                <div className={`${styles.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-2">{insight.title}</h3>
                  <p className="text-white text-opacity-80 text-sm">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-strong rounded-3xl p-6 liquid-shine">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">Malaysian Financial Tips</h3>
            <ul className="space-y-2 text-sm text-white text-opacity-80">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>EPF Benchmark: Aim for RM50k by 30, RM180k by 40, RM350k by 50</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>Emergency Fund: Save 6 months of expenses for financial security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>House Downpayment: Typically 10% of property price plus stamp duty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span>Diversification: Split investments between ASB, EPF, and other instruments</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
