# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send details of the vulnerability to:
- Use the in-app feedback form (marked as "Bug Report")
- Or create a private security advisory on GitHub

### 3. Include Details

Please include:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information (optional)

### 4. Response Time

We will acknowledge your report within 48 hours and provide:
- Confirmation of the vulnerability
- Our assessment of the severity
- Expected timeline for a fix

### 5. Disclosure Policy

- We will work with you to understand and resolve the issue
- We will keep you updated on progress
- Once fixed, we will publicly disclose the vulnerability (with credit to you if desired)
- We aim to fix critical vulnerabilities within 7 days

## Security Best Practices

### For Users

1. **Protect Your Credentials**
   - Use a strong, unique password
   - Never share your password
   - Log out when using shared devices

2. **Keep Data Secure**
   - Regularly export your data as backup
   - Use the privacy settings appropriately
   - Be cautious with sensitive financial information

3. **Verify the Platform**
   - Always access the app through the official URL
   - Check for HTTPS in the browser
   - Be wary of phishing attempts

### For Developers

1. **Code Security**
   - Never commit secrets or API keys
   - Use environment variables for sensitive data
   - Follow secure coding practices

2. **Database Security**
   - Always use Row Level Security (RLS)
   - Validate all user inputs
   - Use parameterized queries

3. **Authentication**
   - Never store passwords in plain text
   - Use Supabase Auth for authentication
   - Implement proper session management

## Known Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Encrypted data in transit (HTTPS)
- ✅ Encrypted data at rest
- ✅ Secure authentication via Supabase
- ✅ No third-party data sharing
- ✅ Regular security updates

## Security Updates

Security patches will be released as soon as possible after verification. Users will be notified through:
- GitHub release notes
- In-app notifications (if applicable)
- Email notifications (for critical issues)

## Scope

This security policy applies to:
- The main application code
- Database migrations
- Authentication flows
- User data handling

Out of scope:
- Third-party services (Supabase infrastructure)
- User's device security
- Network security

## Contact

For non-security issues, please use:
- GitHub Issues for bugs and features
- In-app feedback form for general feedback

Thank you for helping keep Malaysian Financial Tracker secure!
