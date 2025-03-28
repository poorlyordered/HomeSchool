/*
  # Fix RLS policies for student_guardians table

  1. Changes
    - Drop existing RLS policies for student_guardians table
    - Create simplified RLS policies to avoid circular references
    - Maintain security while improving performance

  2. Security
    - Maintain RLS protection
    - Simplify policy conditions to avoid 500 errors
*/

-- Drop existing policies for the student_guardians table
DROP POLICY IF EXISTS "Guardians can view student_guardians they are associated with" ON student_guardians;
DROP POLICY IF EXISTS "Guardians can insert other guardians for their students" ON student_guardians;
DROP POLICY IF EXISTS "Guardians can update student_guardians for their students" ON student_guardians;
DROP POLICY IF EXISTS "Guardians can delete student_guardians for their students" ON student_guardians;

-- Create simplified policies for the student_guardians table
-- SELECT policy: Allow guardians to view their own associations
CREATE POLICY "Guardians can view their own student_guardians"
  ON student_guardians
  FOR SELECT
  TO authenticated
  USING (
    guardian_id = auth.uid()
  );

-- SELECT policy: Allow guardians to view other guardians for their students
-- This is a separate policy to avoid circular references
CREATE POLICY "Guardians can view other guardians for their students"
  ON student_guardians
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_guardians.student_id
      AND students.guardian_id = auth.uid()
    )
  );

-- INSERT policy: Allow guardians to add other guardians for their students
CREATE POLICY "Guardians can insert guardians for their students"
  ON student_guardians
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_guardians.student_id
      AND students.guardian_id = auth.uid()
    )
  );

-- UPDATE policy: Allow primary guardians to update student_guardians
CREATE POLICY "Primary guardians can update student_guardians"
  ON student_guardians
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_guardians.student_id
      AND students.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_guardians.student_id
      AND students.guardian_id = auth.uid()
    )
  );

-- DELETE policy: Allow primary guardians to delete student_guardians
CREATE POLICY "Primary guardians can delete student_guardians"
  ON student_guardians
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_guardians.student_id
      AND students.guardian_id = auth.uid()
    )
  );
