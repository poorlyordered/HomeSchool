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
