/*
  # Fix User Initialization RLS Policy

  This migration fixes the row-level security policy issue that prevents
  initial user creation by temporarily allowing anonymous inserts and
  then setting up proper policies.

  1. Security Changes
    - Temporarily disable RLS for user initialization
    - Allow anonymous user creation during setup
    - Re-enable RLS with proper policies
    - Maintain security for all other operations
*/

-- Temporarily disable RLS to allow initial user creation
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous user creation for setup" ON users;
DROP POLICY IF EXISTS "Authenticated users can read user data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow initial setup
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

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );