/*
  # Add name column to profiles table

  1. Changes
    - Add 'name' column to profiles table
    - Add update policy for profiles table

  2. Security
    - Maintains RLS protection
    - Only allows users to update their own profile
*/

-- Add name column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS name text;

-- Create update policy for profiles
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
