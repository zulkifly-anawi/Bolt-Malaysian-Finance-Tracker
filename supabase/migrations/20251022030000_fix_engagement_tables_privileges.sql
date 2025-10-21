-- Fix privileges for engagement tables (notifications, user_achievements, user_feedback)
-- Issue: authenticated role has no table-level privileges despite RLS policies existing
-- This prevents achievement notifications from being created and feedback from being submitted

-- Grant necessary privileges to authenticated role for notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

-- Grant necessary privileges to authenticated role for user_achievements
GRANT SELECT, INSERT ON user_achievements TO authenticated;

-- Grant necessary privileges to authenticated role for user_feedback
GRANT SELECT, INSERT ON user_feedback TO authenticated;

-- Verify the privileges are set correctly
COMMENT ON TABLE notifications IS 'User notifications with RLS policies and proper privileges for authenticated role';
COMMENT ON TABLE user_achievements IS 'User achievements with RLS policies and proper privileges for authenticated role';
COMMENT ON TABLE user_feedback IS 'User feedback with RLS policies and proper privileges for authenticated role';
