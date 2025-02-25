# System Architecture

## Frontend Architecture
1. React Components
   - Functional components with hooks
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Lucide React for icons

2. State Management
   - React hooks for local state
   - Custom hooks for shared logic
   - Event-based updates
   - Real-time synchronization

3. Form Handling
   - Controlled inputs
   - Validation patterns
   - Real-time error feedback
   - Enhanced loading states
   - File upload handling
   - Bulk data processing

4. Data Flow
   - Parent-child props
   - Event callbacks
   - Custom events
   - Real-time updates
   - Search and filter patterns
   - Data transformation

## Backend Architecture
1. Database (Supabase)
   - PostgreSQL database
   - Row Level Security (RLS)
   - Role-based policies
   - Real-time subscriptions

2. Authentication
   - Supabase Auth
   - JWT tokens
   - Session persistence
   - Profile management

3. Data Models
   - Profiles
   - Schools
   - Students
   - Courses
   - Test Scores

## Security Patterns
1. Row Level Security
   - Table-level policies
   - Role-based access control
   - Owner-only modifications
   - Relationship-based access

2. Authentication Flow
   - Email/password authentication
   - Profile creation
   - Role assignment
   - Session management

3. Data Validation
   - Input sanitization
   - Range validation
   - Type checking
   - Error handling

## Form Patterns
1. Validation
   - Field-level validation
   - Form-level validation
   - Real-time feedback
   - Error messages

2. User Feedback
   - Loading states
   - Success messages
   - Error notifications
   - Visual indicators

3. Data Entry
   - Controlled inputs
   - Type-specific fields
   - CSV data processing
   - Bulk data handling
   - Search functionality
   - Filter patterns