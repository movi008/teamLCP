/*
  # Fix RLS policies for user initialization

  1. Security Updates
    - Drop existing conflicting policies
    - Add policy to allow anonymous users to insert initial users
    - Maintain security for authenticated operations
    - Add proper admin-only policies for user management

  2. Changes
    - Allow anonymous INSERT for initial setup
    - Users can read all user data when authenticated
    - Users can only update their own data
    - Only admins can delete users
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow initial user creation" ON users;
DROP POLICY IF EXISTS "Users can read all user data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Allow anonymous users to insert users (for initial setup)
CREATE POLICY "Allow anonymous user creation for setup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all user data
CREATE POLICY "Authenticated users can read user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow admins to insert new users
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Allow admins to delete users
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );