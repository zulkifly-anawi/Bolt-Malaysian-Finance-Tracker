# Contributing to Malaysian Financial Tracker

Thank you for your interest in contributing to the Malaysian Financial Tracker! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)

### Suggesting Features

Feature suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this feature would be useful
- Consider including mockups or examples

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test thoroughly** - ensure the app builds and works
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Workflow

### Setting Up Your Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/malaysian-finance-tracker.git
cd malaysian-finance-tracker

# Install dependencies
npm install

# Create a .env file with your Supabase credentials
cp .env.example .env

# Start development server
npm run dev
```

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring

### Commit Message Guidelines

We follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(accounts): add support for cryptocurrency tracking
fix(goals): correct progress calculation for multi-account goals
docs(readme): update installation instructions
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Follow the existing component structure

### File Organization

```
src/
├── components/       # React components
│   ├── accounts/    # Account-related components
│   ├── goals/       # Goal-related components
│   ├── help/        # Help system components
│   └── ...
├── contexts/        # React contexts
├── lib/             # Third-party integrations
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Styling

- Use Tailwind CSS classes
- Follow the glassmorphism design system
- Maintain consistent spacing and colors
- Ensure responsive design (mobile-first)

### Database Changes

If your contribution requires database changes:

1. Create a new migration file in `supabase/migrations/`
2. Name it with timestamp: `YYYYMMDDHHMMSS_description.sql`
3. Include clear comments explaining the changes
4. Update the README's database schema section
5. Follow the [MIGRATION_GUIDELINES.md](MIGRATION_GUIDELINES.md) for best practices

## Testing Guidelines

We take code quality seriously. Before submitting your contribution, ensure all tests pass and your code meets our standards.

### Pre-Submission Checklist

Run these commands before submitting a PR:

```bash
# 1. Type checking - Ensure no TypeScript errors
npm run typecheck

# 2. Build test - Verify production build works
npm run build

# 3. Lint check - Ensure code style compliance
npm run lint
```

All three commands must pass without errors.

### Testing Your Changes

#### Manual Testing

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test the following scenarios:**
   - User registration and login flow
   - Account creation (ASB, EPF, Tabung Haji, Savings)
   - Goal creation and linking to accounts
   - Data export functionality
   - Mobile responsiveness (use browser dev tools)

3. **For admin features:**
   - Verify RLS policies work (users can't access others' data)
   - Test admin panel functionality if applicable
   - Check audit logging for admin actions

#### Database Testing

If you modified the database schema:

1. **Test migrations locally:**
   ```bash
   # Apply your migration
   supabase db reset
   
   # Or apply specific migration
   supabase db execute --file supabase/migrations/YOUR_MIGRATION.sql
   ```

2. **Verify data integrity:**
   - Check that existing data isn't corrupted
   - Test that new columns/tables work as expected
   - Verify RLS policies prevent unauthorized access

3. **Test rollback (if applicable):**
   - Ensure data can be safely migrated back if needed

#### Component Testing

When creating or modifying components:

- ✅ Test with empty state (no data)
- ✅ Test with maximum data (many accounts/goals)
- ✅ Test error states (API failures, invalid inputs)
- ✅ Test loading states
- ✅ Test on different screen sizes (mobile, tablet, desktop)
- ✅ Test keyboard navigation and accessibility

### What to Test Based on Change Type

| Change Type | What to Test |
|-------------|--------------|
| **New Feature** | End-to-end user flow, edge cases, error handling |
| **Bug Fix** | Original bug is fixed, no regression in related features |
| **UI Change** | Responsive on all devices, accessibility, color contrast |
| **Performance** | Load times, re-render counts, bundle size impact |
| **Database** | Migration succeeds, RLS works, data integrity maintained |

### TypeScript Best Practices

- **No `any` types** - Use proper types or `unknown`
- **Define interfaces** - Create types in `src/types/database.ts`
- **Type guards** - Use `instanceof` or type predicates for unknowns
- **Error handling** - Use `catch (err: unknown)` with proper type checks

Example:
```typescript
// ❌ Bad
catch (err: any) {
  setError(err.message);
}

// ✅ Good
catch (err: unknown) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

### Common Issues to Check

Before submitting, verify:

- [ ] No console errors in browser
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] App builds successfully (`npm run build`)
- [ ] No sensitive data in commits (API keys, passwords)
- [ ] Environment variables documented in `.env.example`
- [ ] Changes work in both light and dark themes (if UI changes)
- [ ] All new functions have proper TypeScript types
- [ ] useEffect dependencies are correct (no missing deps)

### Performance Considerations

- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive calculations
- Avoid unnecessary re-renders
- Keep bundle size in check (check `dist/` folder size)

### Testing

Before submitting:

```bash
# Type check
npm run typecheck

# Build test
npm run build

# Lint check
npm run lint
```

## Project Structure

```
malaysian-finance-tracker/
├── src/
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── lib/                 # Third-party integrations
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── dist/                    # Production build
└── ...config files
```

## What to Contribute

### High Priority

- Bug fixes
- Performance improvements
- Accessibility improvements
- Mobile responsiveness fixes
- Documentation improvements

### Feature Requests

Check the [Roadmap](README.md#roadmap) in the README for planned features.

### Good First Issues

Look for issues labeled `good-first-issue` for beginner-friendly contributions.

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow the code of conduct

## Questions?

- Check the [Help Center](docs/USER_GUIDE.md)
- Open a discussion on GitHub
- Submit feedback through the in-app form

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Malaysian Financial Tracker!
