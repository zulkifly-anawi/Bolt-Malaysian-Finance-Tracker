-- Fix privileges for goal_templates and goal_categories tables
-- Issue: authenticated role has no table-level privileges despite RLS policies existing

-- Grant necessary privileges to authenticated role for goal_templates
GRANT SELECT ON goal_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON goal_templates TO authenticated;

-- Grant necessary privileges to authenticated role for goal_categories
GRANT SELECT ON goal_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON goal_categories TO authenticated;

-- Add admin override policy for template management
DO $$
BEGIN
  -- Check if the policy exists for goal_templates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'goal_templates' 
      AND policyname = 'Admins can manage all templates'
  ) THEN
    CREATE POLICY "Admins can manage all templates"
      ON goal_templates
      FOR ALL
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;

  -- Check if the policy exists for goal_categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'goal_categories' 
      AND policyname = 'Admins can manage all categories'
  ) THEN
    CREATE POLICY "Admins can manage all categories"
      ON goal_categories
      FOR ALL
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- Verify the privileges
COMMENT ON TABLE goal_templates IS 'Goal templates with RLS policies and proper privileges for authenticated role';
COMMENT ON TABLE goal_categories IS 'Goal categories with RLS policies and proper privileges for authenticated role';
