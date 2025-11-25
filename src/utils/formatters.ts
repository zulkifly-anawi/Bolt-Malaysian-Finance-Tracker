// Memoization cache for formatCurrency
const currencyCache = new Map<number, string>();

export const formatCurrency = (amount: number): string => {
  // Round to 2 decimal places for cache key
  const roundedAmount = Math.round(amount * 100) / 100;
  
  const cached = currencyCache.get(roundedAmount);
  if (cached) return cached;
  
  const formatted = new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('MYR', 'RM');
  
  // Keep cache size reasonable
  if (currencyCache.size > 1000) {
    currencyCache.clear();
  }
  
  currencyCache.set(roundedAmount, formatted);
  return formatted;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateInput = (date: string): string => {
  return new Date(date).toISOString().split('T')[0];
};

export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const calculateMonthsRemaining = (targetDate: string): number => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return Math.max(diffMonths, 0);
};

export const isGoalOnTrack = (current: number, target: number, targetDate: string): boolean => {
  const monthsRemaining = calculateMonthsRemaining(targetDate);
  if (monthsRemaining === 0) return current >= target;
  
  // Prevent division by zero - if target is 0, goal can't be on track
  if (target === 0) return false;

  const progress = (current / target) * 100;
  const now = new Date();
  const target_date = new Date(targetDate);
  const startDate = new Date(target_date.getTime() - (365 * 24 * 60 * 60 * 1000));

  const totalMonths = Math.max((target_date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30), 1);
  const elapsedMonths = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  const expectedProgress = (elapsedMonths / totalMonths) * 100;

  return progress >= expectedProgress * 0.9;
};
