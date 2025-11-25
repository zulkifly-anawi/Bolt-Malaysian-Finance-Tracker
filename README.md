# Malaysian Financial Tracker

A comprehensive financial tracking platform built specifically for Malaysians to manage their investments, savings, and financial goals. Track your ASB, EPF, Tabung Haji, and other accounts with beautiful visualizations and smart insights.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## 🚀 Features

### Core Features
- **Multi-Account Tracking**: Monitor all your financial accounts in one place
  - ASB (Amanah Saham Bumiputera) with unit-based tracking
  - EPF (Employees Provident Fund) with Account 1 & 2 split
  - Tabung Haji with hibah projections
  - Savings accounts, fixed deposits, unit trusts, and more
  - Real-time balance tracking and historical data
  - Automatic dividend/interest calculations

- **Goal Setting & Tracking**: Set financial goals and track progress automatically
  - Malaysian goal templates (home, education, hajj, retirement, investment)
  - Visual progress indicators with percentage completion
  - Account allocation to goals with customizable splits
  - Projected completion dates based on contributions
  - Manual and account-linked goal tracking
  - Goal achievement notifications

- **Malaysian Investment Calculators**:
  - **ASB Calculator**: Project dividend earnings based on historical rates (5.00% - 7.75%)
  - **EPF Calculator**: Estimate retirement savings with contribution tracking (11% employee + 13% employer)
  - **Tabung Haji Tracker**: Monitor hajj savings with dividend projections and hibah allocation

### Engagement Features
- **Achievements & Badges**: Gamified milestone system
  - Financial achievements (savings milestones, goal completion)
  - Engagement badges (consistent tracking, calculator usage)
  - Unlock notifications and progress tracking
  - Visual badge display with earned/locked states
  
- **Smart Insights**: Personalized financial recommendations
  - Account performance analysis
  - Goal progress insights
  - Savings optimization tips
  
- **Notifications & Reminders**: Stay on top of your finances
  - Goal milestone celebrations
  - Balance update reminders
  - Achievement unlocks
  - Custom reminder scheduling

- **Data Export**: Full data portability
  - Export all accounts to CSV
  - Export all goals to CSV
  - Complete financial snapshot
  - Privacy-focused (your data, your control)

### Admin Panel Features
- **User Management**: Comprehensive user administration
  - View all registered users with statistics
  - Monitor user activity and engagement
  - Toggle admin privileges
  - Search and filter users by email/name
  - User profile details (accounts, goals, total balance)
  
- **System Configuration**: Centralized admin controls
  - Manage account types and institutions
  - Configure goal categories and templates
  - Set validation rules and system settings
  - Update investment rates (ASB, EPF, Tabung Haji)
  - Achievement definitions management
  
- **Security & Audit**: Enterprise-grade admin features
  - Authorized admin emails management
  - Complete audit log tracking
  - Row-level security policies
  - Admin action history
  - Secure multi-admin support

### User Experience
- **Interactive Onboarding**: 4-step guided tour for new users
  - Account type selection
  - Profile setup
  - First account creation
  - Goal setting introduction
  
- **Help System**: Comprehensive support
  - FAQ with search functionality
  - Context-sensitive help tooltips
  - Floating help button
  - In-app feedback submission
  
- **Beautiful UI**: Modern glassmorphism design
  - Smooth animations and transitions
  - Responsive layout (mobile, tablet, desktop)
  - Dark-themed glass-morphic components
  - Accessible color contrasts and focus states

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (Email/Password)
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Netlify, or any static host

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/
│   ├── accounts/          # Account management components
│   ├── admin/             # Admin panel and pages
│   │   ├── pages/         # Admin feature pages
│   │   ├── AdminDashboard.tsx
│   │   └── AdminLayout.tsx
│   ├── common/            # Shared UI components
│   ├── engagement/        # Achievements, notifications, insights
│   ├── goals/             # Goal tracking components
│   ├── help/              # Help system and FAQ
│   ├── investments/       # Calculator components
│   ├── Auth.tsx           # Authentication
│   ├── Dashboard.tsx      # Main user dashboard
│   └── LandingPage.tsx    # Marketing page
├── contexts/
│   └── AuthContext.tsx    # Global auth state
├── hooks/
│   └── useConfig.ts       # Configuration hooks
├── lib/
│   └── supabase.ts        # Supabase client
├── services/
│   ├── adminConfigService.ts  # Admin configuration
│   └── auditService.ts        # Audit logging
├── types/
│   └── database.ts        # TypeScript types
└── utils/
    ├── achievementChecker.ts  # Achievement logic
    ├── adminAuth.ts           # Admin helpers
    ├── exportData.ts          # Data export
    ├── formatters.ts          # Number/date formatting
    ├── investmentCalculators.ts  # Calculator logic
    └── validation.ts          # Form validation
```

### Database Architecture
- **PostgreSQL** via Supabase with RLS
- **Row Level Security** for data isolation
- **Migrations**: Version-controlled SQL migrations
- **Policies**: Fine-grained access control
- **Functions**: Server-side logic (is_admin, triggers)
- **Indexes**: Optimized for query performance

### Key Patterns
- **Component-Based Architecture**: Modular, reusable components
- **Context API**: Global state management (Auth)
- **Custom Hooks**: Reusable logic (useConfig)
- **Service Layer**: Business logic separation
- **Type Safety**: Full TypeScript coverage
- **Security First**: RLS policies on all tables

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Quick Start Guide](docs/guides/QUICKSTART.md)** - Get started in 5 minutes
- **[API Documentation](docs/API.md)** - Database functions and service APIs
- **[Contributing Guide](docs/development/CONTRIBUTING.md)** - How to contribute
- **[Deployment Guide](docs/deployment/DEPLOYMENT.md)** - Production deployment
- **[Security Policy](docs/SECURITY.md)** - Security practices and reporting
- **[Migration Guidelines](docs/development/MIGRATION_GUIDELINES.md)** - Database migrations
- **[OpenSpec](openspec/)** - Feature specifications and architecture

See the [Documentation Index](docs/README.md) for complete documentation structure.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account (free tier works great)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/malaysian-finance-tracker.git
cd malaysian-finance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Database Migrations

The migrations in `supabase/migrations/` need to be applied to your Supabase project.

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Apply migrations:
```bash
supabase db push
```

4. Verify migrations:
```bash
supabase migration list
```

#### Option B: Manual SQL Execution

Run each SQL file in the Supabase SQL Editor in chronological order:
1. `20200101000000_base_schema.sql` - Core tables and RLS policies
2. Continue through all migration files in order
3. Latest: `20251110000001_add_admin_access_to_accounts_and_goals.sql`

### 6. Set Up Admin Access (Optional)

To grant admin privileges to your account:

1. Add your email to the authorized admins list:
```sql
INSERT INTO public.admin_authorized_emails (email)
VALUES ('your-email@example.com');
```

2. Or update your profile directly:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Admin access enables:
- User management
- System configuration
- Audit log viewing
- Account/goal templates management

### 6. Set Up Admin Access (Optional)

To grant admin privileges to your account:

1. Add your email to the authorized admins list:
```sql
INSERT INTO public.admin_authorized_emails (email)
VALUES ('your-email@example.com');
```

2. Or update your profile directly:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Admin access enables:
- User management
- System configuration
- Audit log viewing
- Account/goal templates management

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## 🗄️ Database Schema

### Core Tables
- **`profiles`** - User profile information and preferences
  - Full name, email, onboarding status
  - Admin flag for administrative access
  - Created/updated timestamps
  
- **`accounts`** - Financial accounts tracking
  - Account type, institution, balance
  - Investment-specific fields (units, dividend rates)
  - Monthly contributions and targets
  - Color coding for visualization
  
- **`goals`** - Financial goals and targets
  - Goal name, category, target amount
  - Current amount and progress tracking
  - Target date and completion status
  - Manual or account-linked tracking
  - Template association
  
- **`account_goals`** - Link accounts to goals
  - Allocation percentages
  - Automatic progress calculation
  - Multi-account goal support
  
- **`balance_entries`** - Historical balance tracking
  - Daily/periodic balance snapshots
  - Account performance history
  - Trend analysis data

### Engagement Tables
- **`achievement_definitions`** - Available achievements and badges
  - Achievement name, description, criteria
  - Icon and badge design
  - Unlock conditions
  
- **`user_achievements`** - User-earned achievements
  - Unlock timestamps
  - Achievement progress
  
- **`notifications`** - User notification system
  - Notification type and message
  - Read/unread status
  - Timestamp and priority
  
- **`reminders`** - Scheduled reminders
  - Reminder type (balance update, goal check)
  - Frequency and next trigger date
  - Active/inactive status
  
- **`user_feedback`** - In-app feedback submissions
  - Feedback type (bug, feature, general)
  - User message and context
  - Admin review status
  
- **`monthly_summaries`** - Monthly financial snapshots
  - Total assets, goals progress
  - Month-over-month changes
  - Automated generation

### Admin Tables
- **`admin_authorized_emails`** - Authorized admin users
  - Email addresses with admin access
  - Added by tracking
  - Automatic admin privilege granting
  
- **`admin_config_account_types`** - Account type definitions
  - Type name, category, icon
  - Active/inactive status
  - Malaysian-specific types (ASB, EPF, etc.)
  
- **`admin_config_institutions`** - Financial institutions
  - Institution name, type
  - Malaysian banks and investment companies
  
- **`admin_config_goal_categories`** - Goal categories
  - Category name, description, icon
  - Sort order and active status
  
- **`admin_config_validation_rules`** - System validation rules
  - Rule name, type, configuration
  - Min/max values, regex patterns
  
- **`admin_config_system_settings`** - Application settings
  - Key-value configuration pairs
  - Feature flags and system limits
  
- **`admin_audit_log`** - Admin action tracking
  - Admin user, action type, timestamp
  - Table and record affected
  - Old and new values (JSON)
  - IP address tracking

### Reference Tables
- **`goal_templates`** - Pre-configured goal templates
  - Malaysian goal types (hajj, education, home)
  - Default target amounts and timeframes
  - Icon and category assignments
  
- **`dividend_history`** - Historical dividend rates
  - ASB dividend rates by year
  - EPF dividend rates by account type and scheme
  - Tabung Haji hibah rates
  - Used for projections and calculations

## 🔐 Security

### Data Protection
- **Row Level Security (RLS)**: All tables use PostgreSQL RLS policies
  - Users can only access their own data
  - Admins have controlled access to all data via secure policies
  - Policy-based access control prevents unauthorized queries
  
- **Admin Security**: Multi-layer admin authentication
  - Dual-source admin checking (profiles.is_admin + admin_authorized_emails)
  - SECURITY DEFINER functions to prevent RLS recursion
  - Audit logging for all admin actions
  - Email-based authorization list
  
- **Encrypted Data**: Enterprise-grade encryption
  - Data encrypted in transit (HTTPS/TLS)
  - Data encrypted at rest (Supabase infrastructure)
  - Secure environment variable management
  
- **Secure Authentication**: Powered by Supabase Auth
  - Email/password authentication with verification
  - JWT-based session management
  - Automatic token refresh
  - Secure password reset flow
  
- **Privacy First**: Your data stays private
  - No third-party data sharing
  - No analytics tracking without consent
  - Data export available anytime
  - Account deletion support
  
- **Manual Tracking Only**: Zero banking credentials
  - We never ask for bank passwords
  - We never connect to your actual bank accounts
  - All data manually entered by you
  - Complete control over your information

### Security Features
- SQL injection prevention (parameterized queries)
- XSS protection (React's built-in escaping)
- CSRF protection (Supabase Auth)
- Rate limiting on authentication endpoints
- Secure environment configuration
- Regular dependency updates

## 🎨 Key Design Principles

- **Malaysian-First**: Built for Malaysian investment products
- **Privacy-Focused**: Your data belongs to you
- **Beautiful UI**: Modern glassmorphism design
- **Mobile Responsive**: Works on all screen sizes
- **Accessible**: Following WCAG guidelines

## 📱 Features in Detail

### Account Management
Add and track multiple accounts with detailed information:
- **Account Types**: ASB, EPF (Conventional/Shariah), Tabung Haji, Savings, Fixed Deposit, Unit Trust, Stocks, Crypto
- **Balance Tracking**: Current balance with historical snapshots
- **Monthly Contributions**: Set and track regular contributions
- **Dividend/Interest Rates**: Automatic calculations based on historical data
- **Institution Details**: Link to specific banks or investment companies
- **Performance Metrics**: Growth tracking and projections
- **Color Coding**: Visual organization with customizable colors
- **Investment Details**:
  - Unit-based tracking for ASB and Unit Trusts
  - Account 1/Account 2 split for EPF
  - Dividend scheme selection (Conventional/Shariah)
  - EPF contribution settings with employer rates

### Goal Projections
Smart projections that calculate:
- **Estimated Completion Date**: Based on current progress and contributions
- **Required Monthly Savings**: Amount needed to reach goal by target date
- **Account Performance Impact**: How linked accounts affect goal progress
- **Progress Tracking**: Visual indicators and percentage completion
- **Multi-Account Goals**: Allocate multiple accounts to single goals
- **Goal Categories**: Home, Education, Hajj, Retirement, Investment, Emergency, Travel, Custom
- **Template-Based**: Use pre-configured templates or create custom goals
- **Achievement Integration**: Earn badges for goal completion milestones

### Malaysian Investment Tools
Specialized calculators for:

**ASB Calculator**:
- Unit-based investment tracking
- Historical dividend rates (5.00% - 7.75%)
- Projected earnings based on monthly contributions
- Year-by-year breakdown
- Compound dividend calculations
- Current unit price: RM 1.00 (enforced)

**EPF Calculator**:
- Account 1 (70%) and Account 2 (30%) split
- Employee contribution: 11% (mandatory) or 4% (age 60+)
- Employer contribution: 13% (standard) or 12% (age 60+)
- Retirement age calculations
- Historical dividend rates by scheme and account type
- Withdrawal planning
- Contribution tracking over time

**Tabung Haji Tracker**:
- Hajj savings monitoring
- Hibah (dividend) projections
- Historical hibah rates
- Savings goal integration
- Islamic investment principles

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please use the in-app feedback system:
1. Click the Help tab in the dashboard
2. Scroll to the feedback form at the bottom
3. Submit your feedback with details

Or create an issue on GitHub with detailed information.

## 📚 Documentation

### Quick Links
- **[OpenSpec Documentation](openspec/)** - Complete feature specifications
  - [Admin Panel Spec](openspec/specs/admin-panel/spec.md) - User management, configuration, audit logging
  - [Account Management Spec](openspec/specs/account-management/spec.md) - Account tracking and management
  - [Goal Tracking Spec](openspec/specs/goal-tracking/spec.md) - Goal setting and projections
  - [Investment Calculators Spec](openspec/specs/investment-calculators/spec.md) - ASB, EPF, Tabung Haji calculators
  - [Achievement System Spec](openspec/specs/achievement-system/spec.md) - Gamification and badges
  - [Dashboard Overview Spec](openspec/specs/dashboard-overview/spec.md) - Main dashboard features
  - [User Authentication Spec](openspec/specs/user-authentication/spec.md) - Login and security
  - [Notification System Spec](openspec/specs/notification-system/spec.md) - Alerts and reminders
  - [Help System Spec](openspec/specs/help-system/spec.md) - FAQ and onboarding
  - [Data Export Spec](openspec/specs/data-export/spec.md) - CSV export functionality

### Development Guides
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Security Policy](SECURITY.md)** - Security guidelines and reporting
- **[Migration Guidelines](MIGRATION_GUIDELINES.md)** - Database migration best practices
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

### Technical Documentation
- **Database Schema**: See `supabase/migrations/` for complete schema
- **API Reference**: Supabase client integration patterns
- **RLS Policies**: Row-level security implementation details
- **Type Definitions**: `src/types/database.ts` for TypeScript types

### Getting Help
- Check the in-app Help Center (comprehensive FAQ)
- Review OpenSpec documentation for feature details
- Search existing GitHub issues
- Submit feedback through the in-app form

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

Need help? Have questions?
- Check the Help Center in the app
- Create an issue on GitHub
- Submit feedback through the in-app form

## 🗺️ Roadmap

### ✅ MVP 1 (Completed)
- ✅ Core account tracking with Malaysian investment types
- ✅ Goal management with templates and projections
- ✅ Malaysian investment calculators (ASB, EPF, Tabung Haji)
- ✅ Help system and interactive onboarding
- ✅ Feedback collection system
- ✅ Achievement and badge system
- ✅ Notification and reminder system
- ✅ Data export functionality
- ✅ **Admin panel with user management**
- ✅ **System configuration management**
- ✅ **Audit logging and security**

### 🔄 Version 2 (Planned)
- 🔄 Enhanced analytics and reporting
  - Monthly financial summaries
  - Spending trends analysis
  - Net worth growth charts
  - Goal progress reports
  
- 🔄 Transaction history tracking
  - Income and expense categorization
  - Transaction search and filtering
  - Recurring transaction templates
  - CSV import for transactions
  
- 🔄 Budget management
  - Category-based budgets
  - Budget vs. actual tracking
  - Overspending alerts
  - Monthly budget reports

### 🚀 Future Plans
- � Mobile app (React Native)
  - iOS and Android support
  - Offline mode
  - Push notifications
  - Biometric authentication
  
- 👨‍👩‍👧‍� Family account sharing
  - Multi-user households
  - Shared goals and accounts
  - Permission-based access
  - Family financial overview
  
- 🤖 Advanced features
  - Automated balance imports (via banking APIs if available)
  - AI-powered financial insights
  - Investment portfolio optimization
  - Tax calculation helpers
  
- 🌐 Localization
  - Bahasa Malaysia interface
  - Multi-currency support
  - Regional investment products
  
- � Advanced analytics
  - Asset allocation visualization
  - Risk assessment tools
  - Retirement planning simulator
  - What-if scenario modeling

## 💡 Why This Project?

Malaysia has unique investment products like ASB, EPF, and Tabung Haji that aren't well-supported by international finance apps. This platform is built specifically for Malaysians to track these investments alongside traditional savings and investment accounts.

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for Malaysians**

Start tracking your financial journey today!
