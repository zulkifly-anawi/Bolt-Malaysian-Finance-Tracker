/*
  # Fix Admin Table Permissions

  This migration resolves permission denied errors on admin configuration tables:
  - dividend_history
  - achievement_definitions
  - admin_config_system_settings
  - admin_config_account_types
  - admin_config_goal_categories
  - admin_config_institutions
  - admin_config_validation_rules
  - admin_audit_log

  ## Problem
  These tables had RLS enabled with only SELECT policies.
  Admin users need INSERT, UPDATE, DELETE permissions.

  ## Solution
  Add admin-only policies for INSERT, UPDATE, DELETE operations.
  Maintain existing SELECT policies for all authenticated users where applicable.
*/

-- =====================================================
-- 1. DIVIDEND_HISTORY TABLE POLICIES
-- =====================================================

-- Admins can insert dividend history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'dividend_history'
    AND policyname = 'Admins can insert dividend history'
  ) THEN
    CREATE POLICY "Admins can insert dividend history"
      ON public.dividend_history
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can update dividend history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'dividend_history'
    AND policyname = 'Admins can update dividend history'
  ) THEN
    CREATE POLICY "Admins can update dividend history"
      ON public.dividend_history
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can delete dividend history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'dividend_history'
    AND policyname = 'Admins can delete dividend history'
  ) THEN
    CREATE POLICY "Admins can delete dividend history"
      ON public.dividend_history
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- =====================================================
-- 2. ACHIEVEMENT_DEFINITIONS TABLE POLICIES
-- =====================================================

-- Admins can insert achievement definitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'achievement_definitions'
    AND policyname = 'Admins can insert achievement definitions'
  ) THEN
    CREATE POLICY "Admins can insert achievement definitions"
      ON public.achievement_definitions
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can update achievement definitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'achievement_definitions'
    AND policyname = 'Admins can update achievement definitions'
  ) THEN
    CREATE POLICY "Admins can update achievement definitions"
      ON public.achievement_definitions
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Admins can delete achievement definitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'achievement_definitions'
    AND policyname = 'Admins can delete achievement definitions'
  ) THEN
    CREATE POLICY "Admins can delete achievement definitions"
      ON public.achievement_definitions
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- =====================================================
-- 3. ENSURE ALL ADMIN_CONFIG TABLES HAVE COMPLETE POLICIES
-- =====================================================

-- admin_config_account_types (already has policies, but let's ensure they exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_account_types'
    AND policyname = 'Anyone can read account types'
  ) THEN
    CREATE POLICY "Anyone can read account types"
      ON public.admin_config_account_types
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_account_types'
    AND policyname = 'Only admins can insert account types'
  ) THEN
    CREATE POLICY "Only admins can insert account types"
      ON public.admin_config_account_types
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_account_types'
    AND policyname = 'Only admins can update account types'
  ) THEN
    CREATE POLICY "Only admins can update account types"
      ON public.admin_config_account_types
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_account_types'
    AND policyname = 'Only admins can delete account types'
  ) THEN
    CREATE POLICY "Only admins can delete account types"
      ON public.admin_config_account_types
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- admin_config_goal_categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_goal_categories'
    AND policyname = 'Anyone can read goal categories'
  ) THEN
    CREATE POLICY "Anyone can read goal categories"
      ON public.admin_config_goal_categories
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_goal_categories'
    AND policyname = 'Only admins can insert goal categories'
  ) THEN
    CREATE POLICY "Only admins can insert goal categories"
      ON public.admin_config_goal_categories
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_goal_categories'
    AND policyname = 'Only admins can update goal categories'
  ) THEN
    CREATE POLICY "Only admins can update goal categories"
      ON public.admin_config_goal_categories
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_goal_categories'
    AND policyname = 'Only admins can delete goal categories'
  ) THEN
    CREATE POLICY "Only admins can delete goal categories"
      ON public.admin_config_goal_categories
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- admin_config_institutions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_institutions'
    AND policyname = 'Anyone can read institutions'
  ) THEN
    CREATE POLICY "Anyone can read institutions"
      ON public.admin_config_institutions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_institutions'
    AND policyname = 'Only admins can insert institutions'
  ) THEN
    CREATE POLICY "Only admins can insert institutions"
      ON public.admin_config_institutions
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_institutions'
    AND policyname = 'Only admins can update institutions'
  ) THEN
    CREATE POLICY "Only admins can update institutions"
      ON public.admin_config_institutions
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_institutions'
    AND policyname = 'Only admins can delete institutions'
  ) THEN
    CREATE POLICY "Only admins can delete institutions"
      ON public.admin_config_institutions
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- admin_config_validation_rules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_validation_rules'
    AND policyname = 'Anyone can read validation rules'
  ) THEN
    CREATE POLICY "Anyone can read validation rules"
      ON public.admin_config_validation_rules
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_validation_rules'
    AND policyname = 'Only admins can insert validation rules'
  ) THEN
    CREATE POLICY "Only admins can insert validation rules"
      ON public.admin_config_validation_rules
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_validation_rules'
    AND policyname = 'Only admins can update validation rules'
  ) THEN
    CREATE POLICY "Only admins can update validation rules"
      ON public.admin_config_validation_rules
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_validation_rules'
    AND policyname = 'Only admins can delete validation rules'
  ) THEN
    CREATE POLICY "Only admins can delete validation rules"
      ON public.admin_config_validation_rules
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- admin_config_system_settings (already has policies, but let's ensure they exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_system_settings'
    AND policyname = 'Anyone can read system settings'
  ) THEN
    CREATE POLICY "Anyone can read system settings"
      ON public.admin_config_system_settings
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_system_settings'
    AND policyname = 'Only admins can insert system settings'
  ) THEN
    CREATE POLICY "Only admins can insert system settings"
      ON public.admin_config_system_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_system_settings'
    AND policyname = 'Only admins can update system settings'
  ) THEN
    CREATE POLICY "Only admins can update system settings"
      ON public.admin_config_system_settings
      FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_config_system_settings'
    AND policyname = 'Only admins can delete system settings'
  ) THEN
    CREATE POLICY "Only admins can delete system settings"
      ON public.admin_config_system_settings
      FOR DELETE
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- =====================================================
-- 4. GRANT NECESSARY TABLE PERMISSIONS
-- =====================================================

-- Ensure authenticated role has the necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dividend_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.achievement_definitions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_config_account_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_config_goal_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_config_institutions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_config_validation_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_config_system_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_audit_log TO authenticated;

-- =====================================================
-- SUMMARY
-- =====================================================

/*
  This migration ensures:

  ✓ dividend_history has INSERT, UPDATE, DELETE policies for admins
  ✓ achievement_definitions has INSERT, UPDATE, DELETE policies for admins
  ✓ All admin_config_* tables have complete CRUD policies
  ✓ Authenticated role has necessary table-level permissions
  ✓ Regular users can still SELECT configuration data
  ✓ Only admins can modify configuration data

  The fix is idempotent and safe to run multiple times.
*/
