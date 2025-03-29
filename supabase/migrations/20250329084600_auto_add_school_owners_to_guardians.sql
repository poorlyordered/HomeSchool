/*
  # Auto-add school owners to school_guardians table

  1. Changes
    - Add existing school owners to school_guardians table
    - Create trigger to automatically add school owners to school_guardians
    - Ensure school owners can always manage their schools

  2. Security
    - Maintain existing security model
    - Ensure school owners always have proper permissions
*/

-- First, add existing school owners to the school_guardians table
INSERT INTO school_guardians (school_id, guardian_id, email, is_registered)
SELECT 
  s.id AS school_id, 
  s.guardian_id, 
  p.email, 
  TRUE AS is_registered
FROM 
  schools s
JOIN 
  profiles p ON s.guardian_id = p.id
WHERE 
  NOT EXISTS (
    SELECT 1 FROM school_guardians sg 
    WHERE sg.school_id = s.id AND sg.guardian_id = s.guardian_id
  );

-- Create a function to automatically add school owners to school_guardians
CREATE OR REPLACE FUNCTION add_school_owner_to_guardians()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new school or the guardian_id has changed
  IF (TG_OP = 'INSERT') OR (OLD.guardian_id IS DISTINCT FROM NEW.guardian_id) THEN
    -- Get the email of the guardian
    DECLARE
      guardian_email TEXT;
    BEGIN
      SELECT email INTO guardian_email FROM profiles WHERE id = NEW.guardian_id;
      
      -- Delete any existing entry for this guardian in this school to avoid conflicts
      DELETE FROM school_guardians 
      WHERE school_id = NEW.id AND guardian_id = NEW.guardian_id;
      
      -- Insert the school owner into school_guardians
      INSERT INTO school_guardians (
        school_id, 
        guardian_id, 
        email, 
        is_registered
      ) VALUES (
        NEW.id, 
        NEW.guardian_id, 
        guardian_email, 
        TRUE
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function whenever a school is created or updated
DROP TRIGGER IF EXISTS ensure_school_owner_in_guardians ON schools;
CREATE TRIGGER ensure_school_owner_in_guardians
AFTER INSERT OR UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION add_school_owner_to_guardians();
