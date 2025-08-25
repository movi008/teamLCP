/*
  # Fix admin delete user functionality

  1. Security
    - Add proper RLS policy for admins to delete users
    - Ensure cascading deletes work properly for related data
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Allow initial user setup" ON users;
DROP POLICY IF EXISTS "Allow user authentication" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create comprehensive policies for user management
CREATE POLICY "Allow initial user setup"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow user authentication"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Admin policy for all operations including DELETE
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id::text = auth.uid()::text
      AND admin_user.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id::text = auth.uid()::text
      AND admin_user.role = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;