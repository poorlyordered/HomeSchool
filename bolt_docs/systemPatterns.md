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
- Try/catch blocks for async operations
- Detailed error logging to console
- User-friendly error messages via notification components
- Specific error messages for different authentication failures
- Verification of database operation success
- React useCallback for memoizing functions that trigger API calls
- Proper dependency management in useEffect hooks
