-- Quick check to see if the current user is admin
SELECT 
  auth.uid() as current_user_id,
  p.email,
  p.is_admin,
  is_current_user_admin() as admin_check_result
FROM profiles p
WHERE p.id = auth.uid();

-- List all profiles with admin status
SELECT 
  id,
  email,
  is_admin,
  onboarding_completed,
  created_at
FROM profiles
ORDER BY created_at DESC;
