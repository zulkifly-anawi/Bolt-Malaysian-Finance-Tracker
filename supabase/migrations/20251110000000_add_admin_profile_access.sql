-- Migration: Add admin access to view all profiles
-- Created: 2025-11-10
-- Description: Allow admin users to view all user profiles in the admin panel

-- First, drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Note: We use the existing is_admin() function which already exists and checks:
-- 1. profiles.is_admin = true OR
-- 2. email exists in admin_authorized_emails table
-- This avoids infinite recursion and provides flexible admin management

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_admin() = true
);

-- Add policy for admins to update any profile (for admin management)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_admin() = true
)
WITH CHECK (
  is_admin() = true
);
