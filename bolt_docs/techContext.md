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

   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. Database Schema

   - Migrations in supabase/migrations
   - RLS policies
   - Table relationships
   - Key tables:
     - profiles: User profiles with id, email, role, name
     - students: Student information linked to guardian profiles
     - schools: School information
     - courses: Course information for students
     - test_scores: Test score records

3. Authentication

   - Email/password setup
   - Role-based access
   - Session management
   - Profile creation

4. Data Validation
   - Test score ranges
   - Grade validation
   - Input sanitization
   - Error handling
