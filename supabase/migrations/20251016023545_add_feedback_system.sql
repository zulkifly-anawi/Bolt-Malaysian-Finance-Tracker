/*
  # Add Feedback Collection System

  1. New Tables
    - `user_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - allows anonymous feedback)
      - `feedback_type` (text - bug, feature_request, general, other)
      - `subject` (text - short title)
      - `message` (text - detailed feedback)
      - `rating` (integer, 1-5 stars, nullable)
      - `email` (text, nullable - for follow-up)
      - `status` (text - new, reviewed, in_progress, resolved)
      - `metadata` (jsonb - browser info, page location, etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_feedback` table
    - Allow authenticated users to insert their own feedback
    - Allow anonymous users to insert feedback
    - Only allow users to read their own feedback
    - Admin access would need to be handled separately
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'general', 'other')),
  subject text NOT NULL,
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  email text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (authenticated or anonymous)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_feedback'
      AND policyname = 'Anyone can submit feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can submit feedback" ON user_feedback FOR INSERT TO public WITH CHECK (true)';
  END IF;
END $$;

-- Users can read their own feedback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_feedback'
      AND policyname = 'Users can read own feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own feedback" ON user_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
