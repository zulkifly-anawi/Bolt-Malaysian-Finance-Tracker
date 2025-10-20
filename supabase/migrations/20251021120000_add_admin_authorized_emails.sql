/*
  # Admin authorized emails list + function update

  - Adds table public.admin_authorized_emails to allow multiple admin emails
  - Updates public.is_admin() to return true if:
      a) profiles.is_admin is true for current user, OR
      b) current user's email is listed in admin_authorized_emails (case-insensitive)
  - Seeds initial authorized email: 'zulkifly.anawi@gmail.com'
  - Adds strict RLS: only admins can SELECT/INSERT/UPDATE/DELETE
  - Idempotent and safe to re-run
*/

-- 1) Create table if not exists
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
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'admin_authorized_emails_email_lower_key'
  ) THEN
    CREATE UNIQUE INDEX admin_authorized_emails_email_lower_key
      ON public.admin_authorized_emails (lower(email));
  END IF;
END $$;

-- 2) Maintain updated_at on changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_admin_authorized_emails'
  ) THEN
    CREATE TRIGGER set_timestamp_admin_authorized_emails
      BEFORE UPDATE ON public.admin_authorized_emails
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) Enable RLS and add policies (admins only)
ALTER TABLE public.admin_authorized_emails ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_authorized_emails' AND policyname = 'Admins can select admin emails'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can select admin emails" ON public.admin_authorized_emails FOR SELECT TO authenticated USING (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_authorized_emails' AND policyname = 'Admins can insert admin emails'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can insert admin emails" ON public.admin_authorized_emails FOR INSERT TO authenticated WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_authorized_emails' AND policyname = 'Admins can update admin emails'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update admin emails" ON public.admin_authorized_emails FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_authorized_emails' AND policyname = 'Admins can delete admin emails'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete admin emails" ON public.admin_authorized_emails FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END $$;

-- 4) Update is_admin() to consult this list in addition to profiles.is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current user's email
  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_uid;

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

-- 5) Seed initial authorized admin email (idempotent)
INSERT INTO public.admin_authorized_emails (email)
SELECT 'zulkifly.anawi@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_authorized_emails WHERE lower(email) = lower('zulkifly.anawi@gmail.com')
);
