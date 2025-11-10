-- Migration: Add admin access to accounts and goals tables
-- Description: Allows admins to view all accounts and goals for user management
-- Date: 2025-11-10
-- Note: Uses existing is_admin() function which checks both profiles.is_admin 
--       and admin_authorized_emails table

-- Add policy for admins to view all accounts
CREATE POLICY "Admins can view all accounts"
ON accounts
FOR SELECT
TO authenticated
USING (is_admin());

-- Add policy for admins to view all goals
CREATE POLICY "Admins can view all goals"
ON goals
FOR SELECT
TO authenticated
USING (is_admin());

-- Add policy for admins to view all account_goals
CREATE POLICY "Admins can view all account_goals"
ON account_goals
FOR SELECT
TO authenticated
USING (is_admin());

-- Add policy for admins to view all balance_entries (for future use)
CREATE POLICY "Admins can view all balance_entries"
ON balance_entries
FOR SELECT
TO authenticated
USING (is_admin());
