# Malaysian Financial Tracker

A comprehensive financial tracking platform built specifically for Malaysians to manage their investments, savings, and financial goals. Track your ASB, EPF, Tabung Haji, and other accounts with beautiful visualizations and smart insights.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## 🚀 Features

### Core Features
- **Multi-Account Tracking**: Monitor all your financial accounts in one place
  - ASB (Amanah Saham Bumiputera)
  - EPF (Employees Provident Fund)
  - Tabung Haji
  - Savings accounts, fixed deposits, unit trusts, and more

- **Goal Setting & Tracking**: Set financial goals and track progress automatically
  - Malaysian goal templates (home, education, hajj, retirement)
  - Visual progress indicators
  - Account allocation to goals
  - Projected completion dates

- **Malaysian Investment Calculators**:
  - **ASB Calculator**: Project dividend earnings based on historical rates
  - **EPF Calculator**: Estimate retirement savings with contribution tracking
  - **Tabung Haji Tracker**: Monitor hajj savings with dividend projections

### Engagement Features
- **Achievements & Badges**: Earn rewards for consistent tracking
- **Smart Insights**: Personalized financial recommendations
- **Notifications**: Goal milestones and balance update reminders
- **Data Export**: Export your data in CSV format

### User Experience
- **Interactive Onboarding**: 4-step guided tour for new users
- **Help Center**: Comprehensive FAQ with search functionality
- **Context-Sensitive Help**: Floating help button with tips
- **Beautiful UI**: Modern glassmorphism design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (Email/Password)
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Netlify, or any static host

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

The migrations in `supabase/migrations/` need to be applied to your Supabase project:

1. Install Supabase CLI: `npm install -g supabase`
2. Link to your project: `supabase link --project-ref your-project-ref`
3. Apply migrations: `supabase db push`

Or manually run each SQL file in the Supabase SQL Editor.

### 6. Start Development Server

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
- `profiles` - User profile information
- `accounts` - Financial accounts (ASB, EPF, etc.)
- `goals` - Financial goals and targets
- `account_goals` - Link accounts to goals with allocation percentages
- `balance_entries` - Historical balance tracking

### Engagement Tables
- `achievements_definitions` - Available achievements
- `user_achievements` - User-earned achievements
- `notifications` - User notifications
- `reminders` - Scheduled reminders
- `user_feedback` - User feedback submissions

### Reference Tables
- `goal_templates` - Pre-configured goal templates
- `account_types` - Account type definitions
- `dividend_history` - Historical dividend rates for Malaysian investments

## 🔐 Security

- **Row Level Security (RLS)**: All tables use RLS policies
- **Encrypted Data**: Data encrypted in transit and at rest
- **Secure Authentication**: Powered by Supabase Auth
- **No Third-Party Access**: Your financial data never leaves Supabase
- **Manual Tracking Only**: We never connect to your actual bank accounts

## 🎨 Key Design Principles

- **Malaysian-First**: Built for Malaysian investment products
- **Privacy-Focused**: Your data belongs to you
- **Beautiful UI**: Modern glassmorphism design
- **Mobile Responsive**: Works on all screen sizes
- **Accessible**: Following WCAG guidelines

## 📱 Features in Detail

### Account Management
Add and track multiple accounts with detailed information:
- Current balance
- Monthly contributions
- Dividend/interest rates
- Institution details
- Historical balance tracking

### Goal Projections
Smart projections that calculate:
- Estimated completion date
- Required monthly savings
- Account performance impact
- Progress tracking

### Malaysian Investment Tools
Specialized calculators for:
- **ASB**: Unit-based tracking with dividend projections
- **EPF**: Retirement age calculations with contribution tracking
- **Tabung Haji**: Hajj savings with hibah projections

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

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Database Schema](docs/DATABASE.md) - Complete database documentation
- [API Reference](docs/API.md) - Supabase integration details
- [User Guide](docs/USER_GUIDE.md) - How to use the platform

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

### MVP 1 (Current)
- ✅ Core account tracking
- ✅ Goal management
- ✅ Malaysian investment calculators
- ✅ Help system and onboarding
- ✅ Feedback collection

### Future Plans
- 🔄 Family account sharing
- 🔄 Transaction history tracking
- 🔄 Budget management
- 🔄 Expense categorization
- 🔄 Mobile app (React Native)
- 🔄 Automated balance imports
- 🔄 Advanced analytics and reports

## 💡 Why This Project?

Malaysia has unique investment products like ASB, EPF, and Tabung Haji that aren't well-supported by international finance apps. This platform is built specifically for Malaysians to track these investments alongside traditional savings and investment accounts.

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for Malaysians**

Start tracking your financial journey today!
