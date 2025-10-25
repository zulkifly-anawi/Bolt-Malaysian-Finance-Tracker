# Achievement System

## Overview
Gamification system with badges, milestones, and achievements to encourage financial goal completion and app engagement.

## Requirements

### Requirement: Achievement Definitions
The system SHALL provide predefined achievements for financial milestones and app usage.

#### Scenario: Financial achievements
- **WHEN** system checks user achievements
- **THEN** following financial badges are available:
  - "First Steps" - Create first account
  - "Goal Setter" - Create first goal
  - "Goal Crusher" - Complete 5 goals
  - "Financial Wizard" - Complete 10 goals
  - "Savings Champion" - Reach RM 10,000 in total savings
  - "Investment Pro" - Reach RM 100,000 in investments
  - "ASB Investor" - Create ASB account
  - "EPF Tracker" - Add EPF account
  - "Hajj Planner" - Create Hajj goal

#### Scenario: Engagement achievements
- **WHEN** system tracks user engagement
- **THEN** following engagement badges are available:
  - "Consistent Tracker" - Update accounts 7 days in a row
  - "Monthly Planner" - Use app 30 days
  - "Calculator User" - Use investment calculator 5 times
  - "Data Expert" - Export data to CSV

### Requirement: Achievement Unlocking
The system SHALL automatically detect when users earn achievements and unlock them.

#### Scenario: Check achievement eligibility
- **WHEN** user performs triggering action (create goal, complete goal, update account)
- **THEN** system runs achievementChecker utility
- **AND** queries user's current state (accounts count, goals count, balance totals)
- **AND** compares against achievement criteria
- **AND** identifies newly earned achievements

#### Scenario: Unlock achievement
- **WHEN** user meets achievement criteria for first time
- **THEN** system creates user_achievements record
- **AND** sets unlocked_at timestamp
- **AND** creates notification for achievement
- **AND** displays achievement modal/toast
- **AND** prevents duplicate unlocks (check if already exists)

#### Scenario: Goal completion triggers
- **WHEN** user marks goal as achieved
- **THEN** system checks "Goal Crusher" achievement (5 goals)
- **AND** checks "Financial Wizard" achievement (10 goals)
- **AND** unlocks if criteria met
- **AND** displays congratulations message

### Requirement: Achievement Display
The system SHALL show users their earned and locked achievements.

#### Scenario: View achievements page
- **WHEN** user navigates to achievements section
- **THEN** system displays all achievement badges
- **AND** shows unlocked badges in color with unlock date
- **AND** shows locked badges in grayscale with criteria
- **AND** displays progress toward locked achievements
- **AND** sorts by category (financial, engagement, special)

#### Scenario: Achievement progress
- **WHEN** viewing locked achievement
- **THEN** system shows current progress
- **AND** shows required criteria (e.g., "Complete 3/5 goals")
- **AND** provides visual progress bar
- **AND** updates in real-time as user progresses

#### Scenario: Achievement details
- **WHEN** user clicks on achievement badge
- **THEN** system displays modal with:
  - Achievement name and icon
  - Full description
  - Unlock criteria
  - Unlock date (if earned)
  - Current progress (if locked)
  - Tips for unlocking (if locked)

### Requirement: Notification Integration
The system SHALL notify users when they earn achievements.

#### Scenario: Achievement notification
- **WHEN** user unlocks new achievement
- **THEN** system creates notification record
- **AND** sets notification_type = 'achievement'
- **AND** includes achievement details in message
- **AND** displays toast notification immediately
- **AND** adds to notifications list for later viewing

#### Scenario: Notification display
- **WHEN** user views notifications
- **THEN** achievement notifications appear with badge icon
- **AND** show achievement name
- **AND** show unlock timestamp
- **AND** allow dismissal/mark as read

### Requirement: Achievement Statistics
The system SHALL track user's overall achievement progress and statistics.

#### Scenario: Calculate achievement stats
- **WHEN** displaying achievement overview
- **THEN** system calculates:
  - Total achievements earned
  - Total achievements available
  - Completion percentage
  - Most recent achievement
  - Rarest achievement (fewest users earned)

#### Scenario: Achievement leaderboard (future)
- **WHEN** viewing achievement statistics
- **THEN** system can show:
  - User rank by achievements earned
  - Percentage of users with each achievement
  - Achievement rarity scores

### Requirement: Achievement Checker Logic
The system SHALL use centralized logic to check and award achievements.

#### Scenario: Run achievement check
- **WHEN** triggering action occurs
- **THEN** system calls checkAchievements(userId)
- **AND** fetches fresh user data:
  - Total accounts
  - Account types
  - Total goals
  - Completed goals
  - Total account balances
  - Calculator usage count
  - Login streak
- **AND** evaluates each achievement criteria
- **AND** awards all newly earned achievements
- **AND** returns list of newly unlocked achievements

#### Scenario: Handle check errors
- **WHEN** achievement check encounters error
- **THEN** system logs error to console
- **AND** continues normal flow (non-blocking)
- **AND** ensures user action still completes
- **AND** optionally retries check after delay

### Requirement: Achievement Persistence
The system SHALL permanently record earned achievements in database.

#### Scenario: Store earned achievement
- **WHEN** user unlocks achievement
- **THEN** system inserts to user_achievements table
- **AND** records user_id, achievement_id, unlocked_at
- **AND** enforces unique constraint (user + achievement)
- **AND** prevents duplicate records

#### Scenario: Query user achievements
- **WHEN** displaying achievements page
- **THEN** system queries user_achievements table
- **AND** joins with achievements table for details
- **AND** filters by user_id
- **AND** orders by unlocked_at DESC

## Technical Details

### Database Schema
```sql
achievements table:
  - id: uuid (primary key)
  - name: text (unique)
  - description: text
  - icon: text
  - category: text ('financial', 'engagement', 'special')
  - criteria_type: text ('account_count', 'goal_count', 'balance_total', etc.)
  - criteria_value: numeric
  - sort_order: integer
  - created_at: timestamp

user_achievements table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users)
  - achievement_id: uuid (foreign key to achievements)
  - unlocked_at: timestamp
  - created_at: timestamp
  - UNIQUE constraint on (user_id, achievement_id)

Seeded achievements:
  1. First Steps (account_count >= 1)
  2. Goal Setter (goal_count >= 1)
  3. Goal Crusher (completed_goals >= 5)
  4. Financial Wizard (completed_goals >= 10)
  5. Savings Champion (total_balance >= 10000)
  6. Investment Pro (total_balance >= 100000)
  7. ASB Investor (has ASB account)
  8. EPF Tracker (has EPF account)
  9. Hajj Planner (has Hajj goal)
  10. Consistent Tracker (login_streak >= 7)
```

### RLS Policies
- Users can view all achievements (public list)
- Users can only view their own user_achievements
- System can create user_achievements for any user
- Users cannot manually create achievements
- Admins can manage achievements and user_achievements

### Implementation Files
- `src/utils/achievementChecker.ts` - Core checking logic
- `src/components/engagement/AchievementBadge.tsx` - Badge component
- `src/components/engagement/AchievementsPage.tsx` - Full achievements view
- `src/components/engagement/AchievementModal.tsx` - Detail modal
- `src/components/engagement/AchievementNotification.tsx` - Toast notification
- `supabase/migrations/20251015165754_add_engagement_features.sql` - Tables and seeds

### Achievement Checker Example
```typescript
// src/utils/achievementChecker.ts
export async function checkAchievements(userId: string): Promise<UnlockedAchievement[]> {
  // 1. Fetch user's current state
  const userData = await fetchUserData(userId);
  
  // 2. Get all achievements not yet earned
  const unearnedAchievements = await getUnearnedAchievements(userId);
  
  // 3. Check each achievement
  const newlyEarned: UnlockedAchievement[] = [];
  for (const achievement of unearnedAchievements) {
    if (checkCriteria(achievement, userData)) {
      await unlockAchievement(userId, achievement.id);
      await createNotification(userId, achievement);
      newlyEarned.push(achievement);
    }
  }
  
  return newlyEarned;
}

function checkCriteria(achievement: Achievement, userData: UserData): boolean {
  switch (achievement.criteria_type) {
    case 'account_count':
      return userData.accountCount >= achievement.criteria_value;
    case 'goal_count':
      return userData.goalCount >= achievement.criteria_value;
    case 'completed_goals':
      return userData.completedGoals >= achievement.criteria_value;
    case 'total_balance':
      return userData.totalBalance >= achievement.criteria_value;
    case 'account_type':
      return userData.accountTypes.includes(achievement.criteria_value);
    // ... more criteria types
    default:
      return false;
  }
}
```

### Trigger Points
Achievement checks should run after:
1. Creating a new account
2. Creating a new goal
3. Completing a goal
4. Updating account balance (if crosses threshold)
5. Using investment calculator
6. Exporting data
7. Daily login (for streak tracking)
