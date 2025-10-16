/*
  # Make account_type_id nullable

  1. Changes to accounts table
    - Make `account_type_id` nullable since we're using `account_type` text field instead
    
  2. Notes
    - This allows the application to use the simpler text-based account_type field
    - The foreign key relationship is preserved but not required
    
  3. Security
    - Maintains existing RLS policies
*/

-- Make account_type_id nullable
ALTER TABLE accounts ALTER COLUMN account_type_id DROP NOT NULL;
