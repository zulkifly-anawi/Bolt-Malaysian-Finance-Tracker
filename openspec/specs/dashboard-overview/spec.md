# Dashboard and Overview

## Overview
Main dashboard displaying financial summary, accounts overview, goals progress, and quick actions for authenticated users. Landing page for unauthenticated visitors.

## Requirements

### Requirement: Landing Page
The system SHALL display marketing landing page for unauthenticated users.

#### Scenario: View landing page
- **WHEN** unauthenticated user visits app
- **THEN** system displays landing page with:
  - Hero section with app description
  - Key features highlight (ASB tracking, EPF calculator, Goal setting)
  - Malaysian finance focus messaging
  - Sign Up and Login buttons
  - Privacy policy link
- **AND** redirects to dashboard if already authenticated

#### Scenario: Feature showcase
- **WHEN** viewing landing page
- **THEN** system displays features:
  - Track Malaysian accounts (ASB, EPF, Tabung Haji)
  - Set and monitor financial goals
  - Calculate investment projections
  - Earn achievements for milestones
  - Export your data anytime
- **AND** includes screenshots or icons
- **AND** provides clear value proposition

#### Scenario: Call to action
- **WHEN** user ready to sign up
- **THEN** landing page provides prominent "Get Started Free" button
- **AND** provides "Sign In" link for existing users
- **AND** navigates to Auth component

### Requirement: Dashboard Layout
The system SHALL display comprehensive financial overview for authenticated users.

#### Scenario: View main dashboard
- **WHEN** authenticated user accesses dashboard
- **THEN** system displays:
  - Total net worth (sum of all accounts)
  - Account count
  - Goal count and completion rate
  - Quick actions (Add Account, Create Goal, Use Calculator)
  - Recent accounts (top 5)
  - Recent goals (top 5)
  - Recent achievements (if any)
  - Notifications indicator
- **AND** loads data asynchronously
- **AND** shows loading skeletons during fetch

#### Scenario: Net worth calculation
- **WHEN** calculating total net worth
- **THEN** system sums current_balance of all accounts
- **AND** excludes archived/deleted accounts
- **AND** displays formatted amount (RM X,XXX.XX)
- **AND** shows growth indicator vs. previous period (future)

#### Scenario: Dashboard greeting
- **WHEN** displaying dashboard
- **THEN** system shows personalized greeting
- **AND** uses time-based message (Good morning/afternoon/evening)
- **AND** includes user's name or email
- **AND** displays current date

### Requirement: Accounts Summary
The system SHALL display summary of user's accounts on dashboard.

#### Scenario: Recent accounts widget
- **WHEN** viewing dashboard
- **THEN** system displays top 5 accounts by balance
- **AND** shows account name, type, current balance
- **AND** displays account icon based on type
- **AND** provides "View All" link to accounts page
- **AND** shows "Add Account" button if none exist

#### Scenario: Account type breakdown
- **WHEN** viewing accounts summary
- **THEN** system optionally shows pie chart
- **AND** groups by account type (ASB, EPF, Savings, etc.)
- **AND** displays percentage of total per type
- **AND** uses distinct colors per type

#### Scenario: Empty accounts state
- **WHEN** user has no accounts
- **THEN** system displays empty state message
- **AND** shows "Add Your First Account" call-to-action
- **AND** provides quick link to account creation
- **AND** shows helpful tips about account types

### Requirement: Goals Summary
The system SHALL display summary of user's goals on dashboard.

#### Scenario: Recent goals widget
- **WHEN** viewing dashboard
- **THEN** system displays active goals
- **AND** shows goal name, progress percentage, target amount
- **AND** displays progress bar with color coding:
  - Green: 75-100% complete
  - Yellow: 50-74% complete
  - Red: 0-49% complete
- **AND** shows target date
- **AND** provides "View All" link to goals page

#### Scenario: Goal completion summary
- **WHEN** viewing goals summary
- **THEN** system shows completion statistics:
  - Total goals: X
  - Active: Y
  - Achieved: Z
  - Completion rate: Z/X %
- **AND** displays milestone indicator
- **AND** celebrates recent completions

#### Scenario: Empty goals state
- **WHEN** user has no goals
- **THEN** system displays empty state
- **AND** shows "Set Your First Goal" call-to-action
- **AND** highlights goal templates feature
- **AND** explains benefits of goal tracking

### Requirement: Quick Actions
The system SHALL provide quick access to common actions.

#### Scenario: Quick action buttons
- **WHEN** viewing dashboard
- **THEN** system displays action buttons:
  - Add Account
  - Create Goal
  - Update Balance
  - Use Calculator
  - Export Data
- **AND** opens respective modal/page on click
- **AND** uses consistent iconography
- **AND** shows keyboard shortcuts (optional)

#### Scenario: Contextual quick actions
- **WHEN** user has accounts but no goals
- **THEN** system highlights "Create Goal" action
- **WHEN** user has goals
- **THEN** system highlights "Update Balance" action
- **AND** adapts suggestions based on user state

### Requirement: Recent Activity
The system SHALL display recent user activity and changes.

#### Scenario: Activity timeline
- **WHEN** viewing dashboard
- **THEN** system shows recent activity:
  - Account balance updates (last 5)
  - Goal completions (last 3)
  - Achievements unlocked (last 3)
  - Calculator uses (last 3)
- **AND** displays timestamp for each activity
- **AND** groups by date (Today, Yesterday, This Week)
- **AND** allows expanding to see more

#### Scenario: Activity item interaction
- **WHEN** user clicks activity item
- **THEN** system navigates to related entity
- **AND** highlights the specific account/goal
- **AND** maintains context breadcrumb

### Requirement: Notifications Integration
The system SHALL integrate notifications into dashboard.

#### Scenario: Notification bell
- **WHEN** viewing dashboard header
- **THEN** system displays notification bell icon
- **AND** shows unread count badge
- **AND** highlights with color if unread > 0
- **AND** opens dropdown on click

#### Scenario: Notification summary
- **WHEN** user has unread notifications
- **THEN** dashboard shows notification widget
- **AND** displays most recent 3 notifications
- **AND** provides "View All" link
- **AND** allows marking as read from widget

### Requirement: Dashboard Responsiveness
The system SHALL adapt dashboard layout for different screen sizes.

#### Scenario: Desktop layout
- **WHEN** viewing on desktop (>1024px)
- **THEN** system displays multi-column layout
- **AND** shows accounts and goals side-by-side
- **AND** displays all widgets simultaneously
- **AND** uses grid system (2-3 columns)

#### Scenario: Tablet layout
- **WHEN** viewing on tablet (768-1024px)
- **THEN** system displays 2-column layout
- **AND** stacks some widgets vertically
- **AND** maintains readability
- **AND** adjusts chart sizes

#### Scenario: Mobile layout
- **WHEN** viewing on mobile (<768px)
- **THEN** system displays single-column layout
- **AND** stacks all widgets vertically
- **AND** condenses summary stats
- **AND** collapses empty sections
- **AND** provides scrollable view

### Requirement: Dashboard Performance
The system SHALL load dashboard efficiently with minimal delay.

#### Scenario: Initial load
- **WHEN** user navigates to dashboard
- **THEN** system loads within 2 seconds
- **AND** shows loading skeletons for pending data
- **AND** renders layout immediately
- **AND** fetches data in parallel

#### Scenario: Data caching
- **WHEN** user returns to dashboard
- **THEN** system uses cached data if < 5 minutes old
- **AND** refreshes in background
- **AND** updates UI when fresh data arrives
- **AND** handles stale data gracefully

#### Scenario: Incremental loading
- **WHEN** dashboard has many widgets
- **THEN** system loads critical data first (accounts, net worth)
- **AND** lazy loads secondary widgets (activity, achievements)
- **AND** maintains responsive UI during loading

#### Scenario: Performance optimization
- **WHEN** rendering dashboard components
- **THEN** system uses `useCallback` for data loading functions
- **AND** memoizes expensive calculations with `useMemo`
- **AND** includes proper dependency arrays in `useEffect`
- **AND** prevents unnecessary re-renders

### Requirement: Admin Access (v1.1.0+)
The system SHALL provide admin panel access from dashboard for authorized users.

#### Scenario: Admin button visibility
- **WHEN** authenticated user is admin
- **THEN** dashboard displays "Admin Panel" button
- **AND** verifies admin status via `is_admin()` RPC
- **AND** checks both `profiles.is_admin` and `admin_authorized_emails`

#### Scenario: Admin panel navigation
- **WHEN** admin clicks "Admin Panel" button
- **THEN** system navigates to admin dashboard
- **AND** displays admin-only features:
  - User Management
  - System Configuration
  - Account/Goal Configuration
  - Audit Logs
- **AND** applies admin RLS policies

#### Scenario: Non-admin user
- **WHEN** non-admin user views dashboard
- **THEN** system hides admin panel button
- **AND** blocks direct navigation to admin routes
- **AND** redirects to main dashboard if attempted

## Technical Details

### Component Structure
```
Dashboard/
  - EnhancedDashboard.tsx (main authenticated view)
  - LandingPage.tsx (unauthenticated view)
  
EnhancedDashboard contains:
  - DashboardHeader (greeting, net worth, quick stats)
  - AccountsSummaryWidget
  - GoalsSummaryWidget
  - RecentActivityWidget
  - AchievementsWidget
  - QuickActionsPanel
```

### Data Fetching
```typescript
// Dashboard data loading with useCallback (v1.1.0+)
const loadDashboardData = useCallback(async () => {
  if (!user) return;
  
  setLoading(true);
  try {
    const [accounts, goals, achievements, notifications] = await Promise.all([
      fetchUserAccounts(user.id),
      fetchUserGoals(user.id),
      fetchRecentAchievements(user.id),
      fetchUnreadNotifications(user.id)
    ]);
    
    const netWorth = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
    const activeGoals = goals.filter(g => !g.is_achieved);
    const completedGoals = goals.filter(g => g.is_achieved);
    
    setDashboardData({
      netWorth,
      accounts,
      goals: activeGoals,
      completedGoals,
      achievements,
      notifications,
      stats: {
        accountCount: accounts.length,
        goalCount: goals.length,
        completionRate: goals.length > 0 
          ? (completedGoals.length / goals.length) * 100 
          : 0
      }
    });
  } catch (error) {
    console.error('Dashboard load error:', error);
    setError(error instanceof Error ? error.message : 'Failed to load dashboard');
  } finally {
    setLoading(false);
  }
}, [user]);

// Use in effect with proper dependencies
useEffect(() => {
  loadDashboardData();
}, [user, loadDashboardData]);
```

### Implementation Files
- `src/components/EnhancedDashboard.tsx` - Main dashboard (v1.1.0: optimized with useCallback)
- `src/components/Dashboard.tsx` - Legacy/simple dashboard
- `src/components/LandingPage.tsx` - Public landing page
- `src/components/PrivacyPolicy.tsx` - Privacy page
- `src/components/common/DashboardWidget.tsx` - Reusable widget container
- `src/components/accounts/AccountsSummary.tsx` - Accounts widget
- `src/components/goals/GoalsSummary.tsx` - Goals widget
- `src/components/admin/AdminDashboard.tsx` - Admin panel (v1.1.0+)
- `src/hooks/useConfig.ts` - Admin authentication hook (v1.1.0+)
- `src/utils/adminAuth.ts` - Admin verification utilities (v1.1.0+)

### Responsive Breakpoints
```css
/* Tailwind breakpoints used */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Dashboard Queries
```typescript
// Supabase queries for dashboard data
const { data: accounts } = await supabase
  .from('accounts')
  .select('*')
  .eq('user_id', userId)
  .order('current_balance', { ascending: false })
  .limit(5);

const { data: goals } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId)
  .eq('is_achieved', false)
  .order('target_date', { ascending: true })
  .limit(5);

const { data: achievements } = await supabase
  .from('user_achievements')
  .select('*, achievements(*)')
  .eq('user_id', userId)
  .order('unlocked_at', { ascending: false })
  .limit(3);
```

### Loading States
```typescript
// Loading skeleton components
<div className="animate-pulse">
  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Quick Stats Display
```typescript
interface DashboardStats {
  netWorth: number;
  accountCount: number;
  goalCount: number;
  completedGoals: number;
  completionRate: number;
  recentActivity: number;
  unreadNotifications: number;
}

// Display format
<div className="grid grid-cols-4 gap-4">
  <StatCard label="Net Worth" value={formatCurrency(stats.netWorth)} icon={<Wallet />} />
  <StatCard label="Accounts" value={stats.accountCount} icon={<CreditCard />} />
  <StatCard label="Goals" value={`${stats.completedGoals}/${stats.goalCount}`} icon={<Target />} />
  <StatCard label="Completion" value={`${stats.completionRate}%`} icon={<TrendingUp />} />
</div>
```
