# Instructions for Applying Migration 20250328175500_fix_invitations_rls.sql

Since the Supabase CLI command encountered issues, please apply this migration manually through the Supabase dashboard SQL editor:

1. Log in to the Supabase dashboard
2. Navigate to your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the entire contents of the `20250328175500_fix_invitations_rls.sql` file
6. Execute the query

## Migration Content

```sql
/*
  # Fix RLS policies for invitations table

  1. Changes
    - Drop existing RLS policies for invitations table
    - Create simplified RLS policies to avoid circular references and stack depth limit errors
    - Maintain security while improving performance

  2. Security
    - Maintain RLS protection
    - Simplify policy conditions to avoid 500 errors
    - Prevent stack depth limit exceeded errors
*/

-- Drop existing policies for the invitations table
DROP POLICY IF EXISTS "Guardians can view invitations they created" ON invitations;
DROP POLICY IF EXISTS "Guardians can create invitations for their students" ON invitations;
DROP POLICY IF EXISTS "Guardians can update invitations they created" ON invitations;
DROP POLICY IF EXISTS "Guardians can delete invitations they created" ON invitations;

-- Create simplified policies for the invitations table
-- SELECT policy: Allow users to view invitations they created or are for them
CREATE POLICY "Users can view invitations they created or are for them"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid() OR
    email = auth.email()
  );

-- INSERT policy: Allow guardians to create invitations for students they are associated with
-- This uses a direct query to students table instead of going through student_guardians
CREATE POLICY "Guardians can create invitations for their students"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = invitations.student_id
      AND (
        -- Primary guardian of the student
        students.guardian_id = auth.uid() OR
        -- Or associated through student_guardians table
        EXISTS (
          SELECT 1 FROM student_guardians
          WHERE student_guardians.student_id = students.id
          AND student_guardians.guardian_id = auth.uid()
        )
      )
    )
  );

-- UPDATE policy: Allow users to update invitations they created
CREATE POLICY "Users can update invitations they created"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    inviter_id = auth.uid()
  )
  WITH CHECK (
    inviter_id = auth.uid()
  );

-- DELETE policy: Allow users to delete invitations they created
CREATE POLICY "Users can delete invitations they created"
  ON invitations
  FOR DELETE
  TO authenticated
  USING (
    inviter_id = auth.uid()
  );
```

## Verification

After applying the migration, verify that:

1. The RLS policies have been updated by checking the policies in the Supabase dashboard
2. The invitation system works correctly by testing invitation creation
3. Security is maintained by testing that users cannot create invitations for students they don't have access to

## Rollback Plan

If issues occur, you can restore the original policies with:

```sql
-- Drop the new policies
DROP POLICY IF EXISTS "Users can view invitations they created or are for them" ON invitations;
DROP POLICY IF EXISTS "Guardians can create invitations for their students" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations they created" ON invitations;
DROP POLICY IF EXISTS "Users can delete invitations they created" ON invitations;

-- Recreate the original policies
CREATE POLICY "Guardians can view invitations they created"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid() OR
    email = auth.email()
  );

CREATE POLICY "Guardians can create invitations for their students"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (role = 'guardian' AND EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = invitations.student_id
      AND sg.guardian_id = auth.uid()
    )) OR
    (role = 'student' AND EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = invitations.student_id
      AND sg.guardian_id = auth.uid()
    ))
  );

CREATE POLICY "Guardians can update invitations they created"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    inviter_id = auth.uid()
  )
  WITH CHECK (
    inviter_id = auth.uid()
  );

CREATE POLICY "Guardians can delete invitations they created"
  ON invitations
  FOR DELETE
  TO authenticated
  USING (
    inviter_id = auth.uid()
  );
