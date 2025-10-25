# User Authentication

## Overview
User authentication system using Supabase Auth with email/password login, providing secure access to the financial tracking platform.

## Requirements

### Requirement: Email/Password Authentication
The system SHALL provide email and password-based authentication using Supabase Auth.

#### Scenario: Successful login
- **WHEN** user provides valid email and password credentials
- **THEN** system authenticates the user via Supabase Auth
- **AND** creates or updates user session
- **AND** redirects to main dashboard

#### Scenario: Invalid credentials
- **WHEN** user provides incorrect email or password
- **THEN** system displays error message
- **AND** does not create a session
- **AND** user remains on login screen

#### Scenario: User signup
- **WHEN** new user provides email and password
- **THEN** system creates account in Supabase Auth
- **AND** creates corresponding profile record with user_id
- **AND** sends email verification (if enabled)
- **AND** allows user to access dashboard

### Requirement: Session Management
The system SHALL maintain user sessions across page refreshes and browser restarts.

#### Scenario: Session persistence
- **WHEN** authenticated user refreshes the page
- **THEN** system retrieves session from Supabase
- **AND** maintains user's authenticated state
- **AND** does not require re-login

#### Scenario: Logout
- **WHEN** user clicks logout button
- **THEN** system terminates Supabase session
- **AND** clears local authentication state
- **AND** redirects to landing page

### Requirement: Authentication Context
The system SHALL provide authentication state via React Context to all components.

#### Scenario: Access user data
- **WHEN** authenticated component needs user information
- **THEN** system provides user object via useAuth hook
- **AND** includes user ID, email, and metadata
- **AND** updates automatically on auth state changes

#### Scenario: Protected routes
- **WHEN** unauthenticated user attempts to access protected content
- **THEN** system detects missing authentication
- **AND** displays login screen instead
- **AND** preserves intended destination for post-login redirect

## Technical Details

### Implementation
- **Framework**: Supabase Auth with @supabase/supabase-js
- **Context**: AuthContext.tsx provides global auth state
- **Components**: Auth.tsx handles login/signup UI
- **Session Storage**: Managed by Supabase client (localStorage)

### Security
- Passwords hashed and managed by Supabase
- JWT tokens for session management
- Automatic token refresh
- Row Level Security (RLS) enforced at database level

### Dependencies
- @supabase/supabase-js: ^2.57.4
- React Context API for state management
