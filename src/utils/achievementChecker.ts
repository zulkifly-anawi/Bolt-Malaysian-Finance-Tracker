import { supabase } from '../lib/supabase';

interface AchievementCheck {
  type: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

export const checkAchievements = async (
  userId: string,
  netWorth: number,
  accounts: any[],
  goals: any[]
): Promise<AchievementCheck[]> => {
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_type')
    .eq('user_id', userId);

  const earned = new Set(earnedAchievements?.map(a => a.achievement_type) || []);

  const achievements: AchievementCheck[] = [
    {
      type: 'first_10k',
      name: 'First RM10,000',
      description: 'Reach RM10,000 in total net worth',
      icon: 'trophy',
      earned: earned.has('first_10k') || netWorth >= 10000,
      progress: netWorth,
      target: 10000,
    },
    {
      type: 'first_50k',
      name: 'Half Century',
      description: 'Reach RM50,000 in total net worth',
      icon: 'award',
      earned: earned.has('first_50k') || netWorth >= 50000,
      progress: netWorth,
      target: 50000,
    },
    {
      type: 'first_100k',
      name: 'Six Figures',
      description: 'Reach RM100,000 in total net worth',
      icon: 'medal',
      earned: earned.has('first_100k') || netWorth >= 100000,
      progress: netWorth,
      target: 100000,
    },
    {
      type: 'goal_crusher',
      name: 'Goal Crusher',
      description: 'Achieve your first financial goal',
      icon: 'target',
      earned: earned.has('goal_crusher') || goals.some(g => g.is_achieved),
      progress: goals.filter(g => g.is_achieved).length,
      target: 1,
    },
    {
      type: 'diversified_investor',
      name: 'Diversified Investor',
      description: 'Have 3 or more different account types',
      icon: 'briefcase',
      earned: earned.has('diversified_investor') || new Set(accounts.map(a => a.account_type)).size >= 3,
      progress: new Set(accounts.map(a => a.account_type)).size,
      target: 3,
    },
    {
      type: 'family_planner',
      name: 'Family Planner',
      description: 'Create 5 or more financial goals',
      icon: 'heart',
      earned: earned.has('family_planner') || goals.length >= 5,
      progress: goals.length,
      target: 5,
    },
    {
      type: 'hajj_ready',
      name: 'Hajj Ready',
      description: 'Save enough for Hajj pilgrimage',
      icon: 'compass',
      earned: earned.has('hajj_ready') || netWorth >= 45000,
      progress: netWorth,
      target: 45000,
    },
  ];

  for (const achievement of achievements) {
    if (achievement.earned && !earned.has(achievement.type)) {
      console.log('Awarding new achievement:', achievement.type, achievement.name);
      await awardAchievement(userId, achievement);
    }
  }

  return achievements;
};

export const awardAchievement = async (
  userId: string,
  achievement: { type: string; name: string; description: string; icon: string }
) => {
  // Use upsert with ignoreDuplicates to prevent duplicate achievement errors
  // This handles race conditions and multiple concurrent checks gracefully
  const { error: achievementError } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_type: achievement.type,
      achievement_name: achievement.name,
      achievement_description: achievement.description,
      icon: achievement.icon,
    }, {
      onConflict: 'user_id,achievement_type',
      ignoreDuplicates: true, // Skip if already exists (no error thrown)
    });

  if (achievementError) {
    console.error('Failed to insert achievement:', achievementError);
    return;
  }

  const { error: notificationError } = await supabase.from('notifications').insert({
    user_id: userId,
    notification_type: 'achievement',
    title: `New Achievement Unlocked!`,
    message: `Congratulations! You've earned the "${achievement.name}" badge.`,
    metadata: { achievement_type: achievement.type },
  });

  if (notificationError) {
    console.error('Failed to insert notification:', notificationError);
  }
};

export const getConsecutiveMonths = async (userId: string): Promise<number> => {
  const { data } = await supabase
    .from('balance_entries')
    .select('entry_date')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .limit(12);

  if (!data || data.length === 0) return 0;

  let consecutive = 1;
  const dates = data.map(d => new Date(d.entry_date));

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i].getFullYear(), dates[i].getMonth());
    const next = new Date(dates[i + 1].getFullYear(), dates[i + 1].getMonth());
    const diffMonths = (current.getFullYear() - next.getFullYear()) * 12 + (current.getMonth() - next.getMonth());

    if (diffMonths === 1) {
      consecutive++;
    } else {
      break;
    }
  }

  return consecutive;
};
