export const DIVIDEND_RATES = {
  ASB: {
    2024: 5.75,
    2023: 5.25,
    2022: 4.60,
    2021: 5.00,
    2020: 5.50,
  },
  'Tabung Haji': {
    2024: 5.50,
    2023: 4.75,
    2022: 4.50,
    2021: 3.75,
    2020: 4.00,
  },
  EPF: {
    2024: 5.50,
    2023: 5.35,
    2022: 6.10,
    2021: 6.10,
    2020: 5.20,
  },
};

export const EPF_CONVENTIONAL_RATES: Record<number, number> = {
  2024: 6.30,
  2023: 5.50,
  2022: 5.35,
  2021: 6.10,
  2020: 5.20,
  2019: 5.45,
  2018: 6.15,
  2017: 6.90,
};

export const EPF_SYARIAH_RATES: Record<number, number> = {
  2024: 6.30,
  2023: 5.40,
  2022: 4.75,
  2021: 5.65,
  2020: 4.90,
  2019: 5.00,
  2018: 5.90,
  2017: 6.40,
};

export const HAJJ_COST_2025 = 45000;
export const UMRAH_COST = 15000;

export const EPF_BENCHMARKS = {
  30: 50000,
  40: 180000,
  50: 350000,
  55: 500000,
};

export const calculateAverageDividendRate = (accountType: keyof typeof DIVIDEND_RATES): number => {
  const rates = Object.values(DIVIDEND_RATES[accountType]);
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
};

export const getEPFDividendRates = (savingsType: 'Conventional' | 'Syariah'): Record<number, number> => {
  return savingsType === 'Syariah' ? EPF_SYARIAH_RATES : EPF_CONVENTIONAL_RATES;
};

export const calculateDividendRateByMethod = (
  savingsType: 'Conventional' | 'Syariah',
  method: 'latest' | '3-year-average' | '5-year-average' | 'historical-average'
): number => {
  const rates = getEPFDividendRates(savingsType);
  const years = Object.keys(rates).map(Number).sort((a, b) => b - a);
  const values = years.map(year => rates[year]);

  switch (method) {
    case 'latest':
      return values[0] || 0;
    case '3-year-average': {
      const last3 = values.slice(0, 3);
      return last3.reduce((sum, rate) => sum + rate, 0) / last3.length;
    }
    case '5-year-average': {
      const last5 = values.slice(0, 5);
      return last5.reduce((sum, rate) => sum + rate, 0) / last5.length;
    }
    case 'historical-average':
      return values.reduce((sum, rate) => sum + rate, 0) / values.length;
    default:
      return values[0] || 0;
  }
};

export const ASB_RATES_DETAILED = {
  2024: { dividend: 5.50, bonus: 0.25, total: 5.75 },
  2023: { dividend: 4.25, bonus: 1.00, total: 5.25 },
  2022: { dividend: 3.35, bonus: 1.25, total: 4.60 },
  2021: { dividend: 4.25, bonus: 0.75, total: 5.00 },
  2020: { dividend: 5.50, bonus: 0.00, total: 5.50 },
};

export const calculateASBDividendByUnits = (
  unitsHeld: number,
  dividendRatePerUnit: number
): number => {
  return (unitsHeld * dividendRatePerUnit) / 100;
};

export const calculateASBProjection = (
  currentBalance: number,
  unitsHeld: number,
  monthlyContribution: number,
  years: number
): { projectedBalance: number; totalDividends: number; totalContributions: number; yearlyBreakdown: Array<{year: number; balance: number; dividend: number}> } => {
  const currentYearRate = DIVIDEND_RATES.ASB[2024] / 100;
  let balance = currentBalance;
  let totalDividends = 0;
  let totalContributions = monthlyContribution * 12 * years;
  const yearlyBreakdown: Array<{year: number; balance: number; dividend: number}> = [];

  for (let year = 0; year < years; year++) {
    const annualContribution = monthlyContribution * 12;
    balance += annualContribution;

    const dividend = balance * currentYearRate;
    totalDividends += dividend;
    balance += dividend;

    yearlyBreakdown.push({
      year: new Date().getFullYear() + year + 1,
      balance,
      dividend,
    });
  }

  return {
    projectedBalance: balance,
    totalDividends,
    totalContributions,
    yearlyBreakdown,
  };
};

export const calculateTabungHajiProjection = (
  currentBalance: number,
  monthlyContribution: number,
  targetAmount?: number,
  pilgrimageType: 'Hajj' | 'Umrah' | null = 'Hajj'
): { yearsToHajj: number; projectedBalance: number; shortfall: number } => {
  const defaultTarget = pilgrimageType === 'Umrah' ? UMRAH_COST : HAJJ_COST_2025;
  const finalTarget = targetAmount ?? defaultTarget;

  const avgRate = calculateAverageDividendRate('Tabung Haji') / 100;
  let balance = currentBalance;
  let years = 0;
  const maxYears = 30;

  while (balance < finalTarget && years < maxYears) {
    const annualContribution = monthlyContribution * 12;
    balance += annualContribution;

    const dividend = balance * avgRate;
    balance += dividend;

    years++;
  }

  return {
    yearsToHajj: balance >= finalTarget ? years : maxYears,
    projectedBalance: balance,
    shortfall: Math.max(0, finalTarget - currentBalance),
  };
};

export const calculateEPFProjection = (
  currentBalance: number,
  currentAge: number,
  monthlySalary: number,
  retirementAge: number = 55,
  employeePercentage: number = 11,
  employerPercentage: number = 12,
  useTotal: boolean = true,
  savingsType: 'Conventional' | 'Syariah' = 'Conventional',
  rateMethod: 'latest' | '3-year-average' | '5-year-average' | 'historical-average' = 'latest'
): {
  projectedBalance: number;
  yearsToRetirement: number;
  benchmark: number;
  status: 'ahead' | 'on-track' | 'behind';
  additionalNeeded: number;
  monthlyContribution: number;
  employeeContribution: number;
  employerContribution: number;
  dividendRate: number;
} => {
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const dividendRate = calculateDividendRateByMethod(savingsType, rateMethod);
  const avgRate = dividendRate / 100;

  const employeeContribution = monthlySalary * (employeePercentage / 100);
  const employerContribution = monthlySalary * (employerPercentage / 100);
  const monthlyContribution = useTotal ? (employeeContribution + employerContribution) : employeeContribution;

  let balance = currentBalance;

  for (let year = 0; year < yearsToRetirement; year++) {
    const annualContribution = monthlyContribution * 12;
    balance += annualContribution;

    const dividend = balance * avgRate;
    balance += dividend;
  }

  const benchmark = EPF_BENCHMARKS[retirementAge as keyof typeof EPF_BENCHMARKS] || 500000;
  const currentBenchmark = getEPFBenchmarkForAge(currentAge);

  let status: 'ahead' | 'on-track' | 'behind';
  if (currentBalance >= currentBenchmark * 1.1) {
    status = 'ahead';
  } else if (currentBalance >= currentBenchmark * 0.9) {
    status = 'on-track';
  } else {
    status = 'behind';
  }

  const additionalNeeded = Math.max(0, benchmark - balance);

  return {
    projectedBalance: balance,
    yearsToRetirement,
    benchmark,
    status,
    additionalNeeded,
    monthlyContribution,
    employeeContribution,
    employerContribution,
    dividendRate,
  };
};

export const getEPFBenchmarkForAge = (age: number): number => {
  if (age <= 30) return EPF_BENCHMARKS[30];
  if (age <= 40) return EPF_BENCHMARKS[40];
  if (age <= 50) return EPF_BENCHMARKS[50];
  return EPF_BENCHMARKS[55];
};

export const calculateGoalProjection = (
  currentAmount: number,
  targetAmount: number,
  targetDate: string,
  monthlyContribution: number = 0
): {
  monthlyNeeded: number;
  projectedCompletionDate: string;
  status: 'ahead' | 'on-track' | 'behind';
  difference: number;
} => {
  const now = new Date();
  const target = new Date(targetDate);
  const monthsRemaining = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  const remaining = targetAmount - currentAmount;
  const monthlyNeeded = remaining / monthsRemaining;

  let projectedMonths = 0;
  if (monthlyContribution > 0) {
    projectedMonths = Math.ceil(remaining / monthlyContribution);
  } else {
    projectedMonths = monthsRemaining * 2;
  }

  const projectedDate = new Date(now.getTime() + projectedMonths * 30 * 24 * 60 * 60 * 1000);

  let status: 'ahead' | 'on-track' | 'behind';
  const progress = (currentAmount / targetAmount) * 100;
  const timeProgress = ((Date.now() - new Date(target.getTime() - 365 * 24 * 60 * 60 * 1000).getTime()) / (target.getTime() - new Date(target.getTime() - 365 * 24 * 60 * 60 * 1000).getTime())) * 100;

  if (progress >= timeProgress * 1.1) {
    status = 'ahead';
  } else if (progress >= timeProgress * 0.9) {
    status = 'on-track';
  } else {
    status = 'behind';
  }

  const difference = currentAmount - (targetAmount * (timeProgress / 100));

  return {
    monthlyNeeded: Math.max(0, monthlyNeeded),
    projectedCompletionDate: projectedDate.toISOString(),
    status,
    difference,
  };
};

export const recommendBestAccount = (
  accounts: Array<{ type: string; current_balance: number }>,
  goalType: string
): string => {
  const returnRates: Record<string, number> = {
    'Tabung Haji': calculateAverageDividendRate('Tabung Haji'),
    'ASB': calculateAverageDividendRate('ASB'),
    'EPF': calculateAverageDividendRate('EPF'),
    'Fixed Deposit': 3.0,
    'Savings': 2.0,
    'Stocks': 8.0,
    'Crypto': 10.0,
  };

  if (goalType === 'Hajj' || goalType === 'Umrah') {
    return 'Tabung Haji';
  }

  if (goalType === 'Retirement') {
    return 'EPF';
  }

  let bestAccount = 'ASB';
  let highestRate = 0;

  accounts.forEach(account => {
    const rate = returnRates[account.type] || 0;
    if (rate > highestRate) {
      highestRate = rate;
      bestAccount = account.type;
    }
  });

  return bestAccount;
};
