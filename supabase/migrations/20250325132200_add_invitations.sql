/*
  # Add invitation system for guardians and students

  1. Changes
    - Create invitations table
    - Add RLS policies for the new table
    - Add functions for invitation management

  2. Security
    - Maintain RLS protection
    - Secure invitation tokens
    - Proper expiration handling
*/

-- Create the invitations table
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('guardian', 'student')),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  inviter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(email, student_id, role)
);

-- Enable RLS on the new table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for the invitations table
CREATE POLICY "Guardians can view invitations they created"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid() OR
    email = auth.email()
  );

CREATE POLICY "Guardians can create invitations for their students"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (role = 'guardian' AND EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = invitations.student_id
      AND sg.guardian_id = auth.uid()
    )) OR
    (role = 'student' AND EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = invitations.student_id
      AND sg.guardian_id = auth.uid()
    ))
  );

CREATE POLICY "Guardians can update invitations they created"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    inviter_id = auth.uid()
  )
  WITH CHECK (
    inviter_id = auth.uid()
  );

CREATE POLICY "Guardians can delete invitations they created"
  ON invitations
  FOR DELETE
  TO authenticated
  USING (
    inviter_id = auth.uid()
  );

-- Create function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'pending';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically expire old invitations
CREATE TRIGGER check_invitation_expiry
AFTER INSERT OR UPDATE ON invitations
EXECUTE FUNCTION expire_old_invitations();
