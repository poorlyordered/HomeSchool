/*
  # Update schools table RLS policies

  1. Changes
    - Drop existing schools policies
    - Add new policies for:
      - Inserting schools (guardians only)
      - Viewing schools (authenticated users)
      - Updating schools (school owners only)
      - Deleting schools (school owners only)
    - Add guardian_id column to track ownership

  2. Security
    - Only guardians can create schools
    - School owners can update/delete their schools
    - All authenticated users can view schools
*/

-- Add guardian_id column
ALTER TABLE schools
ADD COLUMN IF NOT EXISTS guardian_id uuid REFERENCES profiles(id);

-- Update existing rows to set guardian_id
DO $$
BEGIN
  UPDATE schools
  SET guardian_id = (
    SELECT id FROM profiles
    WHERE role = 'guardian'
    LIMIT 1
  )
  WHERE guardian_id IS NULL;
END $$;

-- Make guardian_id required for future rows
ALTER TABLE schools
ALTER COLUMN guardian_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools can be created by guardians" ON schools;

-- Create new policies
CREATE POLICY "Schools are viewable by authenticated users"
  ON schools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Schools can be created by guardians"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'guardian'
    )
    AND guardian_id = auth.uid()
  );

CREATE POLICY "Schools can be updated by owners"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Schools can be deleted by owners"
  ON schools
  FOR DELETE
  TO authenticated
  USING (guardian_id = auth.uid());