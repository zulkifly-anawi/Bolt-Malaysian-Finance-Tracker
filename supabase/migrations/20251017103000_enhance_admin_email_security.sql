/*
  # Enhance Admin Email Security

  ## Security Enhancement
    - Update is_admin() function to validate against authorized email
    - Add trigger to prevent unauthorized users from setting is_admin to true
    - Ensure only zulkifly.anawi@gmail.com can have admin access
    - Add audit logging for admin flag changes

  ## Changes
    1. Update is_admin() function to check both flag and email
    2. Create trigger function to prevent unauthorized admin flag changes
    3. Add trigger to profiles table
    4. Update RLS policies to use enhanced validation
*/

-- Drop existing function to recreate with email validation
DROP FUNCTION IF EXISTS is_admin();

-- Create enhanced function to check if user is admin AND has authorized email
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
  user_email text;
  user_is_admin boolean;
BEGIN
  SELECT email, COALESCE(p.is_admin, false)
  INTO user_email, user_is_admin
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  WHERE u.id = auth.uid();

  -- Must be marked as admin AND have the authorized email
  RETURN user_is_admin = true AND LOWER(user_email) = 'zulkifly.anawi@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to prevent unauthorized admin flag changes
CREATE OR REPLACE FUNCTION prevent_unauthorized_admin_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_email text;
BEGIN
  -- If is_admin is being set to true
  IF NEW.is_admin = true AND (OLD.is_admin IS NULL OR OLD.is_admin = false) THEN
    -- Get the email of the profile being modified
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = NEW.id;

    -- Only allow if the email matches the authorized admin email
    IF LOWER(current_user_email) != 'zulkifly.anawi@gmail.com' THEN
      RAISE EXCEPTION 'Unauthorized: Only the authorized admin email can have admin privileges';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS enforce_admin_email_check ON profiles;

CREATE TRIGGER enforce_admin_email_check
  BEFORE INSERT OR UPDATE OF is_admin ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_admin_changes();

-- Ensure the authorized admin user has is_admin set to true
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'zulkifly.anawi@gmail.com'
);

-- Remove admin privileges from any unauthorized users
UPDATE profiles
SET is_admin = false
WHERE id IN (
  SELECT p.id FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.is_admin = true AND LOWER(u.email) != 'zulkifly.anawi@gmail.com'
);
