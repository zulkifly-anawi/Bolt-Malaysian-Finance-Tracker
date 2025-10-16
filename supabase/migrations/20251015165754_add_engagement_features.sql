/*
  # Add Engagement & Retention Features

  1. New table: user_achievements
    - Track badges and milestones earned by users
    - Includes achievement type, date earned, and metadata

  2. New table: reminders
    - Store user reminders for balance updates, goal milestones, etc.
    - Track reminder type, frequency, and last sent date

  3. New table: notifications
    - Store notifications for users
    - Track read/unread status

  4. Updates to profiles table
    - Add preferences for notifications and reminders
    - Add last_balance_update date to track activity

  5. New table: monthly_summaries
    - Store monthly summary data for insights
    - Track net worth changes, best performing accounts, etc.

  6. New table: family_members (for future premium feature)
    - Link family members to main account
    - Set permissions (view/edit)
*/

-- Add notification preferences to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notifications_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notifications_enabled boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_reminders_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_reminders_enabled boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_balance_update'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_balance_update timestamptz;
  END IF;
END $$;

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  icon text,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL,
  title text NOT NULL,
  message text,
  frequency text DEFAULT 'monthly',
  next_reminder_date timestamptz NOT NULL,
  last_sent_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create monthly summaries table
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  net_worth_start numeric DEFAULT 0,
  net_worth_end numeric DEFAULT 0,
  net_worth_change numeric DEFAULT 0,
  best_performing_account text,
  total_contributions numeric DEFAULT 0,
  total_dividends numeric DEFAULT 0,
  goals_on_track integer DEFAULT 0,
  goals_behind integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month)
);

ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries"
  ON monthly_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON monthly_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create family members table (for future premium feature)
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email text,
  member_name text NOT NULL,
  relationship text,
  permission_level text DEFAULT 'view',
  is_active boolean DEFAULT true,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own family members"
  ON family_members FOR ALL
  TO authenticated
  USING (auth.uid() = primary_user_id OR auth.uid() = member_user_id)
  WITH CHECK (auth.uid() = primary_user_id);

-- Insert achievement definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_type text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria jsonb NOT NULL,
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievement definitions"
  ON achievement_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Insert achievement definitions
INSERT INTO achievement_definitions (achievement_type, name, description, icon, criteria, points) VALUES
  ('first_10k', 'First RM10,000', 'Reached RM10,000 in total net worth', 'trophy', '{"net_worth": 10000}', 10),
  ('first_50k', 'Half Century', 'Reached RM50,000 in total net worth', 'award', '{"net_worth": 50000}', 25),
  ('first_100k', 'Six Figures', 'Reached RM100,000 in total net worth', 'medal', '{"net_worth": 100000}', 50),
  ('consistent_saver', 'Consistent Saver', 'Updated balances for 6 months in a row', 'calendar', '{"consecutive_months": 6}', 30),
  ('goal_crusher', 'Goal Crusher', 'Achieved your first financial goal', 'target', '{"goals_achieved": 1}', 40),
  ('diversified_investor', 'Diversified Investor', 'Have 3 or more different account types', 'briefcase', '{"account_types": 3}', 20),
  ('early_bird', 'Early Bird', 'Completed a goal ahead of schedule', 'zap', '{"early_completion": true}', 35),
  ('hajj_ready', 'Hajj Ready', 'Saved enough for Hajj pilgrimage', 'compass', '{"hajj_fund": 45000}', 100),
  ('retirement_champion', 'Retirement Champion', 'Reached EPF benchmark for your age', 'piggy-bank', '{"epf_benchmark": true}', 50),
  ('family_planner', 'Family Planner', 'Created 5 or more financial goals', 'heart', '{"goals_created": 5}', 15)
ON CONFLICT (achievement_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reminders_user_active ON reminders(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_period ON monthly_summaries(user_id, year, month);
