-- Migration: Add admin access to view all profiles
-- Created: 2025-11-10
-- Description: Allow admin users to view all user profiles in the admin panel

-- First, drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create a function to check if current user is admin (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Add policy for admins to view all profiles (using function to avoid recursion)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_current_user_admin() = true
);

-- Add policy for admins to update any profile (for admin management)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  is_current_user_admin() = true
)
WITH CHECK (
  is_current_user_admin() = true
);
