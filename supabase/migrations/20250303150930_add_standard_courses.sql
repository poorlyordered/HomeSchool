/*
  # Create standard courses table

  1. New Table
    - `standard_courses`
      - `id` (uuid)
      - `name` (text)
      - `category` (text)
      - `is_semester` (boolean)
      - `source` (text)
      - `recommended_grade_level` (int[])
      - `popularity_score` (int)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on the table
    - Add policies for:
      - All authenticated users can view standard courses
      - Users can create/update/delete their own custom courses
      
  3. Functions
    - Add function to increment course popularity
*/

-- Create table
CREATE TABLE standard_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  is_semester boolean DEFAULT false,
  source text DEFAULT 'standard',
  recommended_grade_levels int[], -- Array of recommended grade levels (9, 10, 11, 12)
  popularity_score int DEFAULT 0, -- For tracking popular courses
  user_id uuid REFERENCES profiles(id), -- For user-added custom courses (NULL for standard)
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE standard_courses ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Standard courses are viewable by authenticated users"
  ON standard_courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for users to add their own custom courses
CREATE POLICY "Users can create their own custom courses"
  ON standard_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own custom courses
CREATE POLICY "Users can update their own custom courses"
  ON standard_courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own custom courses
CREATE POLICY "Users can delete their own custom courses"
  ON standard_courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to increment course popularity
CREATE OR REPLACE FUNCTION increment_course_popularity(course_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE standard_courses
  SET popularity_score = popularity_score + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql;
