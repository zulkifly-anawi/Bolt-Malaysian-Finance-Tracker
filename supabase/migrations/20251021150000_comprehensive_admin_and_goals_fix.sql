/*
  # Comprehensive Admin and Goals Access Fix

  This migration resolves admin authentication and goals table access issues:

  1. Recreates is_admin() function with correct implementation
     - Checks profiles.is_admin column
     - Checks admin_authorized_emails table
     - Uses SECURITY DEFINER with proper search_path

  2. Ensures admin override policy exists on goals table
     - Allows admins to view, insert, update, delete all goals

  3. Grants necessary privileges to authenticated role
     - SELECT, INSERT, UPDATE, DELETE on goals table
     - SELECT on admin_authorized_emails table
     - USAGE on auth schema

  4. Ensures admin_authorized_emails table has the correct structure
*/

-- =====================================================
-- 1. RECREATE is_admin() FUNCTION WITH CORRECT IMPLEMENTATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth', 'pg_temp'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
BEGIN
  -- Return false if no user is authenticated
  IF v_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current user's email from auth.users
  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_uid;

  -- Check if user is admin via profiles.is_admin OR admin_authorized_emails
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = v_uid AND p.is_admin = TRUE
    )
    OR (
      v_email IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admin_authorized_emails e
        WHERE lower(e.email) = lower(v_email)
      )
    )
  );
END;
$$;

-- Grant execute permission on is_admin() to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =====================================================
-- 2. ENSURE ADMIN_AUTHORIZED_EMAILS TABLE EXISTS
-- =====================================================

-- Create table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS public.admin_authorized_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure unique, case-insensitive email constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname = 'admin_authorized_emails_email_lower_key'
  ) THEN
    CREATE UNIQUE INDEX admin_authorized_emails_email_lower_key
      ON public.admin_authorized_emails (lower(email));
  END IF;
END $$;

-- Enable RLS on admin_authorized_emails
ALTER TABLE public.admin_authorized_emails ENABLE ROW LEVEL SECURITY;

-- Ensure admin_authorized_emails has proper RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_authorized_emails'
    AND policyname = 'Admins can select admin emails'
  ) THEN
    CREATE POLICY "Admins can select admin emails"
      ON public.admin_authorized_emails
      FOR SELECT
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- Seed initial authorized admin email (idempotent)
INSERT INTO public.admin_authorized_emails (email)
SELECT 'zulkifly.anawi@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_authorized_emails
  WHERE lower(email) = lower('zulkifly.anawi@gmail.com')
);

-- =====================================================
-- 3. GRANT NECESSARY PRIVILEGES TO AUTHENTICATED ROLE
-- =====================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant privileges on goals table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.goals TO authenticated;

-- Grant select on admin_authorized_emails (needed for is_admin function)
GRANT SELECT ON TABLE public.admin_authorized_emails TO authenticated;

-- Grant select on profiles (needed for is_admin function)
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Grant select on auth.users (needed for is_admin function via SECURITY DEFINER)
-- Note: This is safe because is_admin() is SECURITY DEFINER and only returns boolean

-- =====================================================
-- 4. ENSURE ADMIN OVERRIDE POLICY EXISTS ON GOALS TABLE
-- =====================================================

-- Drop existing policy if it exists and recreate to ensure it's correct
DROP POLICY IF EXISTS "Admins can manage all goals" ON public.goals;

-- Create admin override policy for goals table
CREATE POLICY "Admins can manage all goals"
  ON public.goals
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 5. VERIFY GOALS TABLE HAS RLS ENABLED
-- =====================================================

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. ENSURE USER-OWNED GOALS POLICIES EXIST
-- =====================================================

-- These policies allow regular users to manage their own goals
-- Combined with the admin override policy, admins can manage all goals

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'goals'
    AND policyname = 'Users can view own goals'
  ) THEN
    CREATE POLICY "Users can view own goals"
      ON public.goals
      FOR SELECT
      TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'goals'
    AND policyname = 'Users can insert own goals'
  ) THEN
    CREATE POLICY "Users can insert own goals"
      ON public.goals
      FOR INSERT
      TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'goals'
    AND policyname = 'Users can update own goals'
  ) THEN
    CREATE POLICY "Users can update own goals"
      ON public.goals
      FOR UPDATE
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'goals'
    AND policyname = 'Users can delete own goals'
  ) THEN
    CREATE POLICY "Users can delete own goals"
      ON public.goals
      FOR DELETE
      TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- =====================================================
-- 7. ENSURE PROFILES.IS_ADMIN COLUMN EXISTS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Set is_admin for the authorized email in profiles (if profile exists)
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'zulkifly.anawi@gmail.com'
);

-- =====================================================
-- SUMMARY
-- =====================================================

/*
  This migration ensures:

  ✓ is_admin() function correctly checks both profiles.is_admin and admin_authorized_emails
  ✓ Admin override policy exists on goals table (admins can manage all goals)
  ✓ Regular users can still manage their own goals
  ✓ Authenticated role has necessary privileges on goals table
  ✓ Admin button will work correctly by calling is_admin() RPC
  ✓ zulkifly.anawi@gmail.com is set as admin in both locations

  The fix is idempotent and safe to run multiple times.
*/
