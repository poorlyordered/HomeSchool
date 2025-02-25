/*
  # Fix schools table RLS policies

  1. Changes
    - Drop and recreate schools policies with proper conditions
    - Ensure proper access for guardians

  2. Security
    - Only guardians can create schools
    - All authenticated users can view schools
    - School owners can update/delete their schools
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools can be created by guardians" ON schools;
DROP POLICY IF EXISTS "Schools can be updated by owners" ON schools;
DROP POLICY IF EXISTS "Schools can be deleted by owners" ON schools;

-- Create new policies with fixed conditions
CREATE POLICY "Anyone can view schools"
  ON schools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Guardians can create schools"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = guardian_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'guardian'
    )
  );

CREATE POLICY "Owners can update schools"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Owners can delete schools"
  ON schools
  FOR DELETE
  TO authenticated
  USING (guardian_id = auth.uid());