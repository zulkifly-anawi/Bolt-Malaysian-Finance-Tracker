# Deployment Guide

This guide covers deploying the Malaysian Financial Tracker to production.

## Prerequisites

Before deploying, ensure you have:
- A Supabase project set up with migrations applied
- Environment variables configured
- The app builds successfully (`npm run build`)

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers zero-configuration deployment for Vite apps.

#### Steps:

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables in Vercel dashboard

3. **Deploy via CLI**
   ```bash
   vercel
   ```

4. **Environment Variables**
   Add these in Vercel dashboard (Settings > Environment Variables):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Custom Domain** (optional)
   - Go to Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

#### Vercel Configuration

Create `vercel.json` in root (optional):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Option 2: Netlify

#### Steps:

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Add in Site settings > Environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

#### Netlify Configuration

The `dist/_redirects` file is already configured for SPA routing:
```
/*    /index.html   200
```

---

### Option 3: GitHub Pages

#### Steps:

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     base: '/repository-name/',
     // ... rest of config
   })
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   # Install gh-pages
   npm install -g gh-pages

   # Deploy to gh-pages branch
   gh-pages -d dist
   ```

4. **Configure GitHub Pages**
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: gh-pages
   - Folder: / (root)

**Note:** Environment variables need to be built into the app at build time for GitHub Pages.

---

### Option 4: Self-Hosted

#### Using Node.js Server

1. **Install serve**
   ```bash
   npm install -g serve
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Serve**
   ```bash
   serve -s dist -l 3000
   ```

#### Using nginx

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Copy to nginx**
   ```bash
   sudo cp -r dist/* /var/www/html/
   ```

3. **Configure nginx**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /var/www/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

4. **Restart nginx**
   ```bash
   sudo systemctl restart nginx
   ```

---

## Database Setup

### Supabase Configuration

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Apply Migrations**

   **Option A: Supabase CLI**
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

   **Option B: Manual SQL Editor**
   - Open Supabase SQL Editor
   - Run each migration file in order from `supabase/migrations/`

3. **Verify Tables**
   - Go to Table Editor
   - Confirm all tables are created
   - Check RLS policies are enabled

4. **Get API Keys**
   - Project Settings > API
   - Copy Project URL and anon/public key

---

## Environment Variables

### Production Environment

Required environment variables:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Adding to Different Platforms

**Vercel:**
- Dashboard > Settings > Environment Variables

**Netlify:**
- Site settings > Environment variables

**GitHub Actions:**
- Repository Settings > Secrets > Actions

---

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Can create accounts
- [ ] Can create goals
- [ ] Data persists correctly
- [ ] Help Center loads
- [ ] Feedback form works
- [ ] Privacy Policy displays
- [ ] Onboarding tour appears for new users
- [ ] Mobile responsive design works
- [ ] All calculators function correctly
- [ ] Data export works
- [ ] HTTPS is enabled
- [ ] Custom domain is configured (if applicable)

---

## Performance Optimization

### Build Optimization

Already configured in `vite.config.ts`:
- Code splitting
- Asset optimization
- Minification

### CDN Configuration

For better performance:
1. Use Vercel/Netlify CDN (automatic)
2. Enable gzip compression (automatic)
3. Set appropriate cache headers

### Supabase Edge Functions

If using edge functions:
```bash
supabase functions deploy function-name
```

---

## Monitoring & Analytics

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage stats

### Performance Monitoring

- Vercel Analytics (if using Vercel)
- Lighthouse CI for performance checks
- Core Web Vitals monitoring

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Rollback Procedure

### Vercel
- Go to Deployments
- Click on previous deployment
- Click "Promote to Production"

### Netlify
- Go to Deploys
- Click on previous deploy
- Click "Publish deploy"

### Manual
```bash
git revert HEAD
git push origin main
```

---

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run typecheck`

### App Loads But Features Don't Work
- Verify Supabase URL and keys are correct
- Check browser console for errors
- Verify database migrations are applied
- Check RLS policies are correct

### Database Connection Issues
- Verify Supabase project is running
- Check API keys are correct
- Ensure RLS policies allow access

---

## Security Considerations

1. **Never commit** `.env` file
2. **Use environment variables** for all secrets
3. **Enable HTTPS** (automatic on Vercel/Netlify)
4. **Set up proper CORS** if needed
5. **Regular security updates** for dependencies

---

## Support

Need help with deployment?
- Check [Supabase Docs](https://supabase.com/docs)
- Check [Vercel Docs](https://vercel.com/docs)
- Create an issue on GitHub
- Use in-app feedback form

---

**Your app is now ready for production! 🚀**
