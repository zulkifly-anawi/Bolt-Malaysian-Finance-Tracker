/*
  # Add Pilgrimage Goal Type to Accounts Table

  1. Changes
    - Add `pilgrimage_goal_type` column to accounts table
      - Nullable text field to store 'Hajj' or 'Umrah' goal type
      - Only used for Tabung Haji accounts
      - Defaults to 'Hajj' for backward compatibility
    
  2. Security
    - No RLS changes needed (inherits existing policies)
  
  3. Notes
    - Existing Tabung Haji accounts will have NULL initially
    - The application will treat NULL as 'Hajj' for backward compatibility
    - Check constraint ensures only valid values ('Hajj' or 'Umrah')
*/

-- Add pilgrimage_goal_type column to accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'pilgrimage_goal_type'
  ) THEN
    ALTER TABLE accounts ADD COLUMN pilgrimage_goal_type text;
    
    -- Add check constraint to ensure only valid values
    ALTER TABLE accounts ADD CONSTRAINT pilgrimage_goal_type_check 
      CHECK (pilgrimage_goal_type IS NULL OR pilgrimage_goal_type IN ('Hajj', 'Umrah'));
    
    -- Add comment for documentation
    COMMENT ON COLUMN accounts.pilgrimage_goal_type IS 'Pilgrimage goal type for Tabung Haji accounts: Hajj or Umrah';
  END IF;
END $$;