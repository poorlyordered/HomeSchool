# Technical Stack

## Frontend

- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.1
- React Router 6.22.2
- Lucide React 0.344.0
- React PDF Renderer 3.4.0

## Backend

- Supabase
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions

## Development Tools

- Vite 5.4.2
- ESLint 9.9.1
- PostCSS 8.4.35
- Autoprefixer 10.4.18

## Testing Tools

- Jest 29.7.0
- React Testing Library 16.2.0
- Playwright 1.51.1 (for Integration and E2E testing)

## Environment

- Node.js
- npm
- WebContainer runtime

## Deployment

- Netlify for hosting
- Environment variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

## Key Dependencies

All dependencies are managed through package.json with specific version requirements.

## Development Setup

1. Environment Variables

   Required in a `.env` file at the project root:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Local Development Commands

   - `npm install` - Install dependencies
   - `npm run dev` - Start development server
   - `npm run build` - Create production build
   - `npm run preview` - Preview production build
   - `npm run lint` - Run ESLint
   - `npm run test` - Run Jest tests
   - `npm run format` - Format code with Prettier
   - `npm run test:e2e` - Run Playwright tests

3. Database Schema

   - Migrations in supabase/migrations
   - RLS policies
   - Table relationships
   - Key tables:
     - profiles: User profiles with id, email, role, name
     - students: Student information linked to guardian profiles
     - schools: School information
     - courses: Course information for students
     - test_scores: Test score records

4. Authentication

   - Email/password setup
   - Role-based access
   - Session management
   - Profile creation

5. Data Validation
   - Test score ranges
   - Grade validation
   - Input sanitization
   - Error handling

## Testing Setup

1. Unit and Component Testing

   - Jest and React Testing Library
   - Optimized Jest configuration:
     - Cache enabled for faster subsequent test runs
     - Parallel execution with maxWorkers set to 50% of CPU cores
   - Mock implementations for external dependencies
   - Component testing with user interaction simulation
   - Asynchronous test handling with `waitFor` and `async/await`
   - Test file organization:
     - Two approaches to test file organization:
       1. Centralized testing directory: `src/__tests__/` with subdirectories for components, hooks, and lib
       2. Co-location pattern: Test files placed alongside the components they test
     - Migration toward co-location pattern for better maintainability
     - Component tests follow naming convention: `ComponentName.test.tsx`
     - Helper functions in `src/__tests__/helpers/` directory
     - Standardized mock implementation for Supabase in `src/lib/__mocks__/supabase.ts`
   - Git hooks for pre-commit and pre-push validation:
     - Linting and formatting checks before commits
     - Type checking and tests before pushing to remote

2. Integration and End-to-End Testing
   - Playwright for browser automation, integration, and E2E tests
   - Configuration in `playwright.config.ts`
   - Tests located in the root `tests/` directory (`*.spec.ts`)
   - Page Object Model pattern for UI abstraction
   - Test fixtures for authentication and common setup
   - Visual regression testing capabilities (planned)
   - API testing integration (planned)

## Troubleshooting

### Common Issues

1. **Application Not Starting**

   - Verify Node.js version (v18+ recommended)
   - Check for errors in the terminal
   - Ensure all dependencies are installed with `npm install`
   - Verify `.env` file exists with correct Supabase credentials
   - Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`

2. **Supabase Connection Issues**

   - Verify Supabase project is active
   - Check that your anon key has the necessary permissions
   - Ensure your IP is not blocked by Supabase
   - Check browser console for CORS errors
   - Verify network requests in the browser's Network tab

3. **Infinite Loading States**

   - Check browser console for errors
   - Look for failed network requests
   - Clear browser cache and local storage
   - Check for circular dependencies in React components
   - Verify that async operations have proper error handling

4. **Authentication Problems**

   - Ensure Supabase auth is properly configured
   - Check for expired tokens
   - Verify email templates in Supabase dashboard
   - Test authentication flow in incognito mode

5. **Test Failures After File Reorganization**
   - Check import paths in test files
   - Verify component paths match the new file structure
   - Update mock implementations to reflect new component locations
   - Use `--no-verify` flag with git commands to bypass failing tests temporarily
   - Fix one test file at a time, starting with the most critical components

### Debugging Tools

1. **Browser DevTools**

   - Console: Check for JavaScript errors
   - Network: Monitor API requests
   - Application: Inspect localStorage and sessionStorage
   - React DevTools: Examine component state and props

2. **Vite Development Server**

   - Check terminal output for build errors
   - Use HMR (Hot Module Replacement) for quick iterations
   - Enable debug logging with `DEBUG=vite:* npm run dev`

3. **Supabase Dashboard**
   - SQL Editor: Run queries directly against the database
   - Authentication: Monitor user signups and sessions
   - Storage: Check file uploads and permissions
   - Edge Functions: Debug serverless functions
