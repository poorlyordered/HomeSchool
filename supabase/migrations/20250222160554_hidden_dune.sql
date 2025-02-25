/*
  # Create courses and test scores tables

  1. New Tables
    - `courses`
      - `id` (uuid)
      - `student_id` (uuid, references students)
      - `name` (text)
      - `grade_level` (int)
      - `academic_year` (text)
      - `semester` (text)
      - `credit_hours` (numeric)
      - `grade` (text)
      - `created_at` (timestamp)
    - `test_scores`
      - `id` (uuid)
      - `student_id` (uuid, references students)
      - `type` (text)
      - `date` (date)
      - `total_score` (int)
      - `created_at` (timestamp)
    - `test_sections`
      - `id` (uuid)
      - `test_score_id` (uuid, references test_scores)
      - `name` (text)
      - `score` (int)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Guardians can read/write their students' courses and scores
      - Students can only read their own courses and scores
*/

-- Create tables
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  name text NOT NULL,
  grade_level int NOT NULL CHECK (grade_level BETWEEN 9 AND 12),
  academic_year text NOT NULL,
  semester text NOT NULL CHECK (semester IN ('Fall', 'Spring')),
  credit_hours numeric NOT NULL,
  grade text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE test_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('SAT', 'ACT')),
  date date NOT NULL,
  total_score int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE test_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_score_id uuid REFERENCES test_scores(id) NOT NULL,
  name text NOT NULL,
  score int NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sections ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Users can view their related courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = courses.student_id
      AND (
        students.guardian_id = auth.uid() OR
        students.id = (
          SELECT id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Guardians can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = courses.student_id
      AND students.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can update courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = courses.student_id
      AND students.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = courses.student_id
      AND students.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can delete courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = courses.student_id
      AND students.guardian_id = auth.uid()
    )
  );

-- Policies for test scores
CREATE POLICY "Users can view their related test scores"
  ON test_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = test_scores.student_id
      AND (
        students.guardian_id = auth.uid() OR
        students.id = (
          SELECT id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Guardians can create test scores"
  ON test_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = test_scores.student_id
      AND students.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can update test scores"
  ON test_scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = test_scores.student_id
      AND students.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = test_scores.student_id
      AND students.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can delete test scores"
  ON test_scores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = test_scores.student_id
      AND students.guardian_id = auth.uid()
    )
  );

-- Policies for test sections
CREATE POLICY "Users can view their related test sections"
  ON test_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_scores
      JOIN students ON students.id = test_scores.student_id
      WHERE test_scores.id = test_sections.test_score_id
      AND (
        students.guardian_id = auth.uid() OR
        students.id = (
          SELECT id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Guardians can create test sections"
  ON test_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_scores
      JOIN students ON students.id = test_scores.student_id
      WHERE test_scores.id = test_sections.test_score_id
      AND students.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can update test sections"
  ON test_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_scores
      JOIN students ON students.id = test_scores.student_id
      WHERE test_scores.id = test_sections.test_score_id
      AND students.guardian_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_scores
      JOIN students ON students.id = test_scores.student_id
      WHERE test_scores.id = test_sections.test_score_id
      AND students.guardian_id = auth.uid()
    )
  );

CREATE POLICY "Guardians can delete test sections"
  ON test_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_scores
      JOIN students ON students.id = test_scores.student_id
      WHERE test_scores.id = test_sections.test_score_id
      AND students.guardian_id = auth.uid()
    )
  );