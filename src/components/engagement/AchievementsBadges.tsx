import { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Target, Briefcase, Heart, Compass, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { checkAchievements } from '../../utils/achievementChecker';
import { formatCurrency } from '../../utils/formatters';

const iconMap: Record<string, any> = {
  trophy: Trophy,
  award: Award,
  medal: Medal,
  target: Target,
  briefcase: Briefcase,
  heart: Heart,
  compass: Compass,
};

interface AchievementsBadgesProps {
  netWorth: number;
  accounts: any[];
  goals: any[];
}

export const AchievementsBadges = ({ netWorth, accounts, goals }: AchievementsBadgesProps) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [user, netWorth, accounts, goals]);

  const loadAchievements = async () => {
    if (!user) return;
    setLoading(true);

    const achievementChecks = await checkAchievements(user.id, netWorth, accounts, goals);
    setAchievements(achievementChecks);
    setLoading(false);
  };

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6 liquid-shine glow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Your Achievements</h2>
            <p className="text-white text-opacity-80">
              {earnedCount} of {totalCount} badges earned
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">{earnedCount}</div>
            <div className="text-sm text-white text-opacity-70">Badges</div>
          </div>
        </div>

        <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon] || Trophy;
          const progressPercentage = achievement.target
            ? Math.min((achievement.progress! / achievement.target) * 100, 100)
            : 0;

          return (
            <div
              key={achievement.type}
              className={`rounded-3xl p-6 border-2 transition-all ${
                achievement.earned
                  ? 'glass-card border-blue-400 border-opacity-40 liquid-shine glow'
                  : 'glass border-gray-400 border-opacity-20 opacity-70'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                      : 'bg-white bg-opacity-10'
                  }`}
                >
                  {achievement.earned ? (
                    <IconComponent className="w-7 h-7 text-white" />
                  ) : (
                    <Lock className="w-7 h-7 text-white text-opacity-40" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{achievement.name}</h3>
                  <p className="text-sm text-white text-opacity-70">{achievement.description}</p>
                </div>
              </div>

              {!achievement.earned && achievement.target && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white text-opacity-70">Progress</span>
                    <span className="font-semibold text-white">
                      {progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white text-opacity-60">
                    <span>
                      {achievement.type.includes('first')
                        ? formatCurrency(achievement.progress!)
                        : achievement.progress}
                    </span>
                    <span>
                      {achievement.type.includes('first')
                        ? formatCurrency(achievement.target)
                        : achievement.target}
                    </span>
                  </div>
                </div>
              )}

              {achievement.earned && (
                <div className="flex items-center gap-2 text-sm font-medium text-green-300 bg-green-600 bg-opacity-30 px-3 py-2 rounded-lg">
                  <Trophy className="w-4 h-4" />
                  <span>Earned!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-button rounded-3xl p-6 liquid-shine">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-2">Keep Going!</h3>
            <p className="text-white text-opacity-80 text-sm mb-3">
              You're doing great! Continue tracking your finances to unlock more achievements and reach your financial goals.
            </p>
            <div className="flex flex-wrap gap-2">
              {achievements.filter(a => !a.earned).slice(0, 3).map(a => (
                <span key={a.type} className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-white">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
