/*
  # Add Goal Progress Tracking System

  1. New Tables
    - `goal_progress_entries`
      - `id` (uuid, primary key) - Unique identifier for each progress entry
      - `goal_id` (uuid, foreign key) - Links to the goal being updated
      - `user_id` (uuid, foreign key) - User who made the update
      - `entry_type` (text) - Type of update: 'add', 'subtract', or 'set'
      - `amount` (numeric) - The amount being added, subtracted, or set
      - `previous_manual_amount` (numeric) - Manual amount before this update
      - `new_manual_amount` (numeric) - Manual amount after this update
      - `notes` (text, nullable) - Optional notes about the update
      - `created_at` (timestamptz) - When the entry was created

  2. Changes to Existing Tables
    - Add `manual_amount` column to `goals` table (default 0)
      - This stores manual contributions separate from account-linked progress
      - Total progress = account allocations + manual_amount
    - Add `last_progress_update` column to `goals` table
      - Tracks when progress was last manually updated

  3. Security
    - Enable RLS on `goal_progress_entries` table
    - Add policies for authenticated users to:
      - Insert their own progress entries
      - View their own progress entries
      - Prevent deletion of history entries (audit trail)

  4. Indexes
    - Index on goal_id for fast history retrieval
    - Index on user_id for user-specific queries
    - Composite index on (goal_id, created_at) for timeline views

  5. Important Notes
    - Progress entries are never deleted (audit trail)
    - Manual amount works additively with account allocations
    - Users can add, subtract, or set exact manual amounts
    - No validation limits on progress amounts (flexible tracking)
*/

-- Add manual_amount and last_progress_update to goals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'manual_amount'
  ) THEN
    ALTER TABLE goals ADD COLUMN manual_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'last_progress_update'
  ) THEN
    ALTER TABLE goals ADD COLUMN last_progress_update timestamptz;
  END IF;
END $$;

-- Create goal_progress_entries table
CREATE TABLE IF NOT EXISTS goal_progress_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN ('add', 'subtract', 'set')),
  amount numeric NOT NULL,
  previous_manual_amount numeric NOT NULL DEFAULT 0,
  new_manual_amount numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on goal_progress_entries
ALTER TABLE goal_progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_progress_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'goal_progress_entries'
      AND policyname = 'Users can insert own progress entries'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own progress entries" ON goal_progress_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'goal_progress_entries'
      AND policyname = 'Users can view own progress entries'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own progress entries" ON goal_progress_entries FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'goal_progress_entries'
      AND policyname = 'Users can view progress entries for their goals'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view progress entries for their goals" ON goal_progress_entries FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_progress_entries.goal_id AND goals.user_id = auth.uid()))';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_progress_entries_goal_id 
  ON goal_progress_entries(goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_progress_entries_user_id 
  ON goal_progress_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_goal_progress_entries_goal_created 
  ON goal_progress_entries(goal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goals_manual_amount 
  ON goals(manual_amount) WHERE manual_amount != 0;

-- Add comment to clarify the additive nature
COMMENT ON COLUMN goals.manual_amount IS 'Manual contributions added by user, works additively with account allocations';
COMMENT ON TABLE goal_progress_entries IS 'Audit trail of all manual progress updates to goals. Entries are never deleted.';