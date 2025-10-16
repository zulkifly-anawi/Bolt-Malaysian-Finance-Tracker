# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-16

### MVP 1 Release

#### Added

**Core Features**
- Multi-account tracking system for Malaysian investments
- Support for ASB (Amanah Saham Bumiputera) accounts
- Support for EPF (Employees Provident Fund) accounts
- Support for Tabung Haji accounts
- Support for savings accounts, fixed deposits, and other investments
- Financial goal setting and tracking
- Goal templates for common Malaysian savings targets
- Account allocation to goals with percentage splits
- Progress tracking with visual indicators

**Malaysian Investment Tools**
- ASB Calculator with dividend projections based on historical rates
- EPF Calculator with retirement age estimations
- Tabung Haji Tracker with hibah projections
- Unit-based tracking for investment accounts
- Monthly contribution tracking

**User Interface**
- Modern glassmorphism design with smooth animations
- Fully responsive design for mobile, tablet, and desktop
- Beautiful gradient backgrounds and card layouts
- Interactive charts and progress indicators
- Dark theme optimized for readability

**User Experience**
- Interactive 4-step onboarding tour for new users
- Comprehensive Help Center with 20+ FAQs
- Search functionality in Help Center
- Category filtering for help topics
- Context-sensitive floating help button
- Help tooltips throughout the app
- Landing page with feature showcase
- Privacy Policy page

**Engagement Features**
- Achievement system with badges
- User achievements tracking
- Notifications for goal milestones
- Smart insights and personalized tips
- Data export in CSV and JSON formats
- Feedback collection system with ratings
- Balance update reminders

**Security & Privacy**
- Supabase authentication with email/password
- Row Level Security (RLS) on all database tables
- Encrypted data in transit and at rest
- Secure user profiles with privacy controls
- No third-party data sharing
- Manual tracking only (no bank account connections)

**Database Schema**
- Complete relational database structure
- User profiles table
- Accounts table with support for multiple types
- Goals table with categories
- Account-goal allocation junction table
- Balance history tracking
- Achievements system tables
- Notifications and reminders tables
- Feedback collection table
- Goal templates and dividend history tables

#### Technical Details

**Tech Stack**
- React 18.3.1 with TypeScript
- Vite 5.4.2 for build tooling
- Tailwind CSS for styling
- Supabase for backend (PostgreSQL + Auth)
- Lucide React for icons

**Performance**
- Optimized bundle size (422 KB gzipped)
- Fast page loads with code splitting
- Efficient re-renders with React hooks
- Indexed database queries for performance

**Code Quality**
- Full TypeScript coverage
- ESLint configuration
- Organized component structure
- Reusable utility functions
- Type-safe database queries

#### Documentation
- Comprehensive README with setup instructions
- Contributing guidelines (CONTRIBUTING.md)
- MIT License
- Environment variable examples (.env.example)
- Database schema documentation
- Code comments for complex logic

#### Known Limitations
- Manual balance updates required (no automatic bank syncing)
- Limited to email/password authentication
- Single user accounts (no family sharing yet)
- Basic transaction history tracking
- No budget management features yet

### Future Roadmap

See [README.md](README.md#roadmap) for planned features in upcoming releases.

---

## Version History Format

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing features

#### Deprecated
- Features that will be removed in future versions

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements or vulnerability fixes

---

[1.0.0]: https://github.com/yourusername/malaysian-finance-tracker/releases/tag/v1.0.0
