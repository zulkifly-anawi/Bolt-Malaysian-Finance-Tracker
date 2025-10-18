/*
  # Fix Remaining Security and Performance Issues

  ## Overview
  This migration addresses security and performance issues reported by Supabase security scan.

  ## 1. Add Missing Foreign Key Indexes
  Creates indexes for foreign key columns that don't have covering indexes:
  - `accounts.account_type_id` - FK to account_types
  - `admin_audit_log.admin_user_id` - FK to profiles
  - `goal_progress_entries.user_id` - FK to profiles
  - `goals.category_id` - FK to goal_categories
  - `reminders.user_id` - FK to profiles
  - `user_feedback.user_id` - FK to profiles

  ## 2. Drop Unused Indexes
  Removes indexes that are not being used by queries:
  - Admin config table audit indexes (created_by, updated_by)
  - dividend_history.updated_by
  - family_members foreign key indexes
  - goal_templates.updated_by

  ## 3. Fix Security Definer View
  Recreates admin_audit_log_with_retention view with SECURITY INVOKER
  to prevent privilege escalation vulnerabilities.

  ## Performance Impact
  - Positive: Foreign key indexes improve JOIN and WHERE clause performance
  - Positive: Removing unused indexes reduces write overhead and maintenance
  - Neutral: View security change doesn't impact performance

  ## Security Impact
  - Prevents suboptimal query performance on foreign key lookups
  - Eliminates privilege escalation risk from SECURITY DEFINER view
  - Maintains all existing RLS policies and security controls
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for accounts.account_type_id
CREATE INDEX IF NOT EXISTS idx_accounts_account_type_id 
  ON accounts(account_type_id);

-- Index for admin_audit_log.admin_user_id
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id 
  ON admin_audit_log(admin_user_id);

-- Index for goal_progress_entries.user_id
CREATE INDEX IF NOT EXISTS idx_goal_progress_entries_user_id 
  ON goal_progress_entries(user_id);

-- Index for goals.category_id
CREATE INDEX IF NOT EXISTS idx_goals_category_id 
  ON goals(category_id);

-- Index for reminders.user_id
CREATE INDEX IF NOT EXISTS idx_reminders_user_id 
  ON reminders(user_id);

-- Index for user_feedback.user_id
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id 
  ON user_feedback(user_id);

-- =====================================================
-- 2. DROP UNUSED INDEXES
-- =====================================================

-- Drop unused admin config audit indexes
DROP INDEX IF EXISTS idx_admin_config_account_types_created_by;
DROP INDEX IF EXISTS idx_admin_config_account_types_updated_by;
DROP INDEX IF EXISTS idx_admin_config_goal_categories_created_by;
DROP INDEX IF EXISTS idx_admin_config_goal_categories_updated_by;
DROP INDEX IF EXISTS idx_admin_config_institutions_created_by;
DROP INDEX IF EXISTS idx_admin_config_institutions_updated_by;
DROP INDEX IF EXISTS idx_admin_config_system_settings_created_by;
DROP INDEX IF EXISTS idx_admin_config_system_settings_updated_by;
DROP INDEX IF EXISTS idx_admin_config_validation_rules_created_by;
DROP INDEX IF EXISTS idx_admin_config_validation_rules_updated_by;

-- Drop other unused indexes
DROP INDEX IF EXISTS idx_dividend_history_updated_by;
DROP INDEX IF EXISTS idx_family_members_member_user_id;
DROP INDEX IF EXISTS idx_family_members_primary_user_id;
DROP INDEX IF EXISTS idx_goal_templates_updated_by;

-- =====================================================
-- 3. FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS admin_audit_log_with_retention;

-- Recreate as SECURITY INVOKER (default, more secure)
CREATE OR REPLACE VIEW admin_audit_log_with_retention AS
SELECT 
  id,
  admin_user_id,
  admin_email,
  action_type,
  table_name,
  record_id,
  old_value,
  new_value,
  ip_address,
  user_agent,
  timestamp,
  timestamp + INTERVAL '7 years' AS retention_date,
  CASE 
    WHEN (timestamp + INTERVAL '7 years' - INTERVAL '30 days') < NOW() 
    THEN true 
    ELSE false 
  END AS approaching_retention
FROM admin_audit_log;

-- Add RLS policy for the view (inherits from base table)
ALTER VIEW admin_audit_log_with_retention SET (security_invoker = on);

-- Add comment explaining the view purpose
COMMENT ON VIEW admin_audit_log_with_retention IS 
'Audit log view with retention tracking. Uses SECURITY INVOKER to prevent privilege escalation. Only accessible to admin users via RLS policies on the base table.';
