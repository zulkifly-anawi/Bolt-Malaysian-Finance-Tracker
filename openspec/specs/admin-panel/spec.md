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
- **AND** shows full name, email, onboarding status
- **AND** shows account count, goal count per user
- **AND** shows total balance per user (sum of all account balances)
- **AND** shows admin status indicator
- **AND** shows created date
- **AND** provides real-time search and filter by email or name
- **AND** allows refresh to update data

#### Scenario: View user statistics dashboard
- **WHEN** admin views user management page
- **THEN** system displays summary statistics:
  - Total users count
  - Admin users count (users with is_admin = true)
  - Recent users (registered in last 30 days)
  - Active users (completed onboarding)
- **AND** updates statistics automatically when data changes
- **AND** shows loading state while fetching data

#### Scenario: View user details
- **WHEN** admin clicks on user row
- **THEN** system displays user detail modal
- **AND** shows complete profile information:
  - Full name and email
  - User ID (UUID)
  - Created date and onboarding completion status
  - Admin status
- **AND** shows aggregated statistics:
  - Total accounts count
  - Total goals count
  - Total balance across all accounts (formatted as RM)
- **AND** provides action buttons for user management
- **AND** allows closing modal without actions

#### Scenario: Toggle admin status
- **WHEN** admin clicks "Toggle Admin" button for a user
- **THEN** system prompts for confirmation
- **AND** updates is_admin flag in profiles table
- **AND** refreshes user list to show updated status
- **AND** displays success message
- **AND** handles errors gracefully with error messages
- **AND** logs action in audit trail

#### Scenario: Search and filter users
- **WHEN** admin types in search box
- **THEN** system filters users in real-time
- **AND** searches by email (case-insensitive)
- **AND** searches by full name (case-insensitive)
- **AND** shows matching users only
- **AND** displays "No users found" if no matches
- **AND** clears filter when search box is emptied

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

#### Scenario: Admin dashboard overview
- **WHEN** admin opens admin panel
- **THEN** system displays dashboard with configuration cards:
  - **User Management Card**:
    - Total users count
    - Active users count (onboarding_completed = true)
    - Link to user management page
  - **Account Configuration Card**:
    - Account types count
    - Institutions count
    - Link to account config page
  - **Goal Configuration Card**:
    - Goal categories count
    - Goal templates count
    - Link to goal config page
  - **Achievements Card**:
    - Achievement definitions count
    - Link to achievements page
  - **Investment Rates Card**:
    - Links to ASB, EPF, Tabung Haji rates
  - **System Rules Card**:
    - Validation rules count
    - Link to rules page
- **AND** shows recent activity feed (last 10 audit log entries)
- **AND** provides quick navigation to each section

#### Scenario: Dashboard statistics calculation
- **WHEN** dashboard loads
- **THEN** system queries all admin tables in parallel:
  - Counts admin_config_account_types records
  - Counts admin_config_institutions records
  - Counts admin_config_goal_categories records
  - Counts goal_templates records
  - Counts achievement_definitions records
  - Counts profiles for total users
  - Counts profiles with onboarding_completed for active users
  - Fetches recent audit_log entries
- **AND** displays loading state while fetching
- **AND** handles errors gracefully
- **AND** updates stats in real-time

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

-- profiles (User Management)
- SELECT (user's own): Users can view their own profile
- SELECT (all): "Admins can view all profiles" - Admins see all users
- UPDATE (user's own): Users can update their own profile  
- UPDATE (all): "Admins can update any profile" - Admins can toggle admin status

-- accounts (User Management)
- SELECT (user's own): Users can view their own accounts
- SELECT (all): "Admins can view all accounts" - Admins see all accounts
- Used for calculating account counts and total balances

-- goals (User Management)
- SELECT (user's own): Users can view their own goals
- SELECT (all): "Admins can view all goals" - Admins see all goals
- Used for calculating goal counts per user

-- account_goals (User Management)
- SELECT (all): "Admins can view all account_goals" - For account-goal relationships

-- balance_entries (User Management)
- SELECT (all): "Admins can view all balance_entries" - For historical balance tracking

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
-- Enhanced is_admin() function that checks TWO sources:
-- 1. Direct is_admin flag in profiles table
-- 2. Email in admin_authorized_emails table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid;
  v_email text;
BEGIN
  -- Get current user
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current user's email
  SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_uid;

  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = v_uid AND p.is_admin = TRUE
    )
    OR (
      v_email IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admin_authorized_emails e
        WHERE lower(e.email) = lower(v_email)
      )
    )
  );
END;
$$;

-- RLS policies for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin() = true);

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin() = true)
WITH CHECK (is_admin() = true);

CREATE POLICY "Admins can view all accounts"
ON accounts
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can view all goals"
ON goals
FOR SELECT
TO authenticated
USING (is_admin());
```

### Implementation Files
- `src/components/admin/AdminDashboard.tsx` - Main admin panel container with page routing
- `src/components/admin/AdminLayout.tsx` - Admin layout with sidebar navigation
- `src/components/admin/pages/DashboardOverview.tsx` - Admin dashboard with statistics
- `src/components/admin/pages/UserManagementPage.tsx` - **User management with full CRUD**
- `src/components/admin/pages/AccountConfigPage.tsx` - Account type configuration
- `src/components/admin/pages/GoalConfigPage.tsx` - Goal category configuration
- `src/components/admin/pages/InvestmentRatesPage.tsx` - Investment rate management
- `src/components/admin/pages/SystemRulesPage.tsx` - Validation rules configuration
- `src/components/admin/pages/AchievementsPage.tsx` - Achievement definitions
- `src/components/admin/pages/AdminEmailsPage.tsx` - Authorized admin emails
- `src/components/admin/pages/AuditLogPage.tsx` - Audit log viewer
- `src/utils/adminAuth.ts` - Admin check utilities
- `src/services/adminConfigService.ts` - Config management service
- `src/services/auditService.ts` - Audit logging service
- `supabase/migrations/20251017100919_create_admin_infrastructure.sql` - Admin tables
- `supabase/migrations/20251021120000_add_admin_authorized_emails.sql` - Authorized emails
- `supabase/migrations/20251110000000_add_admin_profile_access.sql` - **Admin profile RLS policies**
- `supabase/migrations/20251110000001_add_admin_access_to_accounts_and_goals.sql` - **Admin data access policies**

### Admin Context
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAdmin: boolean; // Derived from is_admin() function check
  // ...
}

// Check admin status on login
async function checkAdminStatus(email: string): Promise<boolean> {
  const { data } = await supabase.rpc('is_admin');
  return !!data;
}
```

### User Management Component Types
```typescript
// src/components/admin/pages/UserManagementPage.tsx
interface UserStats {
  totalUsers: number;      // Count of all users
  adminUsers: number;      // Count of users with is_admin = true
  recentUsers: number;     // Users created in last 30 days
  activeUsers: number;     // Users with onboarding_completed = true
}

interface UserWithStats extends Profile {
  accountCount?: number;   // Number of accounts user has
  goalCount?: number;      // Number of goals user has
  totalBalance?: number;   // Sum of all account balances
}

// Component state management
const [users, setUsers] = useState<UserWithStats[]>([]);
const [stats, setStats] = useState<UserStats>({...});
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

// Load users function - fetches all data via RLS policies
async function loadUsers() {
  // Fetch all profiles (allowed via "Admins can view all profiles" policy)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // For each user, fetch their accounts and goals
  // (allowed via "Admins can view all accounts/goals" policies)
  const usersWithStats = await Promise.all(
    profiles.map(async (profile) => {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, current_balance')
        .eq('user_id', profile.id);

      const { data: goals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', profile.id);

      return {
        ...profile,
        accountCount: accounts?.length || 0,
        goalCount: goals?.length || 0,
        totalBalance: accounts?.reduce((sum, acc) => 
          sum + (acc.current_balance || 0), 0) || 0,
      };
    })
  );

  // Calculate statistics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  setStats({
    totalUsers: usersWithStats.length,
    adminUsers: usersWithStats.filter(u => u.is_admin).length,
    recentUsers: usersWithStats.filter(u => 
      new Date(u.created_at) > thirtyDaysAgo).length,
    activeUsers: usersWithStats.filter(u => 
      u.onboarding_completed).length,
  });
}

// Toggle admin status function
async function toggleAdminStatus(userId: string) {
  const user = users.find(u => u.id === userId);
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: !user?.is_admin })
    .eq('id', userId);
    
  if (!error) {
    await loadUsers(); // Refresh data
  }
}
```

### UI Components Structure
```typescript
// Statistics Cards (4 cards)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard icon={Users} label="Total Users" value={totalUsers} />
  <StatCard icon={Shield} label="Admin Users" value={adminUsers} />
  <StatCard icon={Calendar} label="Recent Users" value={recentUsers} />
  <StatCard icon={TrendingUp} label="Active Users" value={activeUsers} />
</div>

// Search Bar
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <input
    type="text"
    placeholder="Search by email or name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

// Users Table
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Accounts</th>
      <th>Goals</th>
      <th>Total Balance</th>
      <th>Admin</th>
      <th>Created</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredUsers.map(user => (
      <UserRow key={user.id} user={user} onClick={() => setSelectedUser(user)} />
    ))}
  </tbody>
</table>

// User Detail Modal
<ConfirmDialog
  isOpen={!!selectedUser}
  title="User Details"
  onConfirm={() => toggleAdminStatus(selectedUser.id)}
  onCancel={() => setSelectedUser(null)}
>
  <UserProfileInfo />
  <UserStatistics />
</ConfirmDialog>
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
