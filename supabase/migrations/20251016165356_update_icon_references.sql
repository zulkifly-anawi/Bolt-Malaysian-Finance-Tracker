/*
  # Update Icon References from PiggyBank to Calculator
  
  1. Changes
    - Update goal_templates table: Change 'piggy-bank' icon to 'calculator' for retirement-related templates
    - Update achievement_definitions table: Change 'piggy-bank' icon to 'calculator' for EPF/retirement achievements
  
  2. Rationale
    - Calculator icon is more appropriate for financial planning and retirement calculations
    - Better represents the computational nature of EPF retirement projections
    - Maintains consistency with UI icon updates across the application
  
  3. Security
    - No RLS policy changes required
    - Data migration only affects icon string values
    - Maintains all existing functionality
*/

-- Update goal_templates icon for retirement-related goals
UPDATE goal_templates 
SET icon = 'calculator'
WHERE icon = 'piggy-bank' AND category = 'Retirement';

-- Update achievement_definitions icon for retirement-related achievements
UPDATE achievement_definitions 
SET icon = 'calculator'
WHERE icon = 'piggy-bank' AND achievement_type = 'retirement_champion';
