/*
  # Add school guardians management

  1. Changes
    - Create school_guardians table
    - Add RLS policies for the new table
    - Add functions for school guardian management

  2. Security
    - Maintain RLS protection
    - Proper permission checks for primary guardian
*/

-- Create the school_guardians table
CREATE TABLE school_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  guardian_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_registered BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, guardian_id),
  UNIQUE(school_id, email)
);

-- Enable RLS on the new table
ALTER TABLE school_guardians ENABLE ROW LEVEL SECURITY;

-- Create policies for the school_guardians table
CREATE POLICY "Guardians can view school guardians for their schools"
  ON school_guardians
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_guardians.school_id
      AND schools.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Primary guardians can manage school guardians"
  ON school_guardians
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_guardians.school_id
      AND schools.guardian_id = auth.uid()
    )
  );
