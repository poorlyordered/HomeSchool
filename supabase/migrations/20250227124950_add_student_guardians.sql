/*
  # Add support for multiple guardians per student

  1. Changes
    - Create student_guardians junction table
    - Add RLS policies for the new table
    - Migrate existing guardian-student relationships

  2. Security
    - Maintain RLS protection
    - Allow guardians to manage other guardians for their students
*/

-- Create the student_guardians junction table
CREATE TABLE student_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  guardian_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, guardian_id)
);

-- Enable RLS on the new table
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;

-- Create policies for the student_guardians table
CREATE POLICY "Guardians can view student_guardians they are associated with"
  ON student_guardians
  FOR SELECT
  TO authenticated
  USING (
    guardian_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = student_guardians.student_id
      AND sg.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can insert other guardians for their students"
  ON student_guardians
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = student_guardians.student_id
      AND sg.guardian_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_guardians.student_id
      AND s.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can update student_guardians for their students"
  ON student_guardians
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = student_guardians.student_id
      AND sg.guardian_id = auth.uid()
      AND sg.is_primary = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = student_guardians.student_id
      AND sg.guardian_id = auth.uid()
      AND sg.is_primary = true
    )
  );

CREATE POLICY "Guardians can delete student_guardians for their students"
  ON student_guardians
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = student_guardians.student_id
      AND sg.guardian_id = auth.uid()
      AND sg.is_primary = true
    )
  );

-- Migrate existing guardian-student relationships
INSERT INTO student_guardians (student_id, guardian_id, is_primary)
SELECT id, guardian_id, true
FROM students;
