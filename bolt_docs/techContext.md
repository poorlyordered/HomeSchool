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
