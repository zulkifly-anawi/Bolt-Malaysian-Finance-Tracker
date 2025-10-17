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
