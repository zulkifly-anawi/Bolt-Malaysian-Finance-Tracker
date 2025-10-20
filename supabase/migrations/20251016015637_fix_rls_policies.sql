/*
  # Fix RLS Policies - Split FOR ALL into Separate Operations

  1. Security Improvements
    - Replace `FOR ALL` policies with separate SELECT, INSERT, UPDATE, DELETE policies
    - Improves auditability and follows security best practices
    - Makes permission model more explicit and maintainable
    
  2. Tables Updated
    - `reminders` - Split into 4 separate policies
    - `family_members` - Split into 4 separate policies
    
  3. Notes
    - All policies maintain the same permission logic
    - Uses DROP POLICY IF EXISTS to safely replace existing policies
    - Maintains backward compatibility with existing functionality
*/

-- Drop existing broad policies for reminders
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;

-- Create separate policies for reminders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reminders'
      AND policyname = 'Users can view own reminders'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own reminders" ON reminders FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reminders'
      AND policyname = 'Users can insert own reminders'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own reminders" ON reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reminders'
      AND policyname = 'Users can update own reminders'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own reminders" ON reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reminders'
      AND policyname = 'Users can delete own reminders'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own reminders" ON reminders FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Drop existing broad policies for family_members
DROP POLICY IF EXISTS "Users can manage own family members" ON family_members;

-- Create separate policies for family_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'family_members'
      AND policyname = 'Users can view own family members'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own family members" ON family_members FOR SELECT TO authenticated USING (auth.uid() = primary_user_id OR auth.uid() = member_user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'family_members'
      AND policyname = 'Primary user can add family members'
  ) THEN
    EXECUTE 'CREATE POLICY "Primary user can add family members" ON family_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = primary_user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'family_members'
      AND policyname = 'Primary user can update family members'
  ) THEN
    EXECUTE 'CREATE POLICY "Primary user can update family members" ON family_members FOR UPDATE TO authenticated USING (auth.uid() = primary_user_id) WITH CHECK (auth.uid() = primary_user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'family_members'
      AND policyname = 'Primary user can delete family members'
  ) THEN
    EXECUTE 'CREATE POLICY "Primary user can delete family members" ON family_members FOR DELETE TO authenticated USING (auth.uid() = primary_user_id)';
  END IF;
END $$;
