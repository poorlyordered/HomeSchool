/*
  # Create profiles and students tables

  1. New Tables
    - `profiles`
      - `id` (uuid, matches auth.users)
      - `email` (text)
      - `role` (text)
      - `created_at` (timestamp)
    - `students`
      - `id` (uuid)
      - `guardian_id` (uuid, references profiles)
      - `school_id` (uuid)
      - `student_id` (text)
      - `name` (text)
      - `birth_date` (date)
      - `graduation_date` (date)
      - `created_at` (timestamp)
    - `schools`
      - `id` (uuid)
      - `name` (text)
      - `address` (text)
      - `phone` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Guardians can read/write their students' data
      - Students can only read their own data
      - Only guardians can create new students
*/

-- Create tables
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('guardian', 'student')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid REFERENCES profiles(id) NOT NULL,
  school_id uuid REFERENCES schools(id) NOT NULL,
  student_id text NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  graduation_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policies for schools
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
  );

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policies for students
CREATE POLICY "Guardians can view their students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    guardian_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND students.id = profiles.id
    )
  );

CREATE POLICY "Guardians can create students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'guardian'
    )
  );

CREATE POLICY "Guardians can update their students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (guardian_id = auth.uid())
  WITH CHECK (guardian_id = auth.uid());

CREATE POLICY "Guardians can delete their students"
  ON students
  FOR DELETE
  TO authenticated
  USING (guardian_id = auth.uid());