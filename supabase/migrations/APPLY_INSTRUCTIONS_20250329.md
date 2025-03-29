# Instructions for Applying Migration 20250329084600_auto_add_school_owners_to_guardians.sql

This migration addresses the issue where school owners (primary guardians) are not automatically added to the school_guardians table, which can cause permission issues when sending invitations.

## What This Migration Does

1. Adds all existing school owners to the school_guardians table if they're not already there
2. Creates a trigger that automatically adds school owners to the school_guardians table when:
   - A new school is created
   - The owner of a school is changed

## How to Apply This Migration

### Option 1: Using Supabase CLI (Recommended for Development)

If you have the Supabase CLI set up locally, you can apply the migration with:

```bash
supabase db push
```

### Option 2: Using Supabase Dashboard SQL Editor (For Production)

Since the Supabase CLI command has encountered issues in the past, you can apply this migration manually through the Supabase dashboard:

1. Log in to the Supabase dashboard
2. Navigate to your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the entire contents of the `20250329084600_auto_add_school_owners_to_guardians.sql` file
6. Execute the query

## Verification

After applying the migration, verify that:

1. All school owners are now present in the school_guardians table:

```sql
SELECT 
  s.id AS school_id, 
  s.name AS school_name,
  p.email AS owner_email,
  CASE WHEN sg.id IS NOT NULL THEN 'Yes' ELSE 'No' END AS in_school_guardians
FROM 
  schools s
JOIN 
  profiles p ON s.guardian_id = p.id
LEFT JOIN 
  school_guardians sg ON s.id = sg.school_id AND s.guardian_id = sg.guardian_id;
```

2. Test the invitation system by:
   - Creating invitations for guardians
   - Verifying that the stack depth limit error no longer occurs

## Rollback Plan

If issues occur, you can roll back the changes with:

```sql
-- Remove the trigger
DROP TRIGGER IF EXISTS ensure_school_owner_in_guardians ON schools;

-- Remove the function
DROP FUNCTION IF EXISTS add_school_owner_to_guardians();

-- Note: The data inserted into school_guardians will remain,
-- which should not cause any issues
```
