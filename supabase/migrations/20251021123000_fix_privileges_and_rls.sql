/*
  # Restore necessary privileges for authenticated role

  - Grants required table privileges for RLS-governed access
  - Targets key tables used by the app (goals, accounts, account_goals, user_achievements, reminders, profiles)
  - Idempotent via exception-safe DO blocks
*/

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO authenticated;

-- Helper DO block to grant ALL on a table if not already granted
DO $$
DECLARE
  r RECORD;
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'public.goals',
    'public.accounts',
    'public.account_goals',
    'public.user_achievements',
    'public.reminders',
    'public.profiles'
  ]) LOOP
    BEGIN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %s TO authenticated', tbl);
    EXCEPTION WHEN others THEN
      -- ignore if already granted or table missing; continue
      NULL;
    END;
  END LOOP;
END $$;
