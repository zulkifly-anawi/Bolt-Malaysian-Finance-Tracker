-- Migration: Enforce ASB unit price = RM 1.00
-- Purpose: Fix ASB unit price validation bug (Malaysian standard)
-- Related to: fix-critical-bugs-2025-01 (Critical Bug #4: ASB Unit Price Validation)

-- Note: The base schema has a sync_asb_units_held() function that references asb_unit_price
-- and asb_units_held columns, but these were never added. We add them now.

-- Step 1: Add missing columns for ASB-specific fields
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS asb_unit_price NUMERIC(10, 2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS asb_units_held NUMERIC(15, 2);

-- Step 2: Backfill ASB accounts with correct values
UPDATE accounts
SET 
  asb_unit_price = 1.00,
  asb_units_held = current_balance / 1.00
WHERE account_type = 'ASB';

-- Step 3: Add check constraint to enforce ASB unit price = 1.00
ALTER TABLE accounts
  ADD CONSTRAINT asb_unit_price_must_be_one
  CHECK (
    account_type != 'ASB' OR 
    asb_unit_price = 1.00
  );

-- Step 4: Update the sync function to properly enforce this
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for ASB accounts
  IF NEW.account_type = 'ASB' THEN
    -- Enforce unit price is always 1.00 for ASB
    NEW.asb_unit_price := 1.00;
    -- Sync units: at RM 1.00 per unit, units = balance
    NEW.asb_units_held := NEW.current_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Ensure trigger exists (should already exist from base schema)
DROP TRIGGER IF EXISTS trigger_sync_asb_units_held ON accounts;
CREATE TRIGGER trigger_sync_asb_units_held
  BEFORE INSERT OR UPDATE OF current_balance, account_type ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_asb_units_held();

-- Step 3: Update the sync function to enforce ASB rules
CREATE OR REPLACE FUNCTION sync_asb_units_held()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to ASB accounts
  IF NEW.account_type = 'ASB' THEN
    -- ASB unit price is ALWAYS RM 1.00 (Malaysian standard)
    NEW.asb_unit_price := 1.00;
    
    -- Units held equals balance (1:1 ratio)
    NEW.asb_units_held := NEW.current_balance;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp';

-- Step 4: Ensure trigger is attached
DROP TRIGGER IF EXISTS sync_asb_units_trigger ON accounts;
CREATE TRIGGER sync_asb_units_trigger
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_asb_units_held();

-- Step 5: Add comment for documentation
COMMENT ON CONSTRAINT asb_unit_price_must_be_one ON accounts IS
  'Enforces Malaysian ASB standard: unit price is always RM 1.00 per unit';

COMMENT ON FUNCTION sync_asb_units_held() IS
  'Automatically enforces ASB unit price = RM 1.00 and syncs units_held with current_balance';

-- Step 6: Verify all ASB accounts are compliant
DO $$
DECLARE
  non_compliant_count INTEGER;
  total_asb_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_asb_count 
  FROM accounts 
  WHERE account_type = 'ASB';
  
  SELECT COUNT(*) INTO non_compliant_count 
  FROM accounts 
  WHERE account_type = 'ASB' 
    AND (asb_unit_price IS NULL OR asb_unit_price != 1.00);
  
  RAISE NOTICE 'ASB accounts migration completed:';
  RAISE NOTICE '  Total ASB accounts: %', total_asb_count;
  RAISE NOTICE '  Compliant (price = 1.00): %', total_asb_count - non_compliant_count;
  RAISE NOTICE '  Non-compliant: %', non_compliant_count;
  
  IF non_compliant_count > 0 THEN
    RAISE WARNING 'Found % non-compliant ASB accounts after migration!', non_compliant_count;
  END IF;
END $$;

-- Rollback script (commented out):
-- ALTER TABLE accounts DROP CONSTRAINT IF EXISTS asb_unit_price_must_be_one;
-- -- Restore original function if needed
