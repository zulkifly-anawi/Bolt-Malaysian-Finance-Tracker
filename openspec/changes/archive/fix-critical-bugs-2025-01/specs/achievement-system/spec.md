# Achievement System - Delta Spec

This delta documents changes to the Achievement System to fix critical bug: Achievement Duplicate Awards.

## MODIFIED Requirements

### Requirement: Achievement Unlocking
The system SHALL automatically detect when users earn achievements and unlock them with duplicate prevention.

#### Scenario: Check achievement eligibility
- **WHEN** user performs triggering action (create goal, complete goal, update account)
- **THEN** system runs achievementChecker utility
- **AND** queries user's current state (accounts count, goals count, balance totals)
- **AND** compares against achievement criteria
- **AND** identifies newly earned achievements
- **AND** handles concurrent checks gracefully

#### Scenario: Unlock achievement (idempotent)
- **WHEN** user meets achievement criteria for first time
- **THEN** system attempts to create user_achievements record
- **AND** uses ON CONFLICT DO NOTHING for duplicate prevention
- **AND** sets unlocked_at timestamp
- **AND** returns boolean indicating if unlock was successful (true if new, false if duplicate)

#### Scenario: Create notification only on successful unlock
- **WHEN** achievement insert succeeds (not a duplicate)
- **THEN** system creates notification for achievement
- **AND** displays achievement modal/toast
- **WHEN** achievement insert fails (duplicate)
- **THEN** system silently ignores (no notification, no error)
- **AND** logs debug message for tracking

#### Scenario: Handle concurrent unlock attempts
- **WHEN** two concurrent processes try to unlock same achievement
- **THEN** database UNIQUE constraint allows only one insert
- **AND** first request succeeds and creates notification
- **AND** second request gets conflict, returns false
- **AND** no error thrown, no duplicate notification
- **AND** user sees achievement popup exactly once

## ADDED Requirements

### Requirement: Achievement Award Idempotency
The system SHALL ensure achievements can only be awarded once per user regardless of concurrent attempts.

#### Scenario: Database-level duplicate prevention
- **WHEN** inserting user_achievement record
- **THEN** database enforces UNIQUE constraint on (user_id, achievement_id)
- **AND** rejects duplicate inserts automatically
- **AND** returns conflict error code

#### Scenario: Application-level duplicate handling
- **WHEN** achievement insert returns conflict
- **THEN** application detects it's a duplicate
- **AND** returns success=false indicator
- **AND** skips notification creation
- **AND** logs: "Achievement already earned, skipping notification"

#### Scenario: Retry-safe achievement checks
- **WHEN** achievement check is retried due to error
- **THEN** system re-evaluates user state
- **AND** attempts insert again if criteria still met
- **AND** idempotently handles duplicate (no double award)

## Technical Details

### Database Constraint Verification
```sql
-- Ensure UNIQUE constraint exists (should already be present)
ALTER TABLE user_achievements 
  ADD CONSTRAINT IF NOT EXISTS user_achievements_user_achievement_unique 
  UNIQUE (user_id, achievement_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_lookup 
  ON user_achievements(user_id, achievement_id);
```

### Updated Achievement Checker Logic
```typescript
// src/utils/achievementChecker.ts

interface AchievementAwardResult {
  success: boolean;
  achievement: AchievementCheck;
  alreadyEarned: boolean;
}

export const awardAchievement = async (
  userId: string,
  achievement: { type: string; name: string; description: string; icon: string }
): Promise<AchievementAwardResult> => {
  
  // Attempt to insert with ON CONFLICT handling
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_type: achievement.type,
      achievement_name: achievement.name,
      achievement_description: achievement.description,
      icon: achievement.icon,
      unlocked_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Check if insert succeeded
  if (data) {
    // Success - this is a new achievement
    console.log('✅ Achievement awarded:', achievement.name, 'to user:', userId);
    
    // Create notification only on successful insert
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        notification_type: 'achievement',
        title: 'New Achievement Unlocked!',
        message: `Congratulations! You've earned the "${achievement.name}" badge.`,
        metadata: { achievement_type: achievement.type },
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    return { success: true, achievement, alreadyEarned: false };
  }

  // Check if error is due to duplicate (UNIQUE constraint violation)
  if (error?.code === '23505' || error?.message?.includes('duplicate')) {
    // Already earned - this is expected in concurrent scenarios
    console.debug('ℹ️ Achievement already earned:', achievement.name, 'by user:', userId);
    return { success: false, achievement, alreadyEarned: true };
  }

  // Unexpected error
  console.error('❌ Failed to award achievement:', error);
  return { success: false, achievement, alreadyEarned: false };
};

export const checkAchievements = async (
  userId: string,
  netWorth: number,
  accounts: any[],
  goals: any[]
): Promise<AchievementCheck[]> => {
  
  // Fetch already-earned achievements
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_type')
    .eq('user_id', userId);

  const earned = new Set(earnedAchievements?.map(a => a.achievement_type) || []);

  const achievements: AchievementCheck[] = [
    {
      type: 'first_10k',
      name: 'First RM10,000',
      description: 'Reach RM10,000 in total net worth',
      icon: 'trophy',
      earned: earned.has('first_10k') || netWorth >= 10000,
      progress: netWorth,
      target: 10000,
    },
    // ... other achievements
  ];

  // Award new achievements with concurrent safety
  const awardResults: AchievementAwardResult[] = [];
  
  for (const achievement of achievements) {
    // Only try to award if criteria met and not already in earned set
    if (achievement.earned && !earned.has(achievement.type)) {
      const result = await awardAchievement(userId, achievement);
      awardResults.push(result);
    }
  }

  // Return updated achievement list
  return achievements;
};
```

### Error Code Handling
```typescript
// Supabase error codes to handle
const DUPLICATE_KEY_ERROR = '23505'; // PostgreSQL unique violation
const DUPLICATE_KEY_ERROR_MESSAGE = 'duplicate key value violates unique constraint';

function isDuplicateError(error: any): boolean {
  return (
    error?.code === DUPLICATE_KEY_ERROR ||
    error?.message?.toLowerCase().includes('duplicate') ||
    error?.message?.toLowerCase().includes('unique constraint')
  );
}
```

### Unit Test Examples
```typescript
// __tests__/achievementChecker.test.ts

describe('Achievement Duplicate Prevention', () => {
  it('should award achievement on first unlock', async () => {
    const result = await awardAchievement(userId, achievement);
    
    expect(result.success).toBe(true);
    expect(result.alreadyEarned).toBe(false);
    
    // Verify notification created
    const notifications = await getNotifications(userId);
    expect(notifications).toHaveLength(1);
  });

  it('should not create duplicate on second unlock attempt', async () => {
    // Award first time
    await awardAchievement(userId, achievement);
    
    // Try to award again
    const result = await awardAchievement(userId, achievement);
    
    expect(result.success).toBe(false);
    expect(result.alreadyEarned).toBe(true);
    
    // Verify only one notification exists
    const notifications = await getNotifications(userId);
    expect(notifications).toHaveLength(1);
  });

  it('should handle concurrent award attempts', async () => {
    // Simulate concurrent requests
    const results = await Promise.all([
      awardAchievement(userId, achievement),
      awardAchievement(userId, achievement),
      awardAchievement(userId, achievement),
    ]);

    // Exactly one should succeed
    const successes = results.filter(r => r.success);
    expect(successes).toHaveLength(1);

    // Exactly one notification should exist
    const notifications = await getNotifications(userId);
    expect(notifications).toHaveLength(1);

    // Database should have exactly one record
    const { count } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('achievement_type', achievement.type);
    
    expect(count).toBe(1);
  });

  it('should log appropriate messages', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const consoleDebugSpy = jest.spyOn(console, 'debug');

    // First award
    await awardAchievement(userId, achievement);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Achievement awarded')
    );

    // Second award (duplicate)
    await awardAchievement(userId, achievement);
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining('Achievement already earned')
    );
  });
});
```

### Migration Script
```sql
-- Migration: YYYYMMDD_fix_achievement_duplicates.sql

-- Ensure UNIQUE constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_achievements_user_achievement_unique'
  ) THEN
    ALTER TABLE user_achievements 
      ADD CONSTRAINT user_achievements_user_achievement_unique 
      UNIQUE (user_id, achievement_id);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_lookup 
  ON user_achievements(user_id, achievement_id);

-- Clean up any existing duplicates (should be none due to constraint)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, achievement_id 
      ORDER BY unlocked_at ASC
    ) as rn
  FROM user_achievements
)
DELETE FROM user_achievements
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify no duplicates remain
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, achievement_id, COUNT(*) as cnt
    FROM user_achievements
    GROUP BY user_id, achievement_id
    HAVING COUNT(*) > 1
  ) dupes;
  
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Found % duplicate achievement records', duplicate_count;
  END IF;
END $$;

-- Rollback: None needed (constraint is beneficial to keep)
```

### Component Updates Required
- `src/utils/achievementChecker.ts` - Update awardAchievement() with ON CONFLICT handling
- `src/components/goals/GoalCard.tsx` - Handle achievement check after goal completion
- `src/components/accounts/AccountForm.tsx` - Handle achievement check after account creation
- `src/components/Dashboard.tsx` - Handle achievement check results properly

### Monitoring & Alerting
```typescript
// Add monitoring for duplicate attempts
export function trackAchievementAward(result: AchievementAwardResult) {
  if (result.alreadyEarned) {
    // Track duplicate attempts for monitoring
    console.debug('[Metrics] Duplicate achievement attempt:', {
      achievement: result.achievement.type,
      timestamp: new Date().toISOString(),
    });
    
    // Could send to analytics service
    // analytics.track('achievement_duplicate_attempt', { ... });
  }
}
```
