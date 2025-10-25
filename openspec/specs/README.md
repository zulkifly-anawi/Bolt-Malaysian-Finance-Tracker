# Existing Capabilities Documentation

This directory contains comprehensive specifications for all existing features in the Malaysian Finance Tracker application.

## Documented Capabilities

### 1. User Authentication (`user-authentication/`)
Complete authentication system with email/password login, session management, and protected routes.

**Key Features:**
- Email/password authentication via Supabase Auth
- Session persistence and token refresh
- AuthContext for global auth state
- Protected route guards
- JWT-based security

### 2. Account Management (`account-management/`)
Financial account tracking with support for Malaysian instruments (ASB, EPF, Tabung Haji) and general accounts.

**Key Features:**
- Create/update/delete financial accounts
- Malaysian account types (ASB, EPF, Tabung Haji)
- General account types (Savings, Checking, Investment, etc.)
- ASB units synchronization with price tracking
- EPF contribution tracking with scheme types
- Account balance updates
- Database schema with RLS policies

### 3. Goal Tracking (`goal-tracking/`)
Goal-based financial planning with templates, progress tracking, and projections.

**Key Features:**
- Create goals with target amounts and dates
- 8 pre-configured Malaysian goal templates
- Automatic progress calculation
- Account allocation to goals
- Goal completion tracking
- Progress history timeline
- Goal categories and priorities

### 4. Investment Calculators (`investment-calculators/`)
Malaysian-specific investment projection calculators with accurate dividend rates.

**Key Features:**
- ASB Calculator (with historical dividend rates)
- EPF Calculator (with contribution rules and projections)
- Tabung Haji Calculator (for Hajj savings planning)
- Compound interest engine
- Monthly/annual contribution support
- Visual growth projections
- Historical dividend data tables

### 5. Achievement System (`achievement-system/`)
Gamification system with badges and milestones to encourage engagement.

**Key Features:**
- 10+ predefined achievements
- Financial achievements (Goal Crusher, Savings Champion, etc.)
- Engagement achievements (Consistent Tracker, etc.)
- Automatic achievement detection
- Achievement notifications
- Progress tracking toward locked achievements
- Achievement statistics and display

### 6. Notification System (`notification-system/`)
Real-time notifications for achievements, goal milestones, and system updates.

**Key Features:**
- Multiple notification types (achievement, goal_progress, reminder, system)
- Real-time updates via Supabase subscriptions
- Notification bell with unread count
- Notification dropdown and full page view
- Mark as read/delete functionality
- Toast notifications for immediate alerts
- Admin broadcast capability

### 7. Admin Panel (`admin-panel/`)
Multi-administrator system with comprehensive management capabilities.

**Key Features:**
- Admin authorization via email whitelist
- User management (view, disable, delete)
- Goal template management
- Feedback review and response
- System configuration (app_config)
- Audit logging for all admin actions
- Admin email management
- Dashboard statistics and analytics

### 8. Data Export (`data-export/`)
CSV export functionality for user's financial data with GDPR compliance.

**Key Features:**
- Export accounts to CSV
- Export goals to CSV
- Export progress history
- Full data export (ZIP file)
- Excel-compatible CSV formatting
- Data isolation and security
- "Data Expert" achievement on first export
- Efficient handling of large datasets

### 9. Help System (`help-system/`)
Comprehensive help and support system with educational content.

**Key Features:**
- FAQ system with categories and search
- Contextual help panels
- Interactive onboarding tour
- User feedback submission (bugs, features, general)
- Malaysian finance education (ASB, EPF, Tabung Haji)
- Floating help button
- Keyboard shortcut support (? key)
- Admin-managed help content

### 10. Dashboard and Overview (`dashboard-overview/`)
Main dashboard with financial summary and quick actions.

**Key Features:**
- Landing page for unauthenticated users
- Net worth calculation and display
- Accounts summary widget
- Goals summary widget
- Quick actions panel
- Recent activity timeline
- Notifications integration
- Responsive layout (desktop/tablet/mobile)
- Loading skeletons and performance optimization

## Specification Format

Each specification follows the OpenSpec format:

### Structure
```
capability-name/
  └── spec.md
```

### Content Format
1. **Overview** - Brief description of the capability
2. **Requirements** - Normative requirements using SHALL/MUST
3. **Scenarios** - Concrete examples using "WHEN/THEN/AND" format
4. **Technical Details** - Implementation specifics:
   - Database schemas
   - RLS policies
   - Implementation files
   - Code examples
   - Dependencies

### Scenario Format
Scenarios use 4 hashtags and structured format:
```markdown
#### Scenario: Name
- **WHEN** condition
- **THEN** expected behavior
- **AND** additional behavior
```

## Usage

### View All Capabilities
```bash
openspec list --specs
```

### View Specific Capability
```bash
openspec show account-management
```

### Validate All Specs
```bash
openspec validate --strict
```

## Purpose

These specifications serve as:
1. **Baseline Documentation** - Comprehensive record of existing features
2. **Onboarding Reference** - Help new developers understand the system
3. **Change Management** - Foundation for tracking future changes as deltas
4. **AI Assistant Context** - Structured information for AI-assisted development
5. **Testing Basis** - Clear requirements for test case creation

## Next Steps

With these baseline specs established:
1. Use OpenSpec to propose new features or changes
2. Create changes as deltas against these specs
3. Track implementation progress in `openspec/changes/`
4. Archive completed changes to maintain history
5. Keep specs updated as source of truth

## Related Documentation

- `openspec/project.md` - Complete project context and conventions
- `openspec/AGENTS.md` - OpenSpec workflow for AI assistants
- `MIGRATION_GUIDELINES.md` - Database migration practices
- `README.md` - General project documentation

---

*Documentation created: 2025-01-17*
*Total Capabilities: 10*
*Total Requirements: 80+*
*Total Scenarios: 200+*
