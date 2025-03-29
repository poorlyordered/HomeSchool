# BUG-008: School Owner Not in School Guardians Table Causing Stack Depth Exceeded Error

## Priority
P2-high

## Status
Resolved

## Date Reported
3/29/2025

## Description
When a school owner (primary guardian) attempts to invite a guardian, the system encounters a stack depth limit exceeded error in the Supabase database. This occurs because the school owner is listed in the schools table (as guardian_id) but not in the school_guardians table, which is checked during the invitation process.

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
1. Log in as a school owner (primary guardian)
2. Navigate to Account Settings > Invitations
3. Select a student and attempt to invite another guardian
4. Observe the 500 error in the console

## Root Cause
The invitation system checks the school_guardians table to determine if a user has permission to send invitations. However, school owners are only listed in the schools table (as guardian_id) and not automatically added to the school_guardians table, causing permission checks to fail with a stack depth limit exceeded error.

## Solution
Created a new migration file `20250329084600_auto_add_school_owners_to_guardians.sql` that:
1. Adds all existing school owners to the school_guardians table if they're not already there
2. Creates a trigger that automatically adds school owners to the school_guardians table when:
   - A new school is created
   - The owner of a school is changed

This ensures that school owners always have the proper permissions to manage their schools and send invitations.

## Implementation Notes
The migration file was created and applied to the production database through the Supabase dashboard SQL editor. The trigger ensures that this issue won't occur again in the future, even if new schools are created or school ownership changes.

## Resolution Date
3/29/2025

## Resolution Notes
The migration was successfully applied to the database, adding all school owners to the school_guardians table. The invitation system now works correctly without encountering the stack depth limit error.

## Related Files
- supabase/migrations/20250329084600_auto_add_school_owners_to_guardians.sql
- supabase/migrations/APPLY_INSTRUCTIONS_20250329.md
- src/lib/auth.ts
- src/components/InvitationManagement.tsx
- src/components/SchoolGuardianManagement.tsx

## Testing Notes
After applying the migration, test the invitation system by:
1. Verifying that all school owners are now present in the school_guardians table
2. Creating invitations for guardians
3. Verifying that the stack depth limit error no longer occurs
