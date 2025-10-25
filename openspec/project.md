# Project Context

## Purpose
Malaysian Financial Tracker is a comprehensive financial tracking platform built specifically for Malaysians to manage their investments, savings, and financial goals. The app helps users track Malaysian-specific investment vehicles (ASB, EPF, Tabung Haji) alongside traditional accounts, set financial goals, and visualize their progress with smart insights and projections.

**Key Goals:**
- Provide a centralized dashboard for all Malaysian financial accounts
- Enable goal-based financial planning with automatic progress tracking
- Offer Malaysian-specific investment calculators (ASB dividends, EPF retirement, Tabung Haji)
- Gamify financial tracking with achievements and engagement features
- Ensure data privacy and security with Row Level Security (RLS)

## Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety and better DX
- **Vite 5.4.2** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first styling with custom glassmorphism design
- **Lucide React 0.344.0** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL 17 database with Row Level Security (RLS)
  - Authentication (email/password)
  - Real-time subscriptions for notifications
  - Storage for future features
- **Supabase CLI 2.51.0+** - Local development and migrations

### Development Tools
- **ESLint 9.9.1** - Linting with React hooks plugin
- **TypeScript ESLint 8.3.0** - TypeScript-specific linting
- **PostCSS + Autoprefixer** - CSS processing
- **Docker (via Supabase)** - Local PostgreSQL instance

## Project Conventions

### Code Style

**TypeScript:**
- Use TypeScript for all code - no JavaScript files
- Define proper types and interfaces in `src/types/`
- Avoid `any` type - use `unknown` or proper typing
- Use meaningful variable and function names in camelCase
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks and short functions
- Export types alongside components when needed

**React:**
- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components small and focused (single responsibility)
- Extract complex logic into custom hooks in `src/hooks/`
- Use `useState` for local state, Context for shared state
- Prefer composition over prop drilling
- Component file structure: imports → interfaces → component → exports

**Naming Conventions:**
- Components: PascalCase (e.g., `EnhancedDashboard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`, `useConfig.ts`)
- Utilities: camelCase (e.g., `formatters.ts`, `achievementChecker.ts`)
- Services: camelCase with 'Service' suffix (e.g., `adminConfigService.ts`)
- Types/Interfaces: PascalCase (e.g., `Goal`, `Account`, `Achievement`)
- Constants: SCREAMING_SNAKE_CASE or camelCase depending on usage

**File Organization:**
```
src/
  components/          # React components
    [feature]/         # Feature-specific components
    common/            # Shared/reusable components
  contexts/            # React contexts for state management
  hooks/               # Custom React hooks
  lib/                 # Third-party library configurations
  services/            # Business logic and API services
  types/               # TypeScript type definitions
  utils/               # Pure utility functions
```

### Architecture Patterns

**Component Architecture:**
- **Atomic Design Principles**: Build from atoms → molecules → organisms → pages
- **Smart vs Presentational**: Separate data-fetching (smart) from display (presentational)
- **Container Pattern**: Use wrapper components for data fetching and state management
- **Composition**: Build complex UIs by composing smaller components

**State Management:**
- **Local State**: Use `useState` for component-specific state
- **Shared State**: Use React Context (`AuthContext`) for app-wide state
- **Server State**: Fetch from Supabase, store in component state
- **No Redux**: Keep it simple with React's built-in state management

**Data Fetching:**
- Use Supabase client directly in components or custom hooks
- Handle loading, error, and success states explicitly
- Implement optimistic updates where appropriate
- Use real-time subscriptions for notifications

**Security Architecture:**
- Row Level Security (RLS) enforced at database level
- `authenticated` role for logged-in users
- `is_admin()` function for admin authorization checks
- Admin override policies for privileged operations
- Security Definer functions for privileged operations

**Database Patterns:**
- All tables have `user_id` foreign key to `auth.users`
- Timestamps: `created_at`, `updated_at` with triggers
- Soft deletes where audit trail needed
- JSONB for flexible metadata storage
- Indexes on frequently queried columns

### Testing Strategy

**Current State:**
- Manual testing in development
- Type checking via `npm run typecheck`
- ESLint for code quality

**Future Goals:**
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical user flows
- Visual regression testing

### Git Workflow

**Branching Strategy:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring

**Commit Convention (Conventional Commits):**
```
type(scope): subject

body (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(accounts): add cryptocurrency tracking support
fix(goals): correct progress calculation for multi-account goals
docs(readme): update installation instructions
refactor(dashboard): extract account card into separate component
```

**Pull Request Process:**
1. Create feature branch from `develop`
2. Make changes with clear commits
3. Test thoroughly (build, typecheck, manual testing)
4. Update documentation if needed
5. Create PR to `develop` (not `main`)
6. Code review and approval
7. Merge to `develop`
8. Periodically merge `develop` to `main` for releases

## Domain Context

### Malaysian Financial Instruments

**ASB (Amanah Saham Bumiputera):**
- Fixed-price unit trust (RM 1.00 per unit)
- Annual dividends (historically 4-7%)
- Units held = Current balance (1:1 ratio)
- Track via `units_held` field

**EPF (Employees Provident Fund):**
- Malaysia's retirement savings scheme
- Two accounts: Account 1 (retirement), Account 2 (housing/education/medical)
- Conventional vs Shariah schemes with different dividend rates
- Employer (12-13%) + Employee (11%) contributions
- Track via contribution percentages and rate method

**Tabung Haji:**
- Islamic savings and pilgrimage fund
- For hajj savings and general Islamic investment
- Annual dividend distribution
- Track via account balance and dividend projections

### Financial Goal Types
- **Emergency Fund** - 3-6 months expenses
- **Home Downpayment** - Property purchase
- **Car Downpayment** - Vehicle purchase
- **Education Fund** - Children's education
- **Hajj Fund** - Pilgrimage savings
- **Umrah Fund** - Minor pilgrimage
- **Retirement Fund** - Post-work life
- **Wedding Fund** - Marriage expenses

### Achievement System
- Milestone-based achievements (First RM10k, RM50k, RM100k)
- Goal-based achievements (Goal Crusher, Family Planner)
- Account diversity achievements (Diversified Investor)
- Malaysian-specific achievements (Hajj Ready at RM45k+)

## Important Constraints

### Technical Constraints
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Responsive**: Must work on phones, tablets, and desktops
- **Performance**: Initial page load < 3 seconds
- **Database**: PostgreSQL 17 via Supabase (no direct DB access)
- **Authentication**: Supabase Auth only (no custom auth)

### Security Constraints
- **RLS Required**: All tables must have Row Level Security enabled
- **User Isolation**: Users can only see their own data
- **Admin Access**: Admin functions protected by `is_admin()` checks
- **No Sensitive Data**: Never store passwords or financial credentials
- **Environment Variables**: All secrets in .env (never commit)

### Business Constraints
- **Malaysian Focus**: Features and terminology specific to Malaysia
- **Currency**: Malaysian Ringgit (RM) only
- **Language**: English UI with Malaysian context
- **Free to Use**: No payment processing or subscriptions (currently)
- **Privacy First**: User data belongs to user, exportable anytime

### Regulatory Constraints
- **Data Privacy**: Comply with Malaysian PDPA (Personal Data Protection Act)
- **Financial Data**: No actual trading or transactions (tracking only)
- **No Financial Advice**: App provides calculations, not financial advice

## External Dependencies

### Core Services
- **Supabase** (qfehznigeuukdsffxekv)
  - PostgreSQL database with RLS
  - Authentication service
  - Real-time subscriptions
  - Row Level Security
  - API: REST and GraphQL endpoints

### Development Services
- **GitHub** - Version control and CI/CD
- **Vercel/Netlify** - Deployment platform (recommended)
- **npm** - Package management

### Third-Party Libraries
- **@supabase/supabase-js** - Supabase client SDK
- **lucide-react** - Icon library (avoid icons blocked by ad-blockers)
- **React** - UI framework
- **Tailwind CSS** - Styling framework

### APIs & Data Sources
- **Historical Dividend Data**:
  - ASB dividend rates stored in `asb_dividend_history` table
  - EPF dividend rates stored in `epf_dividend_history` table
  - Updated manually via admin panel or migrations

### Infrastructure
- **Local Development**:
  - Docker (via Supabase CLI) for local PostgreSQL
  - Ports: 54321 (API), 54322 (PostgreSQL), 54323 (Studio)
- **Production**:
  - Supabase hosted in Singapore region
  - CDN for static assets (via deployment platform)

### Migration Management
- **Supabase CLI** - Database migration tool
- **Migration Files**: `supabase/migrations/*.sql`
- **Migration Naming**: `YYYYMMDDHHMMSS_descriptive_name.sql`
- **Idempotency**: All migrations must be idempotent (can run multiple times safely)
- **Cloud Sync**: Migrations pushed to cloud via `supabase db push`
