# Help System

## Overview
Comprehensive help system with FAQ, contextual help, onboarding tours, and user feedback submission.

## Requirements

### Requirement: FAQ System
The system SHALL provide frequently asked questions organized by topic.

#### Scenario: Display FAQ page
- **WHEN** user opens help section
- **THEN** system displays FAQ organized into categories:
  - Getting Started
  - Accounts Management
  - Goals and Planning
  - Investment Calculators
  - Malaysian Financial Instruments (ASB, EPF, Tabung Haji)
  - Achievements and Notifications
  - Data Export and Privacy
  - Troubleshooting
- **AND** shows question count per category
- **AND** allows expanding/collapsing sections

#### Scenario: Search FAQ
- **WHEN** user enters search query in FAQ
- **THEN** system filters questions by keyword
- **AND** highlights matching text
- **AND** shows relevant questions across all categories
- **AND** displays "No results found" if no matches

#### Scenario: View FAQ answer
- **WHEN** user clicks FAQ question
- **THEN** system expands answer section
- **AND** displays detailed explanation with formatting
- **AND** includes links to related features
- **AND** shows "Was this helpful?" feedback buttons

### Requirement: Contextual Help
The system SHALL provide help content relevant to current page/feature.

#### Scenario: Floating help button
- **WHEN** user is on any page
- **THEN** system displays floating "?" help button in corner
- **AND** clicking opens help panel
- **AND** shows help specific to current page
- **AND** provides quick tips and common actions

#### Scenario: Page-specific help
- **WHEN** user on accounts page
- **THEN** help panel shows:
  - How to add accounts
  - Account types explained
  - How to update balances
  - ASB units sync feature
- **WHEN** user on goals page
- **THEN** help panel shows:
  - How to create goals
  - Goal templates explained
  - How to track progress
  - Account allocation feature

#### Scenario: Feature tooltips
- **WHEN** user hovers over unfamiliar feature
- **THEN** system displays tooltip with brief explanation
- **AND** shows keyboard shortcut if applicable
- **AND** auto-dismisses after 3 seconds or on click

### Requirement: Onboarding Tour
The system SHALL guide new users through key features.

#### Scenario: First-time user onboarding
- **WHEN** user logs in for first time
- **THEN** system displays welcome modal
- **AND** offers guided tour option
- **AND** allows skip/take tour later
- **AND** sets onboarding_completed flag after completion

#### Scenario: Interactive tour steps
- **WHEN** user starts tour
- **THEN** system highlights UI elements in sequence:
  1. Dashboard overview
  2. Add first account button
  3. Create first goal button
  4. Investment calculator menu
  5. Achievements page
  6. Help button location
- **AND** displays overlay with explanatory text
- **AND** provides Next/Back/Skip buttons
- **AND** allows clicking highlighted element

#### Scenario: Tour completion
- **WHEN** user completes tour
- **THEN** system sets user_settings.onboarding_completed = true
- **AND** awards "First Steps" achievement if first account created
- **AND** displays "You're all set!" message
- **AND** closes tour overlay

### Requirement: User Feedback Submission
The system SHALL allow users to submit feedback, bug reports, and feature requests.

#### Scenario: Open feedback form
- **WHEN** user clicks "Send Feedback" button
- **THEN** system displays feedback modal
- **AND** shows feedback type selector (Bug, Feature Request, General)
- **AND** shows text area for message (max 1000 chars)
- **AND** optionally captures current page URL
- **AND** shows submission button

#### Scenario: Submit bug report
- **WHEN** user submits bug report
- **THEN** system validates message is not empty
- **AND** creates user_feedback record with:
  - user_id
  - feedback_type = 'bug'
  - message
  - current_page
  - submitted_at
  - status = 'new'
- **AND** displays "Thank you! We'll review your report" message
- **AND** clears form

#### Scenario: Submit feature request
- **WHEN** user submits feature request
- **THEN** system saves to user_feedback with type='feature'
- **AND** thanks user for suggestion
- **AND** mentions admin will review

#### Scenario: Feedback from FAQ
- **WHEN** user marks FAQ as "Not Helpful"
- **THEN** system opens feedback form
- **AND** pre-fills with context: "FAQ question X was not helpful"
- **AND** prompts for additional details

### Requirement: Malaysian Finance Education
The system SHALL provide educational content about Malaysian financial instruments.

#### Scenario: ASB information
- **WHEN** user views ASB help
- **THEN** system explains:
  - What is Amanah Saham Bumiputera
  - Historical dividend rates (5-7.75%)
  - Who can invest (Bumiputera)
  - How to track ASB accounts
  - Unit price synchronization

#### Scenario: EPF information
- **WHEN** user views EPF help
- **THEN** system explains:
  - Employees Provident Fund overview
  - Contribution rates (11% employee, 13% employer)
  - Account 1 vs Account 2 (70/30 split)
  - Conventional vs Shariah schemes
  - Dividend rates and projections
  - Retirement planning with EPF

#### Scenario: Tabung Haji information
- **WHEN** user views Tabung Haji help
- **THEN** system explains:
  - Purpose (Hajj savings fund)
  - Dividend rates (historically 4-5.5%)
  - Hajj cost estimates (~RM 45,000)
  - How to plan for Hajj
  - Using calculator for projections

### Requirement: Help Content Management
The system SHALL allow admins to update help content.

#### Scenario: Edit FAQ
- **WHEN** admin edits FAQ content
- **THEN** system updates FAQ entry
- **AND** supports markdown formatting
- **AND** maintains version history (optional)
- **AND** publishes immediately

#### Scenario: Add new FAQ
- **WHEN** admin adds FAQ
- **THEN** system prompts for:
  - Question text
  - Answer (markdown)
  - Category
  - Keywords (for search)
  - Sort order
- **AND** makes immediately visible to users

### Requirement: Help Accessibility
The system SHALL make help easily accessible throughout app.

#### Scenario: Help menu
- **WHEN** user opens app menu
- **THEN** system shows "Help & Support" option
- **AND** links to FAQ page
- **AND** links to feedback form
- **AND** links to tutorials
- **AND** shows keyboard shortcut (? key)

#### Scenario: Keyboard shortcut
- **WHEN** user presses "?" key
- **THEN** system opens help panel
- **AND** shows contextual help for current page
- **AND** works from any screen

#### Scenario: Empty state help
- **WHEN** user views empty state (no accounts/goals)
- **THEN** system displays helpful message
- **AND** shows "Get Started" tutorial link
- **AND** provides direct action buttons
- **AND** explains next steps

## Technical Details

### Database Schema
```sql
faq_entries table (admin-managed):
  - id: uuid (primary key)
  - question: text
  - answer: text (markdown)
  - category: text
  - keywords: text[] (for search)
  - sort_order: integer
  - is_published: boolean (default true)
  - created_at: timestamp
  - updated_at: timestamp

user_feedback table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users)
  - feedback_type: text ('bug', 'feature', 'general')
  - message: text
  - current_page: text (nullable)
  - status: text ('new', 'reviewed', 'resolved')
  - admin_notes: text (nullable)
  - submitted_at: timestamp
  - reviewed_at: timestamp (nullable)
  - INDEX on (status, submitted_at)
```

### User Settings for Onboarding
```sql
user_settings table includes:
  - onboarding_completed: boolean (default false)
  - tour_step: integer (nullable, for resuming)
  - dismissed_tours: text[] (array of tour IDs user skipped)
```

### Implementation Files
- `src/components/help/FAQPage.tsx` - Main FAQ display
- `src/components/help/HelpPanel.tsx` - Floating help panel
- `src/components/help/FeedbackForm.tsx` - Feedback submission
- `src/components/help/OnboardingTour.tsx` - Interactive tour
- `src/components/help/MalaysianFinanceGuide.tsx` - Educational content
- `src/components/help/ContextualHelp.tsx` - Page-specific help
- `src/hooks/useOnboarding.ts` - Onboarding state management

### FAQ Categories and Examples
```typescript
const faqCategories = [
  {
    name: 'Getting Started',
    questions: [
      { q: 'How do I create my first account?', a: '...' },
      { q: 'What is the difference between account types?', a: '...' },
      { q: 'How do I set up my first goal?', a: '...' }
    ]
  },
  {
    name: 'Malaysian Instruments',
    questions: [
      { q: 'What is ASB and how do I track it?', a: '...' },
      { q: 'How does the EPF calculator work?', a: '...' },
      { q: 'What are the current dividend rates?', a: '...' }
    ]
  },
  // ... more categories
];
```

### Onboarding Tour Steps
```typescript
const onboardingSteps = [
  {
    target: '#dashboard',
    title: 'Welcome to Your Dashboard',
    content: 'This is your financial command center. Here you'll see an overview of all your accounts and goals.',
    placement: 'center'
  },
  {
    target: '#add-account-button',
    title: 'Add Your First Account',
    content: 'Click here to add your bank account, ASB, EPF, or other financial accounts.',
    placement: 'bottom'
  },
  {
    target: '#create-goal-button',
    title: 'Set Financial Goals',
    content: 'Create goals like Emergency Fund, House Downpayment, or Hajj savings.',
    placement: 'bottom'
  },
  // ... more steps
];
```

### Help Panel Context Detection
```typescript
// Determine contextual help based on current route
function getContextualHelp(pathname: string): HelpContent {
  if (pathname.includes('/accounts')) {
    return accountsHelp;
  } else if (pathname.includes('/goals')) {
    return goalsHelp;
  } else if (pathname.includes('/calculators')) {
    return calculatorsHelp;
  } else if (pathname === '/') {
    return dashboardHelp;
  }
  return generalHelp;
}
```

### Keyboard Shortcut Handler
```typescript
// Global keyboard listener for help
useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      openHelpPanel();
    }
  }
  
  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```
