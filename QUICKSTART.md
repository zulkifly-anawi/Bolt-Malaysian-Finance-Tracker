# Quick Start Guide

Get your Malaysian Financial Tracker up and running in minutes!

## 🚀 Super Quick Setup (5 minutes)

### 1. Get the Code
```bash
git clone https://github.com/yourusername/malaysian-finance-tracker.git
cd malaysian-finance-tracker
npm install
```

### 2. Set Up Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings > API
4. Copy your URL and anon key

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

### 4. Set Up Database
In Supabase SQL Editor, run each migration file from `supabase/migrations/` in order.

Or use Supabase CLI:
```bash
npm install -g supabase
supabase link --project-ref your-project-ref
supabase db push
```

### 5. Start the App
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## ✅ That's It!

You should now see the landing page. Click "Get Started Free" to create your account!

## 📱 First Steps After Login

1. **Complete the onboarding tour** - Learn the basics
2. **Add your first account** - ASB, EPF, or savings
3. **Set a financial goal** - Use a template or create custom
4. **Explore the calculators** - Check investment projections

## 🆘 Having Issues?

### App won't start?
- Check Node.js version: `node --version` (need 18+)
- Delete `node_modules` and run `npm install` again

### Database errors?
- Verify Supabase credentials in `.env`
- Make sure all migrations are applied
- Check Supabase project is running

### Build fails?
- Run `npm run typecheck` to see TypeScript errors
- Check all dependencies installed: `npm install`

## 📚 Next Steps

- Read the full [README.md](README.md)
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Review [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute

## 💡 Tips

- Update account balances monthly for accurate projections
- Use goal templates for quick setup
- Enable notifications for reminders
- Export your data regularly as backup

## 🎉 You're Ready!

Start tracking your financial journey today!

Need help? Check the Help Center in the app or create an issue on GitHub.
