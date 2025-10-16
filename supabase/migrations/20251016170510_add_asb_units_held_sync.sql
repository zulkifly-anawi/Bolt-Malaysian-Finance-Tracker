/*
  # ASB Units Held Synchronization

  1. Business Rule Implementation
    - For ASB accounts, units_held must always equal current_balance
    - ASB units are valued at RM1.00 per unit (1:1 ratio)
    - This is a mandatory business rule for ASB account type
  
  2. Database Changes
    - Add trigger to automatically sync units_held with current_balance for ASB accounts
    - Update existing ASB accounts to fix any mismatched units_held values
  
  3. Data Migration
    - One-time update to synchronize all existing ASB account records
    - Ensures historical data compliance with business rule
*/

-- Update existing ASB accounts to sync units_held with current_balance
UPDATE accounts 
SET units_held = current_balance 
WHERE account_type = 'ASB' 
  AND (units_held IS NULL OR units_held != current_balance);

-- Create function to automatically sync units_held for ASB accounts
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to ASB account types
  IF NEW.account_type = 'ASB' THEN
    NEW.units_held := NEW.current_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update
DROP TRIGGER IF EXISTS trigger_sync_asb_units_held ON accounts;

CREATE TRIGGER trigger_sync_asb_units_held
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_asb_units_held();

-- Add comment to document the business rule
COMMENT ON FUNCTION sync_asb_units_held() IS 'Automatically synchronizes units_held with current_balance for ASB accounts. ASB units are always valued at RM1.00 per unit.';