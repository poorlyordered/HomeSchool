# System Patterns

## Continuous Integration/Continuous Deployment (CI/CD)

- Version Control: GitHub
- Hosting Platform: Netlify
- Build Tool: Vite
- Framework: React with TypeScript

## Environment Configuration

- Uses Vite environment variables
- Supabase credentials managed via environment variables
- Supports local and production environments
- Base URL configuration for proper asset loading in production

## Deployment Workflow

1. Push changes to GitHub master branch
2. Netlify automatically detects changes
3. Netlify builds project using `npm run build`
4. Deploys built files to production environment
5. Serves application from `dist` directory

## Key Configuration Files

- `netlify.toml`: Defines build and deployment settings
- `.env`: Stores environment-specific variables
- `vite.config.ts`: Configures build and development settings
- `README.md`: Provides deployment and setup instructions

## Environment Variable Management

- Supabase credentials stored as Vite-prefixed variables
- Separate variables for development and production
- Sensitive information kept out of version control
- Environment variables configured in Netlify dashboard for production

## Authentication Patterns

- Email/password authentication via Supabase
- Email verification flow with dedicated verification page
- Password recovery with reset email and token validation
- Session management with automatic timeout detection
- Role-based access control (guardian/student)
- Secure token handling for authentication operations

## Error Handling Patterns

- Comprehensive error handling system:

  - ErrorBoundary component for catching and displaying React component errors
  - Centralized error handling utility in `src/lib/errorHandling.ts`
  - Context tracking for better error identification and debugging
  - Standardized error types and structure with `AppError` interface
  - Error categorization by type (authentication, network, validation, unknown)
  - User-friendly error messages with actionable suggestions
  - Technical details for developer debugging
  - Application wrapped with ErrorBoundary in App.tsx
  - Consistent error display via toast notifications
  - Fallback UI for component errors

- Error handling utilities:

  - `handleError`: Processes errors into standardized AppError format
  - `displayError`: Shows errors to users via toast notifications
  - `handleAndDisplayError`: Combines processing and display in one function
  - `withErrorHandling`: Higher-order function for wrapping async operations
  - `validateForm`: Standardized form validation with error reporting

- Error handling patterns:

  - Try/catch blocks for async operations
  - Context parameter for tracking error sources
  - Detailed error logging to console in development mode
  - Specific error messages for different failure types
  - Verification of database operation success
  - React useCallback for memoizing functions that trigger API calls
  - Proper dependency management in useEffect hooks

- Troubleshooting workflow:
  - When encountering errors, follow the confidence check process:
    - [CONFIDENCE CHECK]
      - Rate confidence (0-10)
      - If < 9, explain:
        - What you know
        - What you're unsure about
        - What you need to investigate
      - Only proceed when confidence ≥ 9
      - Document findings for future memory resets
  - This ensures methodical problem-solving and prevents making changes without sufficient understanding
  - Helps maintain system stability by avoiding speculative fixes
  - Creates documentation trail for recurring issues

## Testing Patterns

- Jest and React Testing Library for unit and component testing
- Optimized Jest configuration:
  - Cache enabled for faster subsequent test runs
  - Parallel execution with maxWorkers set to 50% of CPU cores
- Separate TypeScript configuration for tests with `tsconfig.jest.json`
- Mock implementations for external dependencies
- Component testing with user interaction simulation
- Asynchronous test handling with `waitFor` and `async/await`
- Test coverage for critical functionality
- Comprehensive test matrix for manual testing
- Standardized bug report template
- Git hooks for pre-commit and pre-push validation:
  - Linting and formatting checks before commits
  - Type checking and tests before pushing to remote
  - Temporary bypass solution for Husky hooks:
    - Scripts to disable/enable Husky by modifying package.json (toggle-husky.ps1/bat)
    - Scripts to bypass hooks for individual commands using --no-verify flag (bypass-husky.ps1/bat)
    - Comprehensive documentation in HUSKY-BYPASS-README.md
    - Used during periods of test instability to allow continued development
- Test file organization:
  - Two approaches to test file organization:
    1. Centralized testing directory: `src/__tests__/` with subdirectories for components, hooks, and lib
    2. Co-location pattern: Test files placed alongside the components they test
  - Migration toward co-location pattern for better maintainability
  - Component tests follow naming convention: `ComponentName.test.tsx`
  - Helper functions in `src/__tests__/helpers/` directory
  - Standardized mock implementation for Supabase in `src/lib/__mocks__/supabase.ts`
- Playwright for end-to-end testing (planned):
  - Page Object Model pattern for UI abstraction
  - Test fixtures for authentication and common setup
  - Visual regression testing capabilities
  - API testing integration
  - CI/CD integration via GitHub Actions

## Email Notification Patterns

- Transactional email system using Supabase Edge Functions:
  - Centralized email service module in `src/lib/emailService.ts`
  - Supabase Edge Function for email delivery in `supabase/functions/send-email`
  - SMTP configuration via environment variables
  - Comprehensive error handling with fallbacks
  - Non-blocking email operations (failures don't block main functionality)

- Email types and triggers:
  - Invitation emails when a guardian invites another guardian or student
  - School guardian notifications when a guardian is added to a school
  - Invitation acceptance notifications when an invitation is accepted
  - Invitation reminder emails for pending invitations

- Email content patterns:
  - Consistent branding and styling
  - Clear call-to-action buttons
  - Personalized content with recipient and sender names
  - Secure token-based links for actions
  - Fallback text for non-HTML email clients

- Error handling for email operations:
  - Graceful degradation when email sending fails
  - Detailed logging for troubleshooting
  - User feedback independent of email delivery status
  - Retry mechanisms for critical emails

## Database Patterns

- Supabase PostgreSQL database for data storage
- Row-level security (RLS) policies for data access control
- Database migrations in `supabase/migrations` directory
- Migration naming convention: timestamp_descriptive_name.sql
- Profile data stored in `profiles` table with user metadata
- Foreign key relationships for data integrity
- User authentication tied to database profiles
- Manual migration application to production database
- Many-to-many relationships using junction tables:
  - `student_guardians` table for multiple guardians per student
  - Primary guardian designation with `is_primary` flag
  - Cascading deletes with `ON DELETE CASCADE` for referential integrity
  - Unique constraints to prevent duplicate relationships

## Invitation System Patterns

- Token-based invitation system for guardians and students
- Invitation data stored in `invitations` table with:
  - Unique token generation using UUID
  - Expiration handling with `expires_at` timestamp
  - Status tracking (pending, accepted, expired)
  - Association with student and inviter
  - Email address of invitee
  - Role specification (guardian or student)
- Security measures:
  - Row-level security (RLS) policies to restrict invitation creation and viewing
  - Automatic expiration of old invitations via database trigger
  - Unique constraint on email, student_id, and role to prevent duplicates
- Invitation workflow:
  - Guardian creates invitation for another guardian or student
  - System generates unique token and sets expiration date
  - Invitee receives invitation link (email delivery planned for future)
  - Invitee accepts invitation by creating account or signing in
  - System verifies token validity and expiration
  - System links the invitee to the student based on role
  - Invitation status updated to "accepted"
- Error handling:
  - Validation of inputs before creating invitations
  - Specific error messages for different failure scenarios
  - Detailed logging for troubleshooting
  - Permission verification through database RLS policies
