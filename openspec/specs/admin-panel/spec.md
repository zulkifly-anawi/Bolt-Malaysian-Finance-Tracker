# Admin Panel

## Overview
Multi-administrator system with authorized email management, user management, goal templates, feedback monitoring, and system configuration.

## Requirements

### Requirement: Admin Authorization
The system SHALL restrict admin access to authorized email addresses only.

#### Scenario: Check admin status
- **WHEN** user logs in
- **THEN** system checks if user email in admin_authorized_emails table
- **AND** sets is_admin flag in session/context
- **AND** grants access to admin routes if authorized
- **AND** denies access if not authorized

#### Scenario: Admin email management
- **WHEN** admin views authorized emails list
- **THEN** system displays all admin_authorized_emails
- **AND** shows email, added_by, added_at
- **AND** allows adding new admin emails
- **AND** allows removing admin emails (except own)
- **AND** requires confirmation for removal

#### Scenario: Add admin email
- **WHEN** admin adds new email to authorized list
- **THEN** system validates email format
- **AND** checks for duplicates
- **AND** creates admin_authorized_emails record
- **AND** sets added_by to current admin's user_id
- **AND** logs action in audit_logs
- **AND** displays success message

#### Scenario: Remove admin email
- **WHEN** admin removes email from authorized list
- **THEN** system prevents self-removal
- **AND** requires confirmation dialog
- **AND** deletes admin_authorized_emails record
- **AND** logs action in audit_logs
- **AND** immediately revokes admin access for that user

### Requirement: User Management
The system SHALL allow admins to view and manage user accounts.

#### Scenario: View users list
- **WHEN** admin opens user management
- **THEN** system displays all registered users
- **AND** shows email, created_at, last_sign_in
- **AND** shows account count, goal count per user
- **AND** shows total balance per user
- **AND** provides search and filter options

#### Scenario: View user details
- **WHEN** admin clicks on user
- **THEN** system displays user detail modal
- **AND** shows all user accounts
- **AND** shows all user goals
- **AND** shows achievements earned
- **AND** shows recent activity/audit trail
- **AND** allows admin to take actions

#### Scenario: User actions
- **WHEN** admin manages user
- **THEN** system allows:
  - Reset user password (send reset email)
  - Disable user account (soft delete)
  - Delete user data (hard delete with confirmation)
  - View audit logs for user
  - Impersonate user (future)

### Requirement: Goal Template Management
The system SHALL allow admins to create and manage goal templates.

#### Scenario: View templates
- **WHEN** admin opens template management
- **THEN** system displays all goal_templates
- **AND** shows name, category, default_amount
- **AND** shows usage count (goals created from template)
- **AND** shows active/inactive status
- **AND** allows sorting by usage or name

#### Scenario: Create template
- **WHEN** admin creates new goal template
- **THEN** system prompts for:
  - Template name
  - Category
  - Description
  - Default target amount
  - Icon (emoji or icon name)
  - Sort order
- **AND** validates all required fields
- **AND** creates goal_templates record
- **AND** sets is_active = true
- **AND** makes immediately available to users

#### Scenario: Edit template
- **WHEN** admin edits existing template
- **THEN** system allows changing all fields
- **AND** does not affect existing goals using template
- **AND** new goals use updated values
- **AND** logs change in audit_logs

#### Scenario: Deactivate template
- **WHEN** admin deactivates template
- **THEN** system sets is_active = false
- **AND** hides from user goal creation
- **AND** keeps existing goals intact
- **AND** allows reactivation later

### Requirement: Feedback Management
The system SHALL display and manage user feedback submissions.

#### Scenario: View feedback list
- **WHEN** admin opens feedback management
- **THEN** system displays all user_feedback entries
- **AND** shows user_email, feedback_type, message
- **AND** shows submitted_at timestamp
- **AND** shows status (new, reviewed, resolved)
- **AND** filters by type (bug, feature, general)
- **AND** sorts by date (newest first)

#### Scenario: Review feedback
- **WHEN** admin clicks on feedback entry
- **THEN** system displays full feedback details
- **AND** shows user information
- **AND** shows current_page context
- **AND** allows adding admin notes
- **AND** allows changing status
- **AND** allows marking as resolved

#### Scenario: Respond to feedback
- **WHEN** admin responds to feedback
- **THEN** system optionally sends email to user
- **AND** includes admin response message
- **AND** updates feedback status to 'reviewed'
- **AND** logs admin action

### Requirement: System Configuration
The system SHALL allow admins to manage app-wide settings.

#### Scenario: View app config
- **WHEN** admin opens system config
- **THEN** system displays app_config table
- **AND** shows all key-value pairs
- **AND** groups by category (features, limits, defaults)
- **AND** shows description and data type per setting

#### Scenario: Update config
- **WHEN** admin changes config value
- **THEN** system validates against data type
- **AND** updates app_config record
- **AND** logs change in audit_logs with old/new values
- **AND** applies change immediately (or after restart if needed)
- **AND** displays confirmation

#### Scenario: Feature toggles
- **WHEN** admin toggles feature flag
- **THEN** system enables/disables feature globally
- **AND** examples: enable_achievements, enable_calculators, maintenance_mode
- **AND** takes effect immediately for all users
- **AND** shows current status clearly

### Requirement: Audit Logging
The system SHALL log all admin actions for security and compliance.

#### Scenario: Log admin action
- **WHEN** admin performs sensitive action
- **THEN** system creates audit_logs entry with:
  - admin_user_id
  - action_type (create, update, delete, view)
  - table_name (affected table)
  - record_id (affected record)
  - old_values (JSON)
  - new_values (JSON)
  - timestamp
  - ip_address (optional)

#### Scenario: View audit logs
- **WHEN** admin opens audit logs
- **THEN** system displays all admin actions
- **AND** shows who, what, when for each action
- **AND** allows filtering by admin, date, action type
- **AND** shows before/after values for changes
- **AND** exports to CSV for compliance

#### Scenario: Audit log retention
- **WHEN** audit logs accumulate
- **THEN** system retains logs for minimum 1 year
- **AND** archives old logs (older than 2 years)
- **AND** never deletes audit records (immutable)

### Requirement: Dashboard Statistics
The system SHALL provide admin dashboard with key metrics.

#### Scenario: Admin dashboard
- **WHEN** admin opens admin panel
- **THEN** system displays:
  - Total users count
  - Active users (last 7 days)
  - Total accounts count
  - Total goals count
  - Completed goals count
  - Total assets under management (sum of all balances)
  - Recent user signups (last 10)
  - Recent feedback (unreviewed count)
  - System health indicators

#### Scenario: Usage metrics
- **WHEN** admin views analytics
- **THEN** system shows:
  - Daily/weekly/monthly active users
  - Most popular account types
  - Most popular goal templates
  - Achievement unlock rates
  - Calculator usage frequency
  - Average goals per user
  - Average accounts per user

### Requirement: Admin Access Control
The system SHALL enforce admin-only access to admin routes and actions.

#### Scenario: Protect admin routes
- **WHEN** user navigates to /admin/*
- **THEN** system checks isAdmin flag
- **AND** redirects to home if not admin
- **AND** displays "Unauthorized" message
- **AND** logs unauthorized access attempt

#### Scenario: Admin button visibility
- **WHEN** rendering navigation
- **THEN** system only shows "Admin" button if isAdmin === true
- **AND** hides admin features from non-admin users
- **AND** uses consistent admin check across all components

#### Scenario: API protection
- **WHEN** API endpoint is admin-only
- **THEN** system checks RLS policies
- **AND** verifies user email in admin_authorized_emails
- **AND** returns 403 Forbidden if not admin
- **AND** logs unauthorized API access

## Technical Details

### Database Schema
```sql
admin_authorized_emails table:
  - id: uuid (primary key)
  - email: text (unique, not null)
  - added_by: uuid (foreign key to auth.users)
  - added_at: timestamp (default now())
  - created_at: timestamp

app_config table:
  - id: uuid (primary key)
  - config_key: text (unique, not null)
  - config_value: text
  - description: text
  - category: text
  - value_type: text ('boolean', 'string', 'number', 'json')
  - updated_by: uuid (foreign key to auth.users, nullable)
  - updated_at: timestamp

audit_logs table:
  - id: uuid (primary key)
  - admin_user_id: uuid (foreign key to auth.users)
  - action_type: text
  - table_name: text
  - record_id: uuid (nullable)
  - old_values: jsonb (nullable)
  - new_values: jsonb (nullable)
  - ip_address: text (nullable)
  - created_at: timestamp
  - INDEX on (admin_user_id, created_at)
  - INDEX on (table_name, record_id)
```

### RLS Policies
```sql
-- admin_authorized_emails
- SELECT: Authenticated users can check if email is admin
- INSERT: Only admins can add emails
- UPDATE: No updates allowed (immutable)
- DELETE: Only admins can remove emails

-- app_config
- SELECT: Admins only
- INSERT: Admins only
- UPDATE: Admins only
- DELETE: No deletes allowed

-- audit_logs
- SELECT: Admins only
- INSERT: System/admins only
- UPDATE: Never (immutable)
- DELETE: Never (immutable)
```

### Admin Check Function
```sql
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN admin_authorized_emails a ON u.email = a.email
    WHERE u.id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Implementation Files
- `src/components/admin/AdminPanel.tsx` - Main admin dashboard
- `src/components/admin/UserManagement.tsx` - User CRUD
- `src/components/admin/GoalTemplateManager.tsx` - Template management
- `src/components/admin/FeedbackManagement.tsx` - Feedback review
- `src/components/admin/SystemConfig.tsx` - App config
- `src/components/admin/AuditLogViewer.tsx` - Audit logs
- `src/components/admin/AdminEmailManager.tsx` - Authorized emails
- `src/utils/adminAuth.ts` - Admin check utilities
- `src/services/adminConfigService.ts` - Config management
- `src/services/auditService.ts` - Audit logging
- `supabase/migrations/20251017100919_create_admin_infrastructure.sql` - Admin tables
- `supabase/migrations/20251021120000_add_admin_authorized_emails.sql` - Authorized emails

### Admin Context
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAdmin: boolean; // Derived from admin_authorized_emails check
  // ...
}

// Check admin status on login
async function checkAdminStatus(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('admin_authorized_emails')
    .select('id')
    .eq('email', email)
    .single();
  
  return !!data;
}
```

### Protected Route Component
```typescript
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Usage in App.tsx
<Route path="/admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />
```
