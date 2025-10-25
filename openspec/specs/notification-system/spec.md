# Notification System

## Overview
Real-time notification system for achievements, goal milestones, reminders, and system updates.

## Requirements

### Requirement: Notification Types
The system SHALL support multiple notification types for different events.

#### Scenario: Achievement notifications
- **WHEN** user unlocks achievement
- **THEN** system creates notification with type='achievement'
- **AND** includes achievement name and icon
- **AND** displays congratulatory message
- **AND** links to achievements page

#### Scenario: Goal milestone notifications
- **WHEN** user reaches 50%, 75%, 90% of goal
- **THEN** system creates notification with type='goal_progress'
- **AND** shows progress percentage
- **AND** displays encouragement message
- **AND** links to goal details

#### Scenario: Goal completion notifications
- **WHEN** user completes goal (current >= target)
- **THEN** system creates notification with type='goal_completed'
- **AND** shows goal name
- **AND** displays celebration message
- **AND** prompts user to mark as achieved

#### Scenario: Reminder notifications
- **WHEN** goal target_date approaches (within 30 days)
- **THEN** system creates notification with type='reminder'
- **AND** shows days remaining
- **AND** displays current progress vs. target
- **AND** suggests increased contributions if behind

#### Scenario: System notifications
- **WHEN** admin broadcasts message
- **THEN** system creates notification with type='system'
- **AND** allows markdown formatting
- **AND** displays to all users
- **AND** marks as important (optional)

### Requirement: Notification Creation
The system SHALL allow programmatic and manual notification creation.

#### Scenario: Automatic notification
- **WHEN** system event triggers (achievement unlock, goal milestone)
- **THEN** system automatically creates notification
- **AND** sets user_id, type, message, related_id
- **AND** sets is_read = false
- **AND** sets created_at to current timestamp

#### Scenario: Admin broadcast
- **WHEN** admin creates system notification
- **THEN** system creates notification for all active users
- **AND** allows custom message and title
- **AND** optionally sets related URL
- **AND** marks as priority (shows at top)

### Requirement: Notification Display
The system SHALL display notifications in UI with visual indicators.

#### Scenario: Notification bell icon
- **WHEN** user has unread notifications
- **THEN** system displays badge count on bell icon
- **AND** highlights icon with primary color
- **AND** updates count in real-time

#### Scenario: Notification dropdown
- **WHEN** user clicks bell icon
- **THEN** system displays dropdown with recent notifications
- **AND** shows up to 10 most recent
- **AND** displays unread notifications at top
- **AND** shows read notifications with reduced opacity
- **AND** provides "Mark all as read" button
- **AND** provides "View all" link to full page

#### Scenario: Full notifications page
- **WHEN** user opens notifications page
- **THEN** system displays all notifications paginated
- **AND** groups by date (Today, Yesterday, This Week, Older)
- **AND** shows type-specific icons
- **AND** allows filtering by type
- **AND** provides bulk actions (mark all read, delete all)

### Requirement: Notification Interaction
The system SHALL allow users to read, dismiss, and manage notifications.

#### Scenario: Mark as read
- **WHEN** user clicks notification
- **THEN** system sets is_read = true
- **AND** navigates to related content (if related_id present)
- **AND** updates unread count
- **AND** reduces opacity of notification

#### Scenario: Dismiss notification
- **WHEN** user dismisses notification
- **THEN** system removes from dropdown
- **AND** optionally marks as read
- **AND** keeps in database (non-destructive)
- **AND** can be viewed in full notifications page

#### Scenario: Delete notification
- **WHEN** user deletes notification from full page
- **THEN** system hard deletes record
- **AND** removes from all views
- **AND** updates unread count if was unread

#### Scenario: Mark all as read
- **WHEN** user clicks "Mark all as read"
- **THEN** system sets is_read = true for all user's notifications
- **AND** clears unread badge count
- **AND** updates UI instantly

### Requirement: Real-time Updates
The system SHALL update notifications in real-time without page refresh.

#### Scenario: Receive notification
- **WHEN** new notification is created for user
- **THEN** system pushes update via Supabase real-time
- **AND** increments unread count
- **AND** displays toast notification (optional)
- **AND** plays subtle sound (optional)
- **AND** adds to dropdown list

#### Scenario: Real-time subscription
- **WHEN** user logs in
- **THEN** system subscribes to notifications table
- **AND** filters by user_id
- **AND** listens for INSERT events
- **AND** listens for UPDATE events (read status)
- **AND** unsubscribes on logout

### Requirement: Notification Preferences
The system SHALL allow users to customize notification settings (future).

#### Scenario: Notification settings
- **WHEN** user opens notification preferences
- **THEN** system displays toggle options:
  - Achievement notifications (on/off)
  - Goal milestone notifications (on/off)
  - Reminder notifications (on/off)
  - System notifications (always on)
  - Sound effects (on/off)
  - Toast popups (on/off)
- **AND** saves preferences to user_settings

### Requirement: Notification Cleanup
The system SHALL automatically clean up old notifications.

#### Scenario: Auto-delete old notifications
- **WHEN** notification is older than 90 days
- **AND** is marked as read
- **THEN** system can auto-delete via scheduled job
- **AND** keeps unread notifications indefinitely
- **AND** always keeps achievement notifications

#### Scenario: User cleanup
- **WHEN** user has 100+ notifications
- **THEN** system shows "Clear old notifications" option
- **AND** allows bulk delete of read notifications older than 30 days
- **AND** keeps recent and important notifications

## Technical Details

### Database Schema
```sql
notifications table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users)
  - type: text ('achievement', 'goal_progress', 'goal_completed', 'reminder', 'system')
  - title: text (nullable)
  - message: text
  - related_id: uuid (nullable) - Links to achievement, goal, etc.
  - related_type: text (nullable) - Type of related entity
  - is_read: boolean (default false)
  - priority: text (nullable) - 'high', 'normal'
  - created_at: timestamp
  - read_at: timestamp (nullable)
  - INDEX on (user_id, is_read)
  - INDEX on (user_id, created_at)
```

### RLS Policies
- Users can only view their own notifications
- Users can update their own notifications (mark read)
- Users can delete their own notifications
- System/admin can create notifications for any user
- Admins can view all notifications

### Real-time Subscription
```typescript
// Subscribe to notifications
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      handleNewNotification(payload.new);
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      handleNotificationUpdate(payload.new);
    }
  )
  .subscribe();
```

### Implementation Files
- `src/components/common/NotificationBell.tsx` - Bell icon with badge
- `src/components/common/NotificationDropdown.tsx` - Dropdown list
- `src/components/common/NotificationItem.tsx` - Single notification display
- `src/components/common/NotificationsPage.tsx` - Full page view
- `src/components/common/NotificationToast.tsx` - Toast popup
- `src/hooks/useNotifications.ts` - Custom hook for notifications
- `src/contexts/NotificationContext.tsx` - Global notification state
- `supabase/migrations/20251015165754_add_engagement_features.sql` - Notifications table

### Notification Creation Helper
```typescript
// Create notification
async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  relatedId?: string,
  relatedType?: string,
  title?: string
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    related_id: relatedId,
    related_type: relatedType,
    is_read: false,
    created_at: new Date().toISOString()
  });
}

// Example: Achievement notification
await createNotification(
  userId,
  'achievement',
  `Congratulations! You've unlocked the "${achievementName}" badge!`,
  achievementId,
  'achievement',
  'Achievement Unlocked!'
);

// Example: Goal milestone
await createNotification(
  userId,
  'goal_progress',
  `You're ${percentage}% of the way to your "${goalName}" goal! Keep it up!`,
  goalId,
  'goal',
  'Goal Progress'
);
```

### Toast Notification Component
```typescript
// Display toast for new notifications
function showNotificationToast(notification: Notification) {
  toast({
    title: notification.title || getDefaultTitle(notification.type),
    description: notification.message,
    icon: getNotificationIcon(notification.type),
    duration: 5000,
    action: notification.related_id ? (
      <Button onClick={() => navigateToRelated(notification)}>
        View
      </Button>
    ) : undefined
  });
}
```
