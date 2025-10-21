-- Fix sync_asb_units_held function to remove reference to non-existent asb_unit_price field
-- Issue: Function references NEW.asb_unit_price which doesn't exist in accounts table
-- This causes "record 'new' has no field 'asb_unit_price'" error when adding new accounts

-- Replace the function with the correct implementation
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to ASB account types
  IF NEW.account_type = 'ASB' THEN
    -- ASB units are valued at RM1.00 per unit (1:1 ratio)
    NEW.units_held := NEW.current_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS trigger_sync_asb_units_held ON accounts;

CREATE TRIGGER trigger_sync_asb_units_held
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_asb_units_held();

-- Add comment to document the business rule
COMMENT ON FUNCTION sync_asb_units_held() IS 'Automatically synchronizes units_held with current_balance for ASB accounts. ASB units are always valued at RM1.00 per unit.';
