# BUG-007: Stack Depth Limit Exceeded When Creating Invitations

## Priority
P2-high

## Status
Resolved

## Date Reported
3/28/2025

## Description
When attempting to invite a guardian, the system encounters a stack depth limit exceeded error in the Supabase database. This prevents users from creating new invitations.

## Error Message
```
Failed to load resource: the server responded with a status of 500 ()
Error inserting invitation: 
{
  code: "54001",
  details: null,
  hint: "Increase the configuration parameter \"max_stack_depth\" (currently 2048kB), after ensuring the platform's stack depth limit is adequate.",
  message: "stack depth limit exceeded"
}
```

## Steps to Reproduce
1. Log in as a guardian
2. Navigate to a student's management page
3. Attempt to invite another guardian
4. Observe the 500 error in the console

## Root Cause
The RLS (Row Level Security) policy for the invitations table contains complex or circular references that cause the PostgreSQL stack depth limit to be exceeded during policy evaluation.

## Solution
Created a new migration file `20250328175500_fix_invitations_rls.sql` that:
1. Drops the existing RLS policies for the invitations table
2. Creates simplified policies that avoid circular references
3. Maintains the same security model while improving performance

The key change is in the INSERT policy, which now uses a more direct query to the students table instead of complex nested queries that could lead to stack depth issues.

## Implementation Notes
The migration file was created and applied to the production database through the Supabase dashboard SQL editor since the local Supabase CLI command encountered issues.

## Resolution Date
3/28/2025

## Resolution Notes
The simplified RLS policies were successfully applied to the database, eliminating the stack depth limit error. The invitation system now works correctly without encountering the 500 error.

## Related Files
- supabase/migrations/20250328175500_fix_invitations_rls.sql
- src/lib/auth.ts
- src/components/InvitationManagement.tsx

## Testing Notes
After applying the migration, test the invitation system by:
1. Creating invitations for guardians
2. Creating invitations for students
3. Verifying that all security constraints are still enforced
