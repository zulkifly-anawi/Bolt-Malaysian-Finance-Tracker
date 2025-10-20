/*
  # Set admin flag for a specific user

  - Ensures the user with email 'zulkifly.anawi@gmail.com' is marked as admin
  - Creates a profiles row if missing (linked to auth.users.id)
  - Idempotent: safe to run multiple times
*/

DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Find the user by email (case-insensitive)
  SELECT u.id, u.email
    INTO v_user_id, v_user_email
  FROM auth.users u
  WHERE LOWER(u.email) = 'zulkifly.anawi@gmail.com'
  ORDER BY u.created_at DESC
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Admin user email not found in auth.users, skipping admin flag update.';
    RETURN;
  END IF;

  -- Ensure a profile exists for this auth user
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = v_user_id
  ) THEN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES (v_user_id, COALESCE(v_user_email, 'zulkifly.anawi@gmail.com'), NULL, true);
  ELSE
    -- Keep email in sync if needed
    UPDATE public.profiles
    SET email = COALESCE(v_user_email, email)
    WHERE id = v_user_id;
  END IF;

  -- Set the admin flag
  UPDATE public.profiles
  SET is_admin = true
  WHERE id = v_user_id;
END $$;
