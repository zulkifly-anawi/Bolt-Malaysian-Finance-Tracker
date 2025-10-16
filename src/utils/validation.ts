export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateAmount = (amount: number, fieldName: string = 'Amount'): ValidationResult => {
  const errors: string[] = [];

  if (isNaN(amount)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (amount < 0) {
      errors.push(`${fieldName} cannot be negative`);
    }
    if (amount > 1000000000) {
      errors.push(`${fieldName} cannot exceed RM1 billion`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePercentage = (percentage: number, fieldName: string = 'Percentage'): ValidationResult => {
  const errors: string[] = [];

  if (isNaN(percentage)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (percentage < 0) {
      errors.push(`${fieldName} cannot be negative`);
    }
    if (percentage > 100) {
      errors.push(`${fieldName} cannot exceed 100%`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBalance = (balance: number): ValidationResult => {
  return validateAmount(balance, 'Balance');
};

export const validateTargetAmount = (amount: number): ValidationResult => {
  const result = validateAmount(amount, 'Target amount');

  if (result.isValid && amount === 0) {
    result.errors.push('Target amount must be greater than zero');
    result.isValid = false;
  }

  return result;
};

export const validateDate = (dateString: string, fieldName: string = 'Date'): ValidationResult => {
  const errors: string[] = [];

  if (!dateString) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} is not a valid date`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTargetDate = (dateString: string): ValidationResult => {
  const result = validateDate(dateString, 'Target date');

  if (result.isValid) {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      result.errors.push('Target date cannot be in the past');
      result.isValid = false;
    }
  }

  return result;
};

export const validateAccountData = (data: {
  name: string;
  account_type: string;
  current_balance: number;
  units_held?: number;
  monthly_contribution?: number;
  dividend_rate?: number;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Account name is required');
  }

  if (!data.account_type || data.account_type.trim().length === 0) {
    errors.push('Account type is required');
  }

  const balanceValidation = validateBalance(data.current_balance);
  if (!balanceValidation.isValid) {
    errors.push(...balanceValidation.errors);
  }

  if (data.units_held !== undefined) {
    const unitsValidation = validateAmount(data.units_held, 'Units held');
    if (!unitsValidation.isValid) {
      errors.push(...unitsValidation.errors);
    }
  }

  if (data.monthly_contribution !== undefined) {
    const contributionValidation = validateAmount(data.monthly_contribution, 'Monthly contribution');
    if (!contributionValidation.isValid) {
      errors.push(...contributionValidation.errors);
    }
  }

  if (data.dividend_rate !== undefined) {
    const rateValidation = validatePercentage(data.dividend_rate, 'Dividend rate');
    if (!rateValidation.isValid) {
      errors.push(...rateValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateGoalData = (data: {
  name: string;
  target_amount: number;
  target_date: string;
  current_amount?: number;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Goal name is required');
  }

  const targetAmountValidation = validateTargetAmount(data.target_amount);
  if (!targetAmountValidation.isValid) {
    errors.push(...targetAmountValidation.errors);
  }

  const targetDateValidation = validateTargetDate(data.target_date);
  if (!targetDateValidation.isValid) {
    errors.push(...targetDateValidation.errors);
  }

  if (data.current_amount !== undefined) {
    const currentAmountValidation = validateAmount(data.current_amount, 'Current amount');
    if (!currentAmountValidation.isValid) {
      errors.push(...currentAmountValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
