/*
  # Fix RLS policies for project creation

  1. Security Updates
    - Update RLS policies to allow proper project creation
    - Ensure authenticated users can insert log entries
    - Fix policy conditions for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can read all log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can update log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can delete log entries" ON log_entries;

-- Create new policies with proper conditions
CREATE POLICY "Users can insert log entries"
  ON log_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all log entries"
  ON log_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update log entries"
  ON log_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete log entries"
  ON log_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Update user_status policies
DROP POLICY IF EXISTS "Users can insert status data" ON user_status;
DROP POLICY IF EXISTS "Users can read all status data" ON user_status;

CREATE POLICY "Users can insert status data"
  ON user_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all status data"
  ON user_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Update users table policies
DROP POLICY IF EXISTS "Allow initial user setup" ON users;
DROP POLICY IF EXISTS "Allow user authentication" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Allow user authentication"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow initial user setup"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

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