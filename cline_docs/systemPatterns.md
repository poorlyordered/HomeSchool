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
- Playwright for end-to-end testing (planned):
  - Page Object Model pattern for UI abstraction
  - Test fixtures for authentication and common setup
  - Visual regression testing capabilities
  - API testing integration
  - CI/CD integration via GitHub Actions

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
