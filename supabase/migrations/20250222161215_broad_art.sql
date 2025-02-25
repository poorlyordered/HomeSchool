/*
  # Fix profiles RLS policies

  1. Changes
    - Add policy to allow users to create their own profile during signup
    - Update select policy to allow viewing own profile

  2. Security
    - Maintains RLS protection
    - Only allows users to create/view their own profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);