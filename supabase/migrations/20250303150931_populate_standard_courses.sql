/*
  # Populate standard courses table

  This migration populates the standard_courses table with data from the standard high school course catalog.
  Courses are organized by category and include information about whether they are semester courses.
  Recommended grade levels are set based on course names and types.
*/

-- Mathematics courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('Pre-Algebra', 'Mathematics', false, ARRAY[9], 'standard'),
  ('Algebra I', 'Mathematics', false, ARRAY[9, 10], 'standard'),
  ('Geometry', 'Mathematics', false, ARRAY[9, 10], 'standard'),
  ('Algebra II', 'Mathematics', false, ARRAY[10, 11], 'standard'),
  ('Trigonometry', 'Mathematics', true, ARRAY[11], 'standard'),
  ('Pre-Calculus', 'Mathematics', false, ARRAY[11, 12], 'standard'),
  ('AP Calculus AB', 'Mathematics', false, ARRAY[11, 12], 'standard'),
  ('AP Calculus AB Exam Prep', 'Mathematics', false, ARRAY[11, 12], 'standard'),
  ('AP Calculus BC', 'Mathematics', false, ARRAY[11, 12], 'standard'),
  ('AP Statistics', 'Mathematics', false, ARRAY[11, 12], 'standard'),
  ('Business Math', 'Mathematics', false, ARRAY[10, 11, 12], 'standard'),
  ('College Exam Math Prep', 'Mathematics', true, ARRAY[11, 12], 'standard'),
  ('Pre-Algebra – Spanish', 'Mathematics', false, ARRAY[9], 'standard'),
  ('Algebra I – Spanish', 'Mathematics', false, ARRAY[9, 10], 'standard');

-- Language Arts/Reading courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('English I', 'Language Arts/Reading', false, ARRAY[9], 'standard'),
  ('English II', 'Language Arts/Reading', false, ARRAY[10], 'standard'),
  ('American Literature – English III', 'Language Arts/Reading', false, ARRAY[11], 'standard'),
  ('British Literature – English IV', 'Language Arts/Reading', false, ARRAY[12], 'standard'),
  ('College Prep – English IV', 'Language Arts/Reading', false, ARRAY[12], 'standard'),
  ('AP English Literature and Composition', 'Language Arts/Reading', false, ARRAY[11, 12], 'standard'),
  ('AP English Language and Composition', 'Language Arts/Reading', false, ARRAY[11, 12], 'standard'),
  ('Discover English – High School Part I', 'Language Arts/Reading', false, ARRAY[9, 10, 11, 12], 'standard');

-- Science courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('Physical Science', 'Science', false, ARRAY[9], 'standard'),
  ('Biology', 'Science', false, ARRAY[9, 10], 'standard'),
  ('AP Biology', 'Science', false, ARRAY[11, 12], 'standard'),
  ('Introduction to Physics and Chemistry', 'Science', false, ARRAY[10, 11], 'standard'),
  ('General Chemistry', 'Science', false, ARRAY[10, 11], 'standard'),
  ('AP Chemistry', 'Science', false, ARRAY[11, 12], 'standard'),
  ('General Physics', 'Science', false, ARRAY[11, 12], 'standard'),
  ('Honors Physics', 'Science', false, ARRAY[11, 12], 'standard'),
  ('AP Physics I', 'Science', false, ARRAY[11, 12], 'standard'),
  ('Environmental Science', 'Science', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('AP Environmental Science', 'Science', false, ARRAY[11, 12], 'standard');

-- History/Social Studies courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('Introduction to US History', 'History/Social Studies', false, ARRAY[9], 'standard'),
  ('United States History', 'History/Social Studies', false, ARRAY[10, 11], 'standard'),
  ('AP US History', 'History/Social Studies', false, ARRAY[11, 12], 'standard'),
  ('World History', 'History/Social Studies', false, ARRAY[9, 10], 'standard'),
  ('World Geography', 'History/Social Studies', false, ARRAY[9, 10], 'standard'),
  ('AP World History: Modern', 'History/Social Studies', false, ARRAY[10, 11, 12], 'standard'),
  ('US Government and Civics', 'History/Social Studies', true, ARRAY[11, 12], 'standard'),
  ('Economics', 'History/Social Studies', false, ARRAY[11, 12], 'standard'),
  ('AP European History', 'History/Social Studies', false, ARRAY[11, 12], 'standard'),
  ('Personal Finance', 'History/Social Studies', true, ARRAY[10, 11, 12], 'standard'),
  ('Psychology', 'History/Social Studies', false, ARRAY[11, 12], 'standard'),
  ('AP Psychology', 'History/Social Studies', false, ARRAY[11, 12], 'standard'),
  ('Epic Moments in World History', 'History/Social Studies', false, ARRAY[9, 10, 11, 12], 'standard');

-- Health courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('High School Health', 'Health', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('High School Social & Emotional Health 1', 'Health', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('High School Social & Emotional Health 2', 'Health', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('Medical Terminology', 'Health', false, ARRAY[11, 12], 'standard'),
  ('Physical Education', 'Health', false, ARRAY[9, 10, 11, 12], 'standard');

-- STEM courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('STEM 1: Intro to Coding', 'STEM', false, ARRAY[9, 10], 'standard'),
  ('STEM 2: JavaScript', 'STEM', false, ARRAY[10, 11], 'standard'),
  ('STEM 3: Electronics and Coding', 'STEM', false, ARRAY[11, 12], 'standard'),
  ('Introduction to Java', 'STEM', false, ARRAY[10, 11, 12], 'standard'),
  ('AP Computer Science Principles', 'STEM', false, ARRAY[11, 12], 'standard'),
  ('AP Computer Science A', 'STEM', false, ARRAY[11, 12], 'standard'),
  ('Fundamentals of Design', 'STEM', false, ARRAY[9, 10, 11, 12], 'standard');

-- Fine Arts courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('Music Appreciation', 'Fine Arts', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('AP Music Theory', 'Fine Arts', false, ARRAY[11, 12], 'standard'),
  ('AP Drawing', 'Fine Arts', false, ARRAY[11, 12], 'standard'),
  ('Collaborative Theater', 'Fine Arts', false, ARRAY[9, 10, 11, 12], 'standard');

-- Foreign Language courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('Discover Spanish', 'Foreign Language', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('Discover Portuguese', 'Foreign Language', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('French I', 'Foreign Language', false, ARRAY[9, 10], 'standard'),
  ('French II', 'Foreign Language', false, ARRAY[10, 11], 'standard'),
  ('German I', 'Foreign Language', false, ARRAY[9, 10], 'standard'),
  ('German II', 'Foreign Language', false, ARRAY[10, 11], 'standard'),
  ('Spanish I', 'Foreign Language', false, ARRAY[9, 10], 'standard'),
  ('Spanish II', 'Foreign Language', false, ARRAY[10, 11], 'standard'),
  ('Spanish III', 'Foreign Language', false, ARRAY[11, 12], 'standard'),
  ('American Sign Language', 'Foreign Language', false, ARRAY[9, 10, 11, 12], 'standard');

-- Career & Technical Education courses
INSERT INTO standard_courses (name, category, is_semester, recommended_grade_levels, source)
VALUES
  ('Business Management', 'Career & Technical Education', false, ARRAY[10, 11, 12], 'standard'),
  ('Electrical Technology I', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('Electrical Technology II', 'Career & Technical Education', false, ARRAY[10, 11], 'standard'),
  ('HVAC-R I', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('HVAC-R II', 'Career & Technical Education', false, ARRAY[10, 11], 'standard'),
  ('Info Management I', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('Info Management II', 'Career & Technical Education', false, ARRAY[10, 11], 'standard'),
  ('Medical Terminology', 'Career & Technical Education', false, ARRAY[11, 12], 'standard'),
  ('Plumbing Technology I', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('Plumbing Technology II', 'Career & Technical Education', false, ARRAY[10, 11], 'standard'),
  ('Intro to Accounting', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('Accounting I', 'Career & Technical Education', false, ARRAY[10, 11], 'standard'),
  ('Accounting II', 'Career & Technical Education', false, ARRAY[11, 12], 'standard'),
  ('Principles of Business, Marketing, and Finance', 'Career & Technical Education', false, ARRAY[9, 10, 11], 'standard'),
  ('Investigating Careers', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('College & Career Readiness', 'Career & Technical Education', false, ARRAY[11, 12], 'standard'),
  ('Instructional Standards in Education and Training', 'Career & Technical Education', false, ARRAY[10, 11, 12], 'standard'),
  ('Mastering Microsoft Excel', 'Career & Technical Education', false, ARRAY[9, 10, 11, 12], 'standard'),
  ('Principles of Agriculture', 'Career & Technical Education', false, ARRAY[9, 10], 'standard'),
  ('Agriculture I', 'Career & Technical Education', false, ARRAY[10, 11], 'standard'),
  ('Agriculture II', 'Career & Technical Education', false, ARRAY[11, 12], 'standard'),
  ('Fundamentals of Design', 'Career & Technical Education', false, ARRAY[9, 10, 11, 12], 'standard');
