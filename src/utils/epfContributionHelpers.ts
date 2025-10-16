import { supabase } from '../lib/supabase';

export interface EPFContributionSettings {
  employeePercentage: number;
  employerPercentage: number;
  useTotal: boolean;
  isManual: boolean;
  manualAmount?: number;
  source: 'account' | 'profile' | 'default';
}

export interface EPFContributionBreakdown {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  usedContribution: number;
  settings: EPFContributionSettings;
}

const DEFAULT_EMPLOYEE_PERCENTAGE = 11;
const DEFAULT_EMPLOYER_PERCENTAGE = 12;

export const getEPFContributionSettings = async (
  userId: string,
  accountId?: string
): Promise<EPFContributionSettings> => {
  let settings: EPFContributionSettings = {
    employeePercentage: DEFAULT_EMPLOYEE_PERCENTAGE,
    employerPercentage: DEFAULT_EMPLOYER_PERCENTAGE,
    useTotal: true,
    isManual: false,
    source: 'default',
  };

  const { data: profile } = await supabase
    .from('profiles')
    .select('epf_employee_contribution_percentage, epf_employer_contribution_percentage, include_employer_contribution')
    .eq('id', userId)
    .maybeSingle();

  if (profile) {
    settings = {
      employeePercentage: profile.epf_employee_contribution_percentage || DEFAULT_EMPLOYEE_PERCENTAGE,
      employerPercentage: profile.epf_employer_contribution_percentage || DEFAULT_EMPLOYER_PERCENTAGE,
      useTotal: profile.include_employer_contribution ?? true,
      isManual: false,
      source: 'profile',
    };
  }

  if (accountId) {
    const { data: account } = await supabase
      .from('accounts')
      .select('employee_contribution_percentage, employer_contribution_percentage, use_total_contribution, is_manual_contribution, monthly_contribution')
      .eq('id', accountId)
      .eq('user_id', userId)
      .maybeSingle();

    if (account) {
      if (account.is_manual_contribution && account.monthly_contribution) {
        settings = {
          ...settings,
          isManual: true,
          manualAmount: account.monthly_contribution,
          source: 'account',
        };
      } else if (account.employee_contribution_percentage !== null || account.employer_contribution_percentage !== null) {
        settings = {
          employeePercentage: account.employee_contribution_percentage ?? settings.employeePercentage,
          employerPercentage: account.employer_contribution_percentage ?? settings.employerPercentage,
          useTotal: account.use_total_contribution ?? settings.useTotal,
          isManual: false,
          source: 'account',
        };
      }
    }
  }

  return settings;
};

export const calculateEPFContribution = (
  monthlySalary: number,
  settings: EPFContributionSettings
): EPFContributionBreakdown => {
  if (settings.isManual && settings.manualAmount) {
    return {
      employeeContribution: settings.manualAmount,
      employerContribution: 0,
      totalContribution: settings.manualAmount,
      usedContribution: settings.manualAmount,
      settings,
    };
  }

  const employeeContribution = monthlySalary * (settings.employeePercentage / 100);
  const employerContribution = monthlySalary * (settings.employerPercentage / 100);
  const totalContribution = employeeContribution + employerContribution;

  return {
    employeeContribution,
    employerContribution,
    totalContribution,
    usedContribution: settings.useTotal ? totalContribution : employeeContribution,
    settings,
  };
};

export const validateContributionPercentages = (
  employeePercentage: number,
  employerPercentage: number
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  if (employeePercentage < 0 || employeePercentage > 20) {
    return { isValid: false, warnings: ['Employee contribution percentage must be between 0% and 20%'] };
  }

  if (employerPercentage < 0 || employerPercentage > 20) {
    return { isValid: false, warnings: ['Employer contribution percentage must be between 0% and 20%'] };
  }

  if (employeePercentage < 9 || employeePercentage > 13) {
    warnings.push(`Employee contribution of ${employeePercentage}% is outside the typical KWSP range (9-11%)`);
  }

  if (employerPercentage < 11 || employerPercentage > 13) {
    warnings.push(`Employer contribution of ${employerPercentage}% is outside the typical KWSP range (12-13%)`);
  }

  if (employeePercentage === 11 && employerPercentage === 12) {
    warnings.push('Using KWSP standard rates');
  }

  return { isValid: true, warnings };
};

export const getContributionRatePresets = () => [
  {
    name: 'KWSP Standard',
    description: 'Standard Malaysian EPF rates',
    employeePercentage: 11,
    employerPercentage: 12,
  },
  {
    name: 'Maximum Employer',
    description: 'Standard employee + maximum employer rate',
    employeePercentage: 11,
    employerPercentage: 13,
  },
  {
    name: 'Employee Only',
    description: 'Conservative estimate with employee contribution only',
    employeePercentage: 11,
    employerPercentage: 0,
  },
  {
    name: 'Age 60+ (Reduced)',
    description: 'Reduced rates for employees aged 60 and above',
    employeePercentage: 4,
    employerPercentage: 4,
  },
];

export const getContributionExplanation = (settings: EPFContributionSettings): string => {
  if (settings.isManual) {
    return 'Using manual contribution amount';
  }

  const totalPercentage = settings.employeePercentage + settings.employerPercentage;

  if (settings.useTotal) {
    return `Using total contribution (${settings.employeePercentage}% employee + ${settings.employerPercentage}% employer = ${totalPercentage}%)`;
  } else {
    return `Using employee contribution only (${settings.employeePercentage}%)`;
  }
};
