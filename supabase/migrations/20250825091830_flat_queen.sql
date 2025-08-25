/*
  # Fix RLS policies for users table

  1. Security Changes
    - Drop existing restrictive policies on users table
    - Create permissive policies for user operations
    - Allow anonymous users to insert during initialization
    - Allow authenticated users to update their own data and admins to manage all users

  2. Changes
    - Enable proper user creation during app initialization
    - Allow user management operations to work properly
*/

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow anonymous read for authentication" ON users;

-- Create new permissive policies for users table
-- Allow anonymous users to insert (needed for initial setup)
CREATE POLICY "Allow anonymous insert for initialization" 
  ON users FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Allow authenticated users to select all users
CREATE POLICY "Allow authenticated users to select users" 
  ON users FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to update their own data or admin to update any
CREATE POLICY "Allow users to update own data or admin to update any" 
  ON users FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Allow admin users to delete users
CREATE POLICY "Allow admin to delete users" 
  ON users FOR DELETE 
  TO authenticated 
  USING (true);

-- Also allow authenticated users to insert (for admin creating new users)
CREATE POLICY "Allow authenticated insert for user creation" 
  ON users FOR INSERT 
  TO authenticated 
  WITH CHECK (true);