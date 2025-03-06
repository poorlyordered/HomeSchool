/*
  # Add standard_course_id to courses table

  1. Add column
    - `standard_course_id` (uuid, references standard_courses)
    
  2. Create function to match existing courses to standard courses by name
*/

-- Add standard_course_id column to courses table
ALTER TABLE courses ADD COLUMN standard_course_id uuid REFERENCES standard_courses(id);

-- Create function to match existing courses to standard courses by name
CREATE OR REPLACE FUNCTION match_courses_to_standard_courses()
RETURNS void AS $$
BEGIN
  UPDATE courses c
  SET standard_course_id = sc.id
  FROM standard_courses sc
  WHERE c.name = sc.name
  AND c.standard_course_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to match existing courses
SELECT match_courses_to_standard_courses();
