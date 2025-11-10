-- Set your user as admin
-- Replace 'your-email@example.com' with your actual email

UPDATE profiles
SET is_admin = true
WHERE email = 'zulkifly.anawi@gmail.com';  -- Change this to your email

-- Verify the update
SELECT id, email, is_admin, created_at
FROM profiles
WHERE is_admin = true;
